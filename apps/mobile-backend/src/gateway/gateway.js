/**
 * Gateway nuvem ↔ app local do posto.
 *
 * O posto-agente conecta AQUI via WebSocket (conexão de saída dele, não
 * entrada — funciona atrás de NAT/firewall do posto sem configurar porta
 * nenhuma). Esse módulo cuida de:
 *   - autenticar o posto (codigo_local + api_key contra a tabela `postos` do
 *     banco de fluxo)
 *   - manter o registro de quais postos estão conectados agora (ver
 *     connectionRegistry.js — troca fácil por Redis se um dia precisar)
 *   - mandar comando pra um posto específico e devolver a resposta como Promise
 *   - atualizar heartbeat/status_conexao no banco de fluxo
 */

const WebSocket = require('ws');
const bcrypt = require('bcrypt');
const { knexFluxo } = require('../db/dbFluxo');
const { InMemoryConnectionRegistry } = require('./connectionRegistry');

const TIMEOUT_PADRAO_MS = 5000;

const registry = new InMemoryConnectionRegistry();
const pendentes = new Map(); // comandoId -> { resolve, reject, timer }

let proximoId = 1;

function attach(httpServer) {
  const wss = new WebSocket.Server({ server: httpServer, path: '/postos-ws' });

  wss.on('connection', (ws) => {
    let codigoLocal = null;

    ws.on('message', async (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      try {
        if (msg.tipo === 'registrar') {
          const posto = await knexFluxo('postos').where({ codigo_local: msg.codigo_local }).first();
          const apiKeyOk = posto && await bcrypt.compare(msg.api_key || '', posto.api_key_hash);
          if (!posto || !apiKeyOk) {
            ws.send(JSON.stringify({ tipo: 'registrado', ok: false, mensagem: 'codigo_local ou api_key inválidos' }));
            return ws.close();
          }
          codigoLocal = msg.codigo_local;
          registry.registrar(codigoLocal, ws, posto.id);
          await knexFluxo('postos').where({ id: posto.id }).update({
            status_conexao: 'online',
            ultimo_heartbeat: knexFluxo.fn.now(),
          });
          console.log('[gateway] Posto conectado: ' + codigoLocal);
          ws.send(JSON.stringify({ tipo: 'registrado', ok: true }));
          return;
        }

        if (msg.tipo === 'heartbeat' && codigoLocal) {
          await knexFluxo('postos').where({ codigo_local: codigoLocal }).update({
            ultimo_heartbeat: knexFluxo.fn.now(),
          });
          return;
        }

        if (msg.tipo === 'resposta') {
          const pend = pendentes.get(msg.id);
          if (!pend) return;
          clearTimeout(pend.timer);
          pendentes.delete(msg.id);
          if (msg.ok) pend.resolve(msg.dados);
          else pend.reject(new Error(msg.erro || 'erro no posto'));
          return;
        }

        // O frentista confirmou o pedido na tela do posto — o posto-agente já
        // mandou o preset pro CBC antes de avisar aqui. A nuvem só registra
        // que a autorização foi liberada.
        if (msg.tipo === 'confirmar_autorizacao') {
          await knexFluxo('autorizacoes').where({ id: msg.autorizacaoId }).update({
            status: 'confirmada_posto',
            confirmada_em: knexFluxo.fn.now(),
          });
          console.log('[gateway] Autorização ' + msg.autorizacaoId + ' confirmada pelo posto ' + codigoLocal);
        }
      } catch (e) {
        // Uma mensagem malformada ou uma falha de banco aqui não pode
        // derrubar o processo inteiro — derrubaria a conexão de TODOS os
        // postos, não só deste. Só loga e segue.
        console.error('[gateway] Erro processando mensagem de ' + (codigoLocal || '(não registrado)') + ':', e.message);
      }
    });

    ws.on('close', async () => {
      if (!codigoLocal) return;
      registry.remover(codigoLocal);
      console.log('[gateway] Posto desconectado: ' + codigoLocal);
      try {
        await knexFluxo('postos').where({ codigo_local: codigoLocal }).update({ status_conexao: 'offline' });
      } catch (e) {
        console.error('[gateway] Erro ao marcar posto offline:', e.message);
      }
    });

    ws.on('error', (e) => {
      console.error('[gateway] Erro de socket (' + (codigoLocal || '(não registrado)') + '):', e.message);
    });
  });

  console.log('[gateway] WebSocket de postos escutando em /postos-ws');
}

function estaOnline(codigoLocal) {
  return registry.estaOnline(codigoLocal);
}

function enviarComando(codigoLocal, acao, params = {}, timeoutMs = TIMEOUT_PADRAO_MS) {
  return new Promise((resolve, reject) => {
    const alvo = registry.obter(codigoLocal);
    if (!alvo) return reject(new Error('posto ' + codigoLocal + ' não está conectado'));

    const id = proximoId++;
    const timer = setTimeout(() => {
      pendentes.delete(id);
      reject(new Error('timeout aguardando resposta do posto'));
    }, timeoutMs);

    pendentes.set(id, { resolve, reject, timer });
    alvo.ws.send(JSON.stringify({ tipo: 'comando', id, acao, params }));
  });
}

// Avisa o posto de algo sem esperar resposta — usado pra empurrar uma nova
// autorização pendente assim que ela é criada, pro frentista ver na tela.
function notificarPosto(codigoLocal, tipo, dados = {}) {
  const alvo = registry.obter(codigoLocal);
  if (!alvo) throw new Error('posto ' + codigoLocal + ' não está conectado');
  alvo.ws.send(JSON.stringify({ tipo, ...dados }));
}

module.exports = { attach, enviarComando, notificarPosto, estaOnline };
