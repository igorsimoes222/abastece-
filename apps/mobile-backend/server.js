/**
 * Backend Abastece+ — Protocolo CBC (Companytec)
 *
 * Este arquivo é o "cérebro" da comunicação entre o app e as bombas de combustível.
 * Ele faz duas coisas ao mesmo tempo:
 *   1. Serve uma API HTTP (porta 3334) que o app consome
 *   2. Mantém uma conexão TCP persistente com o concentrador CBC do posto (porta 2001)
 *
 * Para rodar apontando ao concentrador real do posto:
 *   CBC_HOST=192.168.0.91 node server.js
 */

const net  = require('net');
const http = require('http');
const { knex, inicializarBanco } = require('./db');
const { cadastrar, login, verificarToken } = require('./auth');

const CBC_HOST    = process.env.CBC_HOST || '127.0.0.1'; // IP do concentrador (env ou simulador local)
const CBC_PORT    = parseInt(process.env.CBC_PORT || '2001');
const SERVER_PORT = 3334;

// ─── Conexão TCP persistente ao concentrador CBC ──────────────────────────────
//
// O concentrador CBC aceita apenas UMA conexão TCP por vez.
// Por isso mantemos o socket aberto e enfileiramos os comandos — nunca abrimos
// uma nova conexão por requisição.

let cbcSocket    = null;  // socket TCP ativo
let cbcConnected = false; // flag de conexão
let cmdQueue     = [];    // fila de comandos aguardando envio
let processing   = false; // mutex: só um comando por vez

function cbcConnect() {
  if (cbcConnected) return;
  const sock = new net.Socket();
  sock.connect(CBC_PORT, CBC_HOST, () => {
    cbcSocket    = sock;
    cbcConnected = true;
    console.log('  [CBC] Conectado em ' + CBC_HOST + ':' + CBC_PORT);
    processQueue(); // inicia fila assim que conectar
  });
  sock.on('error', (e) => {
    cbcConnected = false;
    cbcSocket    = null;
    console.log('  [CBC] Erro: ' + e.message + ' — reconectando em 5s');
    setTimeout(cbcConnect, 5000);
  });
  sock.on('close', () => {
    cbcConnected = false;
    cbcSocket    = null;
    console.log('  [CBC] Conexao encerrada — reconectando em 5s');
    setTimeout(cbcConnect, 5000);
  });
}

// Processa um comando da fila por vez (mutex simples)
function processQueue() {
  if (processing || cmdQueue.length === 0 || !cbcConnected) return;
  processing = true;
  const { cmd, resolve, reject } = cmdQueue.shift();
  let buf = '';
  let timer;

  // Acumula dados recebidos e aguarda 400ms de silêncio para considerar resposta completa
  const onData = (data) => {
    buf += data.toString('ascii');
    clearTimeout(timer);
    timer = setTimeout(done, 400);
  };

  const done = () => {
    cbcSocket.removeListener('data', onData);
    processing = false;
    resolve(buf);
    processQueue(); // processa próximo da fila
  };

  // Timeout de 3s: se não chegar nada, resolve com o que tiver (ou rejeita)
  timer = setTimeout(() => {
    cbcSocket.removeListener('data', onData);
    processing = false;
    if (buf) resolve(buf);
    else reject(new Error('Timeout CBC'));
    processQueue();
  }, 3000);

  cbcSocket.on('data', onData);
  cbcSocket.write(cmd); // envia o comando ao concentrador
}

// Enfileira um comando e retorna uma Promise com a resposta
function cbcCmd(cmd) {
  return new Promise((resolve, reject) => {
    if (!cbcConnected) return reject(new Error('CBC nao conectado'));
    cmdQueue.push({ cmd, resolve, reject });
    processQueue();
  });
}

cbcConnect(); // inicia conexão ao subir o servidor

// ─── Comandos CBC ─────────────────────────────────────────────────────────────

