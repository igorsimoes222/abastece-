const { json } = require('../http');
const { verificarToken } = require('../auth/auth');
const { knex } = require('../db/db');

function registrar(router) {
  router.get('/carteira/resumo', async (req, res) => {
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
  });

  router.get('/carteira/extrato', async (req, res) => {
    const payload = verificarToken(req.headers['authorization']);
    const lista   = await knex('abastecimentos').where({ usuario_id: payload.id }).orderBy('created_at', 'desc').limit(30);
    const extrato = lista.map((a) => ({
      id:       a.id,
      tipo:     'abastecimento',
      data:     new Date(a.created_at).toLocaleDateString('pt-BR'),
      desc:     'Bico #' + a.bico_numero,
      valor:    '-R$ ' + parseFloat(a.valor_cobrado || 0).toFixed(2),
      cashback: a.cashback_gerado ? '+R$ ' + parseFloat(a.cashback_gerado).toFixed(2) : null,
      status:   a.status,
    }));
    return json(res, { ok: true, extrato });
  });
}

module.exports = { registrar };
