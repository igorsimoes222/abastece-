const { json, bodyJson } = require('../http');
const { verificarToken } = require('../auth/auth');
const { knex } = require('../db/db');

// Rotas administrativas — antes não pediam token nenhum (qualquer um podia
// listar todos os usuários ou cadastrar bico). Agora exigem um token válido,
// igual às outras rotas autenticadas. Sem controle de papel/role ainda —
// qualquer cliente logado passa; falta diferenciar admin de cliente comum.
function registrar(router) {
  router.get('/admin/bicos', async (req, res) => {
    verificarToken(req.headers['authorization']);
    const lista = await knex('bicos').orderBy('numero');
    return json(res, { ok: true, total: lista.length, bicos: lista });
  });

  router.post('/admin/bicos', async (req, res) => {
    verificarToken(req.headers['authorization']);
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
  });

  router.get('/admin/usuarios', async (req, res) => {
    verificarToken(req.headers['authorization']);
    const lista = await knex('usuarios').select('id', 'nome', 'email', 'perfil', 'cashback_saldo', 'created_at');
    return json(res, { ok: true, total: lista.length, usuarios: lista });
  });
}

module.exports = { registrar };
