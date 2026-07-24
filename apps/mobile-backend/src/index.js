/**
 * Abastece+ — backend na nuvem
 *
 * Servidor HTTP puro (sem framework) + gateway WebSocket pros postos.
 * Rotas organizadas por domínio em src/routes/, despachadas por um router
 * manual leve (src/routes/router.js) — ver README para a lista completa.
 */

const http = require('http');
const { SERVER_PORT } = require('./env');
const { json } = require('./http');
const { criarRouter } = require('./routes/router');
const { inicializarBanco } = require('./db/db');
const { inicializarBancoFluxo } = require('./db/dbFluxo');
const gateway = require('./gateway/gateway');

const router = criarRouter();
require('./routes/authRoutes').registrar(router);
require('./routes/autorizacaoRoutes').registrar(router);
require('./routes/bicoRoutes').registrar(router);
require('./routes/adminRoutes').registrar(router);
require('./routes/carteiraRoutes').registrar(router);

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE',
    });
    return res.end();
  }

  const url = req.url.split('?')[0];
  console.log('[' + new Date().toLocaleTimeString() + '] ' + req.method + ' ' + url);

  try {
    const tratada = await router.despachar(req, res, url);
    if (!tratada) json(res, { erro: 'Rota nao encontrada' }, 404);
  } catch (err) {
    const mensagem = err.mensagem ?? err.message ?? 'Erro interno';
    const status   = err.status  ?? 500;
    console.error('Erro:', mensagem);
    json(res, { ok: false, mensagem }, status);
  }
});

// Rede de segurança: um erro não tratado fora do try/catch de uma rota
// específica não pode derrubar o processo inteiro silenciosamente.
process.on('uncaughtException', (e) => console.error('[uncaughtException]', e));
process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));

inicializarBanco().catch(console.error);
inicializarBancoFluxo().catch(console.error);
gateway.attach(server);

server.listen(SERVER_PORT, () => {
  console.log('Abastece+ Backend rodando na porta ' + SERVER_PORT);
  console.log('Aguardando conexão do(s) posto(s) em /postos-ws');
});
