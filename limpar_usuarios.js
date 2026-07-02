const { knex } = require('./db');

async function limpar() {
  await knex('usuarios').delete();
  await knex.raw("DELETE FROM sqlite_sequence WHERE name='usuarios'");
  const total = await knex('usuarios').count('id as n').first();
  console.log('✅ Banco limpo. Usuários:', total.n);
  process.exit(0);
}

limpar().catch(e => { console.error(e); process.exit(1); });
