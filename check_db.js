const { knex } = require('./db');
knex.raw("SELECT name FROM sqlite_master WHERE type='table'").then(rows => {
  console.log('Tabelas criadas no banco:');
  rows.forEach(r => console.log(' -', r.name));
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
