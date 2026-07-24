const { json, bodyJson } = require('../http');
const { verificarToken } = require('../auth/auth');
const { knex } = require('../db/db');
const { knexFluxo } = require('../db/dbFluxo');
const { POSTO_CODIGO_PADRAO } = require('../env');
const gateway = require('../gateway/gateway');

async function buscarPrecos(postoId) {
  return knexFluxo('postos_produtos')
    .join('produtos', 'produtos.id', 'postos_produtos.produto_id')
    .where({ posto_id: postoId })
    .select('produtos.descricao as produto', 'postos_produtos.preco');
}

// api_key_hash é credencial do posto pro gateway — nunca pode ir pro app do
// cliente, mesmo sendo um hash.
function semSegredo(posto) {
  const { api_key_hash, ...postoSeguro } = posto;
  return postoSeguro;
}

function registrar(router) {
  router.get('/ping', async (req, res) => {
    return json(res, { ok: true, posto: POSTO_CODIGO_PADRAO, conectado: gateway.estaOnline(POSTO_CODIGO_PADRAO) });
  });

  router.get('/status', async (req, res) => {
    try {
      const { bicos } = await gateway.enviarComando(POSTO_CODIGO_PADRAO, 'status');
      return json(res, { ok: true, bicos });
    } catch {
      return json(res, { ok: true, bicos: [] });
    }
  });

  // valor em tempo real do bico abastecendo, repassado pelo posto
  router.get('/visualizacao', async (req, res) => {
    try {
      const { abastecendo } = await gateway.enviarComando(POSTO_CODIGO_PADRAO, 'visualizacao');
      return json(res, { ok: true, abastecendo });
    } catch {
      return json(res, { ok: true, abastecendo: [] });
    }
  });

  // Lista todos os postos ativos com seus preços — é o que a tela de mapa
  // usa pra comparar preço entre postos diferentes.
  router.get('/postos', async (req, res) => {
    const postos = await knexFluxo('postos').where({ ativo: true });
    const comPrecos = await Promise.all(
      postos.map(async (p) => ({ ...semSegredo(p), precos: await buscarPrecos(p.id) }))
    );
    return json(res, { ok: true, postos: comPrecos });
  });

  // Dado descritivo + preços agora vêm do banco de fluxo (produtos/postos_produtos
  // consolidados lá) — não mais do banco principal.
  router.get('/postos/:id', async (req, res, { id }) => {
    const posto = await knexFluxo('postos').where({ id: parseInt(id) }).first();
    if (!posto) return json(res, { ok: false, erro: 'Posto não encontrado' }, 404);

    const precos = await buscarPrecos(posto.id);
    return json(res, { ok: true, posto: { ...semSegredo(posto), precos } });
  });

  // registro finalizado — varre a fila até achar o bico pedido, consumindo com incrementar
  router.get('/abastecimento', async (req, res) => {
    try {
      const bicoParam = new URL('http://x' + req.url).searchParams.get('bico');
      const bicoAlvo  = bicoParam ? String(bicoParam).padStart(2, '0') : null;

      let dados = null;
      const MAX_TENTATIVAS = 20;

      for (let i = 0; i < MAX_TENTATIVAS; i++) {
        const candidato = await gateway.enviarComando(POSTO_CODIGO_PADRAO, 'abastecimento');
        if (candidato.vazio) break;

        const bicoCandidato = String(candidato.bico ?? '').padStart(2, '0');

        if (!bicoAlvo || bicoCandidato === bicoAlvo) {
          dados = candidato;
          await gateway.enviarComando(POSTO_CODIGO_PADRAO, 'incrementar');
          break;
        }
        await gateway.enviarComando(POSTO_CODIGO_PADRAO, 'incrementar');
      }

      if (!dados) return json(res, { ok: true, vazio: true });

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
      console.error('  [abastecimento] erro:', e.message);
      return json(res, { ok: true, vazio: true });
    }
  });

  router.get('/historico', async (req, res) => {
    const lista = await knex('abastecimentos').orderBy('created_at', 'desc').limit(50);
    return json(res, { ok: true, total: lista.length, itens: lista });
  });

  // Cria um pedido PENDENTE e avisa o posto — não manda preset daqui. O
  // frentista precisa confirmar na tela dele primeiro; quem manda o preset de
  // verdade é o posto-agente, só depois que o frentista libera.
  router.post('/autorizar', async (req, res) => {
    const body = await bodyJson(req);
    const { bico, valor, usuario_id } = body;
    if (!bico || !valor || !usuario_id) {
      return json(res, { ok: false, erro: 'bico, valor e usuario_id sao obrigatorios' }, 400);
    }

    const posto = await knexFluxo('postos').where({ codigo_local: POSTO_CODIGO_PADRAO }).first();
    if (!posto) return json(res, { ok: false, erro: 'posto nao configurado no banco de fluxo' }, 500);

    // Simplificação atual: encontra ou cria bomba/bico sob demanda, já que
    // ainda não existe rota de cadastro de equipamento no banco de fluxo.
    let bomba = await knexFluxo('bombas').where({ posto_id: posto.id }).first();
    if (!bomba) {
      const [bombaId] = await knexFluxo('bombas').insert({ posto_id: posto.id, numero: '01' });
      bomba = { id: bombaId };
    }
    const numeroBico = String(bico).padStart(2, '0');
    let bicoRow = await knexFluxo('bicos').where({ bomba_id: bomba.id, numero: numeroBico }).first();
    if (!bicoRow) {
      const [bicoId] = await knexFluxo('bicos').insert({ bomba_id: bomba.id, numero: numeroBico });
      bicoRow = { id: bicoId };
    }

    const [autorizacaoId] = await knexFluxo('autorizacoes').insert({
      cliente_id:       usuario_id,
      bico_id:          bicoRow.id,
      valor_solicitado: parseFloat(valor),
      status:           'pendente',
    });

    try {
      gateway.notificarPosto(POSTO_CODIGO_PADRAO, 'nova_autorizacao', {
        autorizacaoId, bico: numeroBico, valor: parseFloat(valor),
      });
      await knexFluxo('autorizacoes').where({ id: autorizacaoId }).update({
        status:     'enviada_posto',
        enviada_em: knexFluxo.fn.now(),
      });
    } catch (e) {
      console.error('  [gateway] Falha ao notificar posto:', e.message);
    }

    return json(res, { ok: true, autorizacaoId, bico: numeroBico, valor, status: 'pendente' });
  });

  // App consulta se o frentista já confirmou. Só o dono da autorização pode
  // ver — sem essa checagem, qualquer token válido veria bico/valor de
  // qualquer cliente só trocando o número na URL.
  router.get('/autorizacao/:id', async (req, res, { id }) => {
    const payload = verificarToken(req.headers['authorization']);
    const autorizacao = await knexFluxo('autorizacoes').where({ id: parseInt(id) }).first();
    if (!autorizacao) return json(res, { ok: false, erro: 'Autorizacao nao encontrada' }, 404);
    if (autorizacao.cliente_id !== payload.id) {
      return json(res, { ok: false, erro: 'Autorizacao nao encontrada' }, 404);
    }
    return json(res, { ok: true, autorizacao });
  });

  router.post('/incrementar', async (req, res) => {
    try { await gateway.enviarComando(POSTO_CODIGO_PADRAO, 'incrementar'); } catch {}
    return json(res, { ok: true });
  });
}

module.exports = { registrar };