// buildCbcMap: monta dicionário inverso para traduzir endereço lógico CBC → bico físico
// Necessário porque o CBC identifica bicos pelo endereço hex (ex: 4D = 77 decimal)
// mas o posto etiqueta fisicamente como "bico 09".
// Exemplo: { 77: '09' } significa que o CBC endereço 4D (77) é o bico físico 09.
async function buildCbcMap() {
  const rows = await knex('bicos').whereNotNull('numero_cbc').select('numero', 'numero_cbc');
  const map = {};
  for (const r of rows) {
    const dec = parseInt(r.numero_cbc, 16); // converte "4D" → 77
    map[dec] = String(r.numero).padStart(2, '0'); // 77 → '09'
  }
  return map;
}

// cmdVisualizacao: lê valores em tempo real de todos os bicos abastecendo
// Envia (&V) ao concentrador.
// Resposta: grupos de 8 chars — <bico2hex><valor6decimal>
// Exemplo: "(09001041)" = bico 09 (hex), R$10,41 (6 dígitos em centavos)
// Exemplo: "(0400072909001041)" = dois bicos simultâneos (bico 04 e bico 09)
async function cmdVisualizacao() {
  const rx = await cbcCmd('(&V)');
  console.log('  [VIS] raw (&V):', JSON.stringify(rx));
  if (!rx || rx.trim() === '(0)' || rx.trim() === '') return [];
  const m = rx.match(/\((.+)\)/);
  if (!m) return [];
  const d = m[1];
  const cbcMap = await buildCbcMap(); // tradução endereço CBC → bico físico
  const bicos = [];
  for (let i = 0; i + 8 <= d.length; i += 8) {
    const bicoHex = d.substring(i, i + 2);           // ex: "4D" ou "09"
    const bicoDec = parseInt(bicoHex, 16);            // ex: 77 ou 9
    const bico    = cbcMap[bicoDec] ?? String(bicoDec).padStart(2, '0'); // traduz ou usa decimal
    const cents   = parseInt(d.substring(i + 2, i + 8)) || 0; // ex: 001041 = 1041 centavos
    if (cents > 0) bicos.push({ bico, valor: (cents / 100).toFixed(2) }); // ex: { bico: '09', valor: '10.41' }
  }
  return bicos;
}

// calcChecksum: calcula o KK do protocolo CBC
// KK = soma dos valores ASCII de todos os chars do conteúdo, low byte, em hex maiúsculo 2 dígitos
// Exemplo: "&P4D001000" → soma dos ASCII → & 38 + P 80 + 4 52 + D 68 + ... → mod 256 → "0F"
function calcChecksum(conteudo) {
  let soma = 0;
  for (let i = 0; i < conteudo.length; i++) soma += conteudo.charCodeAt(i);
  return (soma & 0xFF).toString(16).toUpperCase().padStart(2, '0');
}

// cmdPreset: programa a bomba com um valor máximo em reais
// Este é o comando principal — define quanto a bomba pode dispensar.
// A bomba para automaticamente ao atingir o valor, sem intervenção do frentista.
//
// Formato do comando: (&P<BB><VVVVVV><KK>)
//   BB     = endereço hex do bico no CBC (ex: "4D" para bico 09 neste posto)
//   VVVVVV = valor em centavos, 6 dígitos (ex: "001000" = R$10,00)
//   KK     = checksum
//
// Exemplo: (&P4D0010000F) → programa bico 4D com R$10,00
// Resposta do concentrador: (P4D) = aceito | (P?t) = rejeitado
async function cmdPreset(bicoHex, valorCentavos) {
  const bHex     = String(bicoHex).toUpperCase().padStart(2, '0');
  const valorStr = String(Math.round(valorCentavos)).padStart(6, '0');
  const conteudo = '&P' + bHex + valorStr;
  const kk       = calcChecksum(conteudo);
  const cmd      = '(' + conteudo + kk + ')';
  console.log('  [CBC] Preset:', cmd, '→ bico', bHex, 'valor', valorCentavos, 'cts');
  const rx = await cbcCmd(cmd);
  console.log('  [CBC] Preset resp:', JSON.stringify(rx));
  return rx;
}

