/**
 * Módulo de integração com HORUSTECH (Companytec)
 * Protocolo DT214 Rev.05
 *
 * Estrutura: >PCCCCX....KK
 *   >     = delimitador
 *   P     = ? (consulta) ou ! (resposta)
 *   CCCC  = tamanho dos dados em HEX (4 chars)
 *   X...  = dados (índice 2 chars + parâmetros)
 *   KK    = checksum (soma ASCII % 256, em HEX 2 chars)
 */

const net = require('net');

const HOST = '127.0.0.1'; // SimuladorCBC local (era 192.168.0.91 em produção)
const PORT = 2001;

// ─── Checksum ────────────────────────────────────────────────────────────────
function checksum(str) {
  let soma = 0;
  for (let i = 0; i < str.length; i++) soma += str.charCodeAt(i);
  return (soma & 0xFF).toString(16).toUpperCase().padStart(2, '0');
}

// ─── Monta comando ───────────────────────────────────────────────────────────
function montarComando(indice, params = '') {
  const dados = indice + params;
  const tamanho = (dados.length).toString(16).toUpperCase().padStart(4, '0');
  const corpo = tamanho + dados;
  const ks = checksum(corpo + '?');
  return `>?${corpo}${ks}`;
}

// ─── Envia comando e aguarda resposta ────────────────────────────────────────
function enviar(cmd, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let resposta = '';

    client.connect(PORT, HOST, () => {
      console.log(`TX: ${cmd}`);
      client.write(cmd);
    });

    client.on('data', (data) => {
      resposta += data.toString('ascii');
      // Aguarda dados completos (termina quando não chega mais nada)
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log(`RX: ${resposta}`);
        client.destroy();
        resolve(resposta);
      }, 200);
    });

    let timer = setTimeout(() => {
      client.destroy();
      if (resposta) resolve(resposta);
      else reject(new Error('Timeout sem resposta'));
    }, timeoutMs);

    client.on('error', reject);
  });
}

// ─── Comandos ─────────────────────────────────────────────────────────────────

// 1. STATUS — retorna estado de todos os bicos
// L=Livre B=Bloqueado A=Abastecendo F=Falha P=Pronto E=Espera
async function status() {
  const cmd = montarComando('01');
  const rx = await enviar(cmd);
  // Resposta: >!CCCC01FFFFFFFF...KK
  const dados = rx.match(/>![\dA-Fa-f]{4}01(.+)/);
  if (!dados) return null;
  const bicos = dados[1].slice(0, -2); // remove checksum final
  return [...bicos].map((estado, i) => ({
    bico: String(i + 1).padStart(2, '0'),
    estado,
    descricao: {
      'L': 'Livre',
      'B': 'Bloqueado',
      'A': 'Abastecendo',
      'F': 'Falha',
      'P': 'Pronto',
      'E': 'Espera',
      '#': 'Ocupado',
      ' ': 'Não configurado',
    }[estado] || 'Desconhecido',
  }));
}

// 2. ABASTECIMENTO — lê o próximo abastecimento finalizado na memória
async function lerAbastecimento() {
  const cmd = montarComando('02');
  const rx = await enviar(cmd);
  const dados = rx.match(/>![\dA-Fa-f]{4}02(.+)/);
  if (!dados || dados[1].length < 4) return null;

  const d = dados[1];
  if (d.length < 50) return { vazio: true };

  const casasT = parseInt(d[16]);
  const casasL = parseInt(d[17]);

  const valorRaw   = parseInt(d.substring(6, 12));
  const volumeRaw  = parseInt(d.substring(12, 18));

  return {
    indice:  d.substring(2, 8),
    bico:    d.substring(8, 10),
    combustivel: d.substring(10, 12),
    tanque:  d.substring(12, 14),
    valor:   (valorRaw  / Math.pow(10, casasT)).toFixed(casasT),
    volume:  (volumeRaw / Math.pow(10, casasL)).toFixed(casasL),
    preco:   d.substring(18, 22),
  };
}

// 3. VISUALIZAÇÃO — valor em tempo real do bico abastecendo
async function visualizacao() {
  const cmd = montarComando('03');
  const rx = await enviar(cmd);
  const dados = rx.match(/>![\dA-Fa-f]{4}03(.+)/);
  if (!dados || dados[1].length < 4) return [];

  const d = dados[1].slice(0, -2);
  const bicos = [];
  for (let i = 0; i < d.length; i += 8) {
    const bico  = d.substring(i, i + 2);
    const valor = d.substring(i + 2, i + 8);
    bicos.push({ bico, valorCentavos: parseInt(valor) });
  }
  return bicos;
}

// 9. PRÉ-DETERMINAÇÃO — autoriza bico com valor máximo (R$)
async function autorizarBico(numeroBico, valorReais) {
  const bico   = String(numeroBico).padStart(2, '0');
  const valor  = String(Math.round(valorReais * 100)).padStart(6, '0'); // em centavos
  const params = `${bico}${valor}00`;  // Z=0 (valor em dinheiro)
  const cmd = montarComando('09', params);
  const rx = await enviar(cmd);
  // Resposta: >!CCCC09CD  C='0'=OK
  const ok = rx.includes('!') && rx.includes('09') && rx.includes('00');
  return { ok, raw: rx };
}

// ─── Teste principal ──────────────────────────────────────────────────────────
async function testar() {
  console.log('\n=== TESTE HORUSTECH ===\n');

  try {
    console.log('--- STATUS DOS BICOS ---');
    const bicos = await status();
    if (bicos) {
      bicos.forEach(b => {
        if (b.estado !== ' ') console.log(`  Bico ${b.bico}: ${b.descricao} (${b.estado})`);
      });
    } else {
      console.log('  Sem resposta no STATUS');
    }
  } catch (e) {
    console.log('  Erro STATUS:', e.message);
  }

  try {
    console.log('\n--- ÚLTIMO ABASTECIMENTO ---');
    const ab = await lerAbastecimento();
    if (ab?.vazio) console.log('  Memória vazia');
    else if (ab) console.log('  ', JSON.stringify(ab, null, 2));
    else console.log('  Sem resposta');
  } catch (e) {
    console.log('  Erro ABASTECIMENTO:', e.message);
  }

  try {
    console.log('\n--- VISUALIZAÇÃO (tempo real) ---');
    const vis = await visualizacao();
    if (vis.length === 0) console.log('  Nenhum bico abastecendo');
    else vis.forEach(b => console.log(`  Bico ${b.bico}: R$ ${b.valorCentavos / 100}`));
  } catch (e) {
    console.log('  Erro VISUALIZAÇÃO:', e.message);
  }

  console.log('\n=== FIM DOS TESTES ===\n');
}

testar();
