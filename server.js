/**
 * Backend Abastece+ — Protocolo CBC (Companytec)
 * Conexao TCP persistente ao concentrador real no posto
 *
 * Para apontar para o concentrador real, defina:
 *   CBC_HOST=192.168.x.x node server.js
 */

const net  = require('net');
const http = require('http');
const { knex, inicializarBanco } = require('./db');
const { cadastrar, login, verificarToken } = require('./auth');

const CBC_HOST    = process.env.CBC_HOST || '127.0.0.1';
const CBC_PORT    = parseInt(process.env.CBC_PORT || '2001');
const SERVER_PORT = 3334;

// ─── Conexao TCP persistente ao concentrador CBC ──────────────────────────────

let cbcSocket    = null;
let cbcConnected = false;
let cmdQueue     = [];
let processing   = false;

function cbcConnect() {
  if (cbcConnected) return;
  const sock = new net.Socket();
  sock.connect(CBC_PORT, CBC_HOST, () => {
    cbcSocket    = sock;
    cbcConnected = true;
    console.log('  [CBC] Conectado em ' + CBC_HOST + ':' + CBC_PORT);
    processQueue();
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

function processQueue() {
  if (processing || cmdQueue.length === 0 || !cbcConnected) return;
  processing = true;
  const { cmd, resolve, reject } = cmdQueue.shift();
  let buf = '';
  let timer;

  const onData = (data) => {
    buf += data.toString('ascii');
    clearTimeout(timer);
    timer = setTimeout(done, 400);
  };

  const done = () => {
    cbcSocket.removeListener('data', onData);
    processing = false;
    resolve(buf);
    processQueue();
  };

  timer = setTimeout(() => {
    cbcSocket.removeListener('data', onData);
    processing = false;
    if (buf) resolve(buf);
    else reject(new Error('Timeout CBC'));
    processQueue();
  }, 3000);

  cbcSocket.on('data', onData);
  cbcSocket.write(cmd);
}

function cbcCmd(cmd) {
  return new Promise((resolve, reject) => {
    if (!cbcConnected) return reject(new Error('CBC nao conectado'));
    cmdQueue.push({ cmd, resolve, reject });
    processQueue();
  });
}

cbcConnect();

// ─── Comandos CBC ─────────────────────────────────────────────────────────────

async function cmdVisualizacao() {
  const rx = await cbcCmd('(&V)');
  if (!rx || rx.trim() === '(0)' || rx.trim() === '') return [];
  // Formato: (<bico2><valor6>...) — sem identificador V, grupos de 8 chars
  const m = rx.match(/\((.+)\)/);
  if (!m) return [];
  const d = m[1];
  const bicos = [];
  for (let i = 0; i + 8 <= d.length; i += 8) {
    const bicoHex = d.substring(i, i + 2);
    const bico    = parseInt(bicoHex, 16).toString().padStart(2, '0');
    const cents   = parseInt(d.substring(i + 2, i + 8)) || 0;
    if (cents > 0) bicos.push({ bico, valor: (cents / 100).toFixed(2) });
  }
  return bicos;
}

// Calcula checksum CBC: soma ASCII dos chars apos '(' ate antes de KK, low byte em hex 2 chars
function calcChecksum(conteudo) {
  let soma = 0;
  for (let i = 0; i < conteudo.length; i++) soma += conteudo.charCodeAt(i);
  return (soma & 0xFF).toString(16).toUpperCase().padStart(2, '0');
}

// Comando Preset (&P): autoriza bico para valor maximo
// bicoDecimal: numero decimal do bico (ex: 9, 13) — converte para hex
// valorCentavos: valor em centavos (ex: 5000 = R$50,00)
async function cmdPreset(bicoDecimal, valorCentavos) {
  const bicoHex   = parseInt(bicoDecimal, 10).toString(16).toUpperCase().padStart(2, '0');
  const valorStr  = String(Math.round(valorCentavos)).padStart(6, '0');
  const conteudo  = '&P' + bicoHex + valorStr;
  const kk        = calcChecksum(conteudo);
  const cmd       = '(' + conteudo + kk + ')';
  console.log('  [CBC] Preset:', cmd, '→ bico', bicoHex, 'valor', valorCentavos, 'cts');
  const rx = await cbcCmd(cmd);
  console.log('  [CBC] Preset resp:', JSON.stringify(rx));
  return rx;
}

// Formato DT435 (&A): TTTTTTLLLLLLPPPPVVCCCCBBDDHHMMNNRRRREEEEEEEEEESKK (50 chars)
// V = codigo de virgula (hex): bits 0-1=casas do total, bits 2-3=casas do volume, bits 4-5=casas do preco
async function cmdAbastecimento() {
  const rx = await cbcCmd('(&A)');
  console.log('  [CBC] (&A) raw:', JSON.stringify(rx));
  if (!rx || rx.trim() === '(0)' || rx.trim() === '') return { vazio: true };
  const m = rx.match(/\((.+)\)/);
  if (!m || m[1].length < 34) return { vazio: true };
  const d = m[1];

  const totalRaw  = parseInt(d.substring(0,  6))  || 0;  // T[06] total a pagar
  const volumeRaw = parseInt(d.substring(6,  12)) || 0;  // L[06] volume abastecido
  const precoRaw  = parseInt(d.substring(12, 16)) || 0;  // P[04] preco unitario
  const virgula   = parseInt(d.substring(16, 18), 16) || 0; // V[02] codigo de virgula (hex)
  // C[04] = d[18:22] — tempo (ignorado aqui)
  const bicoHex   = d.substring(22, 24);                 // B[02] codigo do bico (hex)
  const dia       = d.substring(24, 26);                 // D[02]
  const hora      = d.substring(26, 28);                 // H[02]
  const minuto    = d.substring(28, 30);                 // M[02]
  const mes       = d.substring(30, 32);                 // N[02]

  const casasTotal  = (virgula >> 0) & 0x03;  // bits 0-1
  const casasVolume = (virgula >> 2) & 0x03;  // bits 2-3
  const casasPreco  = (virgula >> 4) & 0x03;  // bits 4-5

  const bico = parseInt(bicoHex, 16).toString().padStart(2, '0');
  return {
    bico,
    valor:  (totalRaw  / Math.pow(10, casasTotal)).toFixed(casasTotal),
    volume: (volumeRaw / Math.pow(10, casasVolume)).toFixed(casasVolume),
    preco:  (precoRaw  / Math.pow(10, casasPreco)).toFixed(casasPreco),
    data:   dia + '/' + mes + ' ' + hora + ':' + minuto,
  };
}

async function cmdIncrementar() {
  try { await cbcCmd('(&I)'); } catch {}
}

async function cmdStatus() {
  try {
    const rx = await cbcCmd('(&S)');
    const m = rx.match(/\(S(.+)\)/);
    if (!m) return [];
    return [...m[1]].map((estado, i) => ({
      numero: String(i + 1).padStart(2, '0'),
      estado,
    })).filter(b => b.estado !== 'F' && b.estado !== ' ');
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
    // GET /ping
    if (req.method === 'GET' && url === '/ping') {
      return json(res, { ok: true, cbc: CBC_HOST + ':' + CBC_PORT, conectado: cbcConnected });
    }

    // GET /status
    if (req.method === 'GET' && url === '/status') {
      const bicos = await cmdStatus();
      return json(res, { ok: true, bicos });
    }

    // GET /visualizacao — valor em tempo real via (&V)
    if (req.method === 'GET' && url === '/visualizacao') {
      try {
        const abastecendo = await cmdVisualizacao();
        if (abastecendo.length > 0) console.log('  [VIS] bicos ativos:', JSON.stringify(abastecendo));
        return json(res, { ok: true, abastecendo });
      } catch {
        return json(res, { ok: true, abastecendo: [] });
      }
    }

    // GET /postos/:id — dados do posto com preços
    if (req.method === 'GET' && url.startsWith('/postos/')) {
      const id = parseInt(url.split('/')[2]) || 2;
      const posto = await knex('postos').where({ id }).first();
      if (!posto) return json(res, { ok: false, erro: 'Posto não encontrado' }, 404);
      return json(res, { ok: true, posto });
    }

    // GET /abastecimento — registro finalizado via (&A)
    if (req.method === 'GET' && url === '/abastecimento') {
      try {
        const dados = await cmdAbastecimento();
        if (!dados.vazio && dados.valor) {
          await knex('abastecimentos')
            .where({ status: 'aguardando' })
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
        }
        return json(res, { ok: true, ...dados });
      } catch {
        return json(res, { ok: true, vazio: true });
      }
    }

    // GET /historico
    if (req.method === 'GET' && url === '/historico') {
      const lista = await knex('abastecimentos').orderBy('created_at', 'desc').limit(50);
      return json(res, { ok: true, total: lista.length, itens: lista });
    }

    // POST /autorizar — salva no banco e envia Preset (&P) ao concentrador
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

      // Envia Preset ao concentrador CBC para autorizar o bico
      let presetOk = false;
      try {
        const valorCentavos = Math.round(parseFloat(valor) * 100);
        await cmdPreset(bico, valorCentavos);
        presetOk = true;
      } catch (e) {
        console.error('  [CBC] Preset falhou:', e.message);
      }

      return json(res, { ok: true, cicloId, abastecimentoId: id, bico, valor, presetOk });
    }

    // POST /incrementar — avanca ponteiro (&I)
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

    if (req.method === 'POST' && url === '/bico/validar') {
      const body = await bodyJson(req);
      const numero = String(body.numero ?? '').trim().padStart(2, '0');
      const codigo = String(body.codigo ?? '').trim().toUpperCase();
      if (!numero || !codigo) throw { status: 400, mensagem: 'Numero e codigo sao obrigatorios' };
      const bico = await knex('bicos').where({ numero, codigo_adesivo: codigo }).whereNot({ ativo: 0 }).first();
      if (!bico) return json(res, { ok: false, mensagem: 'Codigo invalido para este bico' }, 400);
      return json(res, { ok: true, bico: { numero: bico.numero, combustivel: bico.combustivel } });
    }

    if (req.method === 'GET' && url === '/admin/bicos') {
      const lista = await knex('bicos').orderBy('numero');
      return json(res, { ok: true, total: lista.length, bicos: lista });
    }

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
  console.log('Para apontar ao posto: CBC_HOST=<IP> node server.js');
});