// cmdAutorizarBico: libera o bico sem limite de valor (free-run)
// Usado como fallback quando o concentrador não suporta (&P) — ex: simulador.
// No simulador, (&P) é rejeitado com "(P?t)", então cai aqui.
//
// Formato: (&T<BB>$<KK>)
//   BB = endereço hex do bico
//   $  = indica modo por valor (sem limite real — o CBC libera livremente)
async function cmdAutorizarBico(bicoHex) {
  const bHex     = String(bicoHex).toUpperCase().padStart(2, '0');
  const conteudo = '&T' + bHex + '$';
  const kk       = calcChecksum(conteudo);
  const cmd      = '(' + conteudo + kk + ')';
  console.log('  [CBC] AutorizarBico:', cmd, '→ bico', bicoHex);
  const rx = await cbcCmd(cmd);
  console.log('  [CBC] AutorizarBico resp:', JSON.stringify(rx));
  return rx;
}

// cmdAbastecimento: lê o próximo registro de abastecimento finalizado da fila (&A)
// O concentrador mantém uma fila FIFO de registros. (&A) lê sem consumir.
// (&I) avança o ponteiro (consome o registro lido).
//
// Formato do registro DT435 (50 chars dentro dos parênteses):
//   T[06] = total pago (centavos com casas decimais definidas por V)
//   L[06] = volume abastecido
//   P[04] = preço por litro
//   V[02] = código de vírgula (hex) — define casas decimais de T, L e P
//   C[04] = tempo de abastecimento (ignorado)
//   B[02] = endereço hex do bico no CBC
//   D[02] = dia, H[02] = hora, M[02] = minuto, N[02] = mês
//
// Exemplo: "(00500000821060903E002D45...)"
//   005000 = 5000 → R$50,00 (2 casas pelo código V)
//   008210 = 8210 → 8,210 litros
//   6090   = 6090 → R$6,090/L
async function cmdAbastecimento() {
  const rx = await cbcCmd('(&A)');
  console.log('  [CBC] (&A) raw:', JSON.stringify(rx));
  if (!rx || rx.trim() === '(0)' || rx.trim() === '') return { vazio: true };
  const m = rx.match(/\((.+)\)/);
  if (!m || m[1].length < 34) return { vazio: true };
  const d = m[1];

  const totalRaw  = parseInt(d.substring(0,  6))  || 0;  // T[06] total
  const volumeRaw = parseInt(d.substring(6,  12)) || 0;  // L[06] volume
  const precoRaw  = parseInt(d.substring(12, 16)) || 0;  // P[04] preço
  const virgula   = parseInt(d.substring(16, 18), 16) || 0; // V[02] código de vírgula
  // C[04] = d[18:22] — tempo (ignorado)
  const bicoHex   = d.substring(22, 24);                 // B[02] endereço hex do bico
  const dia       = d.substring(24, 26);
  const hora      = d.substring(26, 28);
  const minuto    = d.substring(28, 30);
  const mes       = d.substring(30, 32);

  // Decodifica casas decimais a partir do código de vírgula
  const casasTotal  = (virgula >> 0) & 0x03;  // bits 0-1 = casas do total
  const casasVolume = (virgula >> 2) & 0x03;  // bits 2-3 = casas do volume
  const casasPreco  = (virgula >> 4) & 0x03;  // bits 4-5 = casas do preço

  // Traduz endereço CBC → bico físico usando o mapa inverso
  const bicoDec = parseInt(bicoHex, 16);
  const cbcMap  = await buildCbcMap();
  const bico    = cbcMap[bicoDec] ?? String(bicoDec).padStart(2, '0');

  return {
    bico,
    valor:  (totalRaw  / Math.pow(10, casasTotal)).toFixed(casasTotal),
    volume: (volumeRaw / Math.pow(10, casasVolume)).toFixed(casasVolume),
    preco:  (precoRaw  / Math.pow(10, casasPreco)).toFixed(casasPreco),
    data:   dia + '/' + mes + ' ' + hora + ':' + minuto,
  };
}

// cmdIncrementar: avança o ponteiro de leitura do buffer (&A)
// Deve ser chamado após processar um registro para "consumi-lo" da fila.
async function cmdIncrementar() {
  try { await cbcCmd('(&I)'); } catch {}
}

