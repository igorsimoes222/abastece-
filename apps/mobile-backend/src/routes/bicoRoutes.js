const { json, bodyJson } = require('../http');
const { knex } = require('../db/db');

function registrar(router) {
  router.post('/bico/validar', async (req, res) => {
    const body = await bodyJson(req);
    const numero = String(body.numero ?? '').trim().padStart(2, '0');
    const codigo = String(body.codigo ?? '').trim().toUpperCase();
    if (!numero || !codigo) throw { status: 400, mensagem: 'Numero e codigo sao obrigatorios' };
    const bico = await knex('bicos').where({ numero, codigo_adesivo: codigo }).whereNot({ ativo: 0 }).first();
    if (!bico) return json(res, { ok: false, mensagem: 'Codigo invalido para este bico' }, 400);
    return json(res, { ok: true, bico: { numero: bico.numero, combustivel: bico.combustivel } });
  });
}

module.exports = { registrar };