// cmdStatus: lê o estado atual de todos os bicos do concentrador
// Resposta: (S<estados>) onde cada char representa um bico (F=livre, T=autorizando, A=abastecendo...)
// O firmware do concentrador adiciona versão ao final (ex: "V3.7M1.0G78") — deve ser removida.
async function cmdStatus() {
  try {
    const rx = await cbcCmd('(&S)');
    console.log('  [STS] raw (&S):', JSON.stringify(rx));
    const m = rx.match(/\(S(.+)\)/);
    if (!m) return [];
    const payload = m[1].replace(/V\d.*$/, ''); // remove versão do firmware do final
    const estadosValidos = new Set(['F','E','T','A','C','B','X','D']);
    return [...payload].map((estado, i) => ({
      numero: String(i + 1).padStart(2, '0'),
      estado,
    })).filter(b => estadosValidos.has(b.estado) && b.estado !== 'F');
  } catch { return []; }
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────

function json(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(body);
}

function bodyJson(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', d => raw += d);
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); }
      catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE',
    });
    return res.end();
  }

  const url = req.url.split('?')[0];
  console.log('[' + new Date().toLocaleTimeString() + '] ' + req.method + ' ' + url);

  try {
    // GET /ping — verifica se backend e CBC estão online
    if (req.method === 'GET' && url === '/ping') {
      return json(res, { ok: true, cbc: CBC_HOST + ':' + CBC_PORT, conectado: cbcConnected });
    }

    // GET /status — retorna bicos ativos no concentrador via (&S)
    if (req.method === 'GET' && url === '/status') {
      const bicos = await cmdStatus();
      return json(res, { ok: true, bicos });
    }

    // GET /visualizacao?bico=09 — valor em tempo real via (&V)
    // Retorna { abastecendo: [{bico, valor}], concluido: bool }
    // Se (&V) vazio mas (&A) tem registro do bico → concluido: true
    if (req.method === 'GET' && url.startsWith('/visualizacao')) {
      try {
        const bicoParam = new URL('http://x' + req.url).searchParams.get('bico');
        const bicoAlvo  = bicoParam ? String(bicoParam).padStart(2, '0') : null;

        const abastecendo = await cmdVisualizacao();
        if (abastecendo.length > 0) {
          console.log('  [VIS] bicos ativos:', JSON.stringify(abastecendo));
          return json(res, { ok: true, abastecendo, concluido: false });
        }

        // (&V) vazio: faz peek no (&A) sem consumir para detectar conclusão
        if (bicoAlvo) {
          const candidato = await cmdAbastecimento();
          if (!candidato.vazio) {
            const bicoCandidato = String(candidato.bico ?? '').padStart(2, '0');
            if (bicoCandidato === bicoAlvo) {
              console.log('  [VIS] Concluído detectado via (&A) para bico', bicoAlvo);
              return json(res, { ok: true, abastecendo: [], concluido: true });
            }
          }
        }

        return json(res, { ok: true, abastecendo: [], concluido: false });
      } catch {
        return json(res, { ok: true, abastecendo: [], concluido: false });
      }
    }

    // GET /postos/:id — dados do posto com preços dos combustíveis
    if (req.method === 'GET' && url.startsWith('/postos/')) {
      const id = parseInt(url.split('/')[2]) || 2;
      const posto = await knex('postos').where({ id }).first();
      if (!posto) return json(res, { ok: false, erro: 'Posto não encontrado' }, 404);
      return json(res, { ok: true, posto });
    }

    // GET /abastecimento?bico=09 — registro finalizado via (&A)
    // Varre a fila até encontrar o bico solicitado, consumindo com (&I).
    // Registros de outros bicos são descartados (avança sem guardar).
    if (req.method === 'GET' && url.startsWith('/abastecimento')) {
      try {
        const bicoParam = new URL('http://x' + req.url).searchParams.get('bico');
        const bicoAlvo  = bicoParam ? String(bicoParam).padStart(2, '0') : null;

        let dados = null;
        const MAX_TENTATIVAS = 20;

        for (let i = 0; i < MAX_TENTATIVAS; i++) {
          const candidato = await cmdAbastecimento();
          if (candidato.vazio) break;

          const bicoCandidato = String(candidato.bico ?? '').padStart(2, '0');

          if (!bicoAlvo || bicoCandidato === bicoAlvo) {
            dados = candidato;
            await cmdIncrementar(); // consome o registro da fila
            break;
          }

          console.log('  [A] bico ' + bicoCandidato + ' ignorado (buscando ' + bicoAlvo + ')');
          await cmdIncrementar(); // descarta registro de outro bico e continua
        }

        if (!dados) return json(res, { ok: true, vazio: true });

        // Salva resultado no banco de dados
        await knex('abastecimentos')
          .where({ status: 'aguardando', bico_numero: dados.bico })
          .orderBy('id', 'desc')
          .limit(1)
          .update({
            valor_cobrado:   parseFloat(dados.valor)  || 0,
            volume_litros:   parseFloat(dados.volume) || 0,
            preco_litro:     parseFloat(dados.preco)  || 0,
            cashback_gerado: parseFloat(dados.valor) * 0.01,
            status:          'concluido',
            concluido_em:    new Date().toISOString(),
          });

        return json(res, { ok: true, ...dados });
      } catch (e) {
        console.error('  [A] erro:', e.message);
        return json(res, { ok: true, vazio: true });
      }
    }

    // GET /historico — lista últimos 50 abastecimentos
    if (req.method === 'GET' && url === '/historico') {
      const lista = await knex('abastecimentos').orderBy('created_at', 'desc').limit(50);
      return json(res, { ok: true, total: lista.length, itens: lista });
    }

    // POST /autorizar — ponto de entrada principal do fluxo de abastecimento
    // 1. Salva abastecimento no banco com status 'aguardando'
    // 2. Limpa registros antigos do bico no buffer (&A)
    // 3. Resolve endereço CBC do bico (numero_cbc do banco ou conversão padrão)
    // 4. Tenta (&P) preset — se aceito, bomba fica programada com valor máximo
    //    Se rejeitado (simulador), usa (&T) free-run como fallback
    if (req.method === 'POST' && url === '/autorizar') {
      const body = await bodyJson(req);
      const { bico, valor, usuario_id, posto_id } = body;
      if (!bico || !valor) return json(res, { ok: false, erro: 'bico e valor obrigatorios' }, 400);

      const cicloId = 'ciclo_' + bico + '_' + Date.now();
      const [id] = await knex('abastecimentos').insert({
        usuario_id:       usuario_id || null,
        posto_id:         posto_id   || null,
        bico_numero:      bico,
        valor_autorizado: parseFloat(valor),
        ciclo_id:         cicloId,
        status:           'aguardando',
        iniciado_em:      new Date().toISOString(),
      });

      // Limpa registros antigos do bico no buffer (&A) para não pegar dado de sessão anterior
      try {
        for (let i = 0; i < 20; i++) {
          const old = await cmdAbastecimento();
          if (old.vazio) break;
          if (String(old.bico ?? '').padStart(2,'0') === String(bico).padStart(2,'0')) {
            await cmdIncrementar();
            console.log('  [A] registro antigo do bico', bico, 'descartado');
          } else {
            break;
          }
        }
      } catch {}

      // Resolve endereço CBC: usa numero_cbc do banco se cadastrado, senão converte decimal→hex
      // Exemplo: bico "09" com numero_cbc="4D" → usa "4D" nos comandos CBC
      const bicoDB = await knex('bicos').where({ numero: String(bico).padStart(2, '0') }).first();
      const bicoHexCbc = bicoDB?.numero_cbc
        ? String(bicoDB.numero_cbc).toUpperCase().padStart(2, '0')
        : parseInt(bico, 10).toString(16).toUpperCase().padStart(2, '0');
      console.log('  [CBC] Bico', bico, '→ endereço CBC:', bicoHexCbc, bicoDB?.numero_cbc ? '(numero_cbc do banco)' : '(conversão padrão)');

      let presetOk = false;
      try {
        const valorCentavos = Math.round(parseFloat(valor) * 100);
        const presetResp = await cmdPreset(bicoHexCbc, valorCentavos);
        const presetAceito = presetResp && !presetResp.includes('?') && presetResp.includes('P');
        if (presetAceito) {
          presetOk = true;
          console.log('  [CBC] Preset aceito (hardware real):', presetResp.trim());
        } else {
          // Fallback para simulador ou concentradores que não suportam (&P)
          await cmdAutorizarBico(bicoHexCbc);
          presetOk = true;
          console.log('  [CBC] Fallback para (&T) free-run');
        }
      } catch (e) {
        console.error('  [CBC] Autorizar falhou:', e.message);
      }

      return json(res, { ok: true, cicloId, abastecimentoId: id, bico, valor, presetOk });
    }

    // POST /incrementar — avança ponteiro (&I) manualmente (uso administrativo)
    if (req.method === 'POST' && url === '/incrementar') {
      await cmdIncrementar();
      return json(res, { ok: true });
    }

    // ── AUTH ──────────────────────────────────────────────────────────────────

    if (req.method === 'POST' && url === '/auth/cadastro') {
      const body = await bodyJson(req);
      const resultado = await cadastrar(body);
      return json(res, { ok: true, ...resultado }, 201);
    }

    if (req.method === 'POST' && url === '/auth/login') {
      const body = await bodyJson(req);
      const resultado = await login(body);
      return json(res, { ok: true, ...resultado });
    }

    if (req.method === 'GET' && url === '/auth/me') {
      const payload = verificarToken(req.headers['authorization']);
      const usuario = await knex('usuarios').where({ id: payload.id }).first();
      if (!usuario) return json(res, { ok: false, erro: 'Usuario nao encontrado' }, 404);
      const { senha_hash, ...seguro } = usuario;
      return json(res, { ok: true, usuario: seguro });
    }

    if (req.method === 'POST' && url === '/auth/trocar-senha') {
      const payload = verificarToken(req.headers['authorization']);
      const body = await bodyJson(req);
      const { senhaAtual, senhaNova } = body;
      if (!senhaAtual || !senhaNova) throw { status: 400, mensagem: 'Preencha todos os campos' };
      if (senhaNova.length < 8) throw { status: 400, mensagem: 'Nova senha deve ter no minimo 8 caracteres' };
      const usuario = await knex('usuarios').where({ id: payload.id }).first();
      if (!usuario) throw { status: 404, mensagem: 'Usuario nao encontrado' };
      const bcrypt = require('bcryptjs');
      const senhaOk = await bcrypt.compare(senhaAtual, usuario.senha_hash);
      if (!senhaOk) throw { status: 401, mensagem: 'Senha atual incorreta' };
      const novoHash = await bcrypt.hash(senhaNova, 10);
      await knex('usuarios').where({ id: payload.id }).update({ senha_hash: novoHash });
      return json(res, { ok: true, mensagem: 'Senha alterada com sucesso' });
    }

    if (req.method === 'PATCH' && url === '/auth/perfil') {
      const payload = verificarToken(req.headers['authorization']);
      const body = await bodyJson(req);
      const { nome, telefone } = body;
      if (!nome) throw { status: 400, mensagem: 'Nome e obrigatorio' };
      await knex('usuarios').where({ id: payload.id }).update({ nome, telefone: telefone ?? null });
      const usuario = await knex('usuarios').where({ id: payload.id }).first();
      const { senha_hash, ...seguro } = usuario;
      return json(res, { ok: true, usuario: seguro });
    }

    // ── BICOS ─────────────────────────────────────────────────────────────────

    // POST /bico/validar — valida o código do adesivo colado na bomba
    // O cliente digita o número do bico + código do adesivo no app
    if (req.method === 'POST' && url === '/bico/validar') {
      const body = await bodyJson(req);
      const numero = String(body.numero ?? '').trim().padStart(2, '0');
      const codigo = String(body.codigo ?? '').trim().toUpperCase();
      if (!numero || !codigo) throw { status: 400, mensagem: 'Numero e codigo sao obrigatorios' };
      const bico = await knex('bicos').where({ numero, codigo_adesivo: codigo }).whereNot({ ativo: 0 }).first();
      if (!bico) return json(res, { ok: false, mensagem: 'Codigo invalido para este bico' }, 400);
      return json(res, { ok: true, bico: { numero: bico.numero, combustivel: bico.combustivel } });
    }

    // GET /admin/bicos — lista todos os bicos cadastrados
    if (req.method === 'GET' && url === '/admin/bicos') {
      const lista = await knex('bicos').orderBy('numero');
      return json(res, { ok: true, total: lista.length, bicos: lista });
    }

    // POST /admin/bicos — cadastra ou atualiza um bico
    if (req.method === 'POST' && url === '/admin/bicos') {
      const body = await bodyJson(req);
      const numero = String(body.numero ?? '').padStart(2, '0');
      const codigo = String(body.codigo ?? '').toUpperCase();
      if (!numero || !codigo) throw { status: 400, mensagem: 'numero e codigo sao obrigatorios' };
      const existente = await knex('bicos').where({ numero }).first();
      if (existente) {
        await knex('bicos').where({ numero }).update({
          codigo_adesivo: codigo,
          combustivel: body.combustivel ?? existente.combustivel,
          ativo: true,
        });
      } else {
        await knex('bicos').insert({
          posto_id: null,
          numero,
          codigo_adesivo: codigo,
          combustivel: body.combustivel ?? 'Gasolina Comum',
          ativo: 1,
        });
      }
      return json(res, { ok: true, numero, codigo });
    }

    // ── ADMIN ─────────────────────────────────────────────────────────────────

    if (req.method === 'GET' && url === '/admin/usuarios') {
      const lista = await knex('usuarios').select('id','nome','email','perfil','cashback_saldo','created_at');
      return json(res, { ok: true, total: lista.length, usuarios: lista });
    }

    // ── CARTEIRA ──────────────────────────────────────────────────────────────

    if (req.method === 'GET' && url === '/carteira/resumo') {
      const payload = verificarToken(req.headers['authorization']);
      const usuario = await knex('usuarios').where({ id: payload.id }).first();
      const totalAb = await knex('abastecimentos').where({ usuario_id: payload.id, status: 'concluido' }).count('id as n').first();
      const somaGas = await knex('abastecimentos').where({ usuario_id: payload.id, status: 'concluido' }).sum('valor_cobrado as total').first();
      return json(res, {
        ok: true,
        cashbackAcumulado:   parseFloat(usuario.cashback_saldo || 0).toFixed(2),
        totalAbastecimentos: totalAb.n || 0,
        totalGasto:          parseFloat(somaGas.total || 0).toFixed(2),
        percentualCashback:  '1',
      });
    }

    if (req.method === 'GET' && url.startsWith('/carteira/extrato')) {
      const payload = verificarToken(req.headers['authorization']);
      const lista   = await knex('abastecimentos').where({ usuario_id: payload.id }).orderBy('created_at', 'desc').limit(30);
      const extrato = lista.map(a => ({
        id:       a.id,
        tipo:     'abastecimento',
        data:     new Date(a.created_at).toLocaleDateString('pt-BR'),
        desc:     'Bico #' + a.bico_numero,
        valor:    '-R$ ' + parseFloat(a.valor_cobrado || 0).toFixed(2),
        cashback: a.cashback_gerado ? '+R$ ' + parseFloat(a.cashback_gerado).toFixed(2) : null,
        status:   a.status,
      }));
      return json(res, { ok: true, extrato });
    }

    json(res, { erro: 'Rota nao encontrada' }, 404);

  } catch (err) {
    const mensagem = err.mensagem ?? err.message ?? 'Erro interno';
    const status   = err.status  ?? 500;
    console.error('Erro:', mensagem);
    json(res, { ok: false, mensagem }, status);
  }
});

inicializarBanco().catch(console.error);

server.listen(SERVER_PORT, () => {
  console.log('Abastece+ Backend rodando na porta ' + SERVER_PORT);
  console.log('CBC configurado: ' + CBC_HOST + ':' + CBC_PORT);

  // Anuncia o backend na rede local via mDNS
  // O app se conecta por "abasteceplus.local" sem precisar saber o IP
  try {
    const { Bonjour } = require('bonjour-service');
    const bonjour = new Bonjour();
    bonjour.publish({ name: 'Abastece+ Backend', type: 'http', port: SERVER_PORT });
    console.log('mDNS ativo — acessível em: abasteceplus.local:' + SERVER_PORT);
  } catch (e) {
    console.warn('mDNS indisponível:', e.message);
  }
});
