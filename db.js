/**
 * Camada de banco de dados — Knex.js
 *
 * Hoje: SQLite (arquivo local)
 * Produção: trocar config para PostgreSQL sem mudar nada mais
 *
 * Para migrar para PostgreSQL:
 *   1. npm install pg
 *   2. Trocar o bloco de config abaixo para:
 *      client: 'pg',
 *      connection: process.env.DATABASE_URL
 */

const path = require('path');

const knex = require('knex')({
  client: 'better-sqlite3',
  connection: { filename: path.join(__dirname, 'abasteceplus.db') },
  useNullAsDefault: true,
});

// ─── Criação das tabelas (roda uma vez na inicialização) ──────────────────────

async function inicializarBanco() {
  // USUÁRIOS
  await knex.schema.hasTable('usuarios').then(exists => {
    if (exists) return;
    return knex.schema.createTable('usuarios', t => {
      t.increments('id').primary();
      t.string('nome').notNullable();
      t.string('email').unique().notNullable();
      t.string('telefone');
      t.string('cpf').unique();
      t.string('senha_hash').notNullable();
      t.string('token_fcm');           // push notification
      t.decimal('cashback_saldo', 10, 2).defaultTo(0);
      t.enum('perfil', ['pf', 'pj']).defaultTo('pf');
      t.boolean('ativo').defaultTo(true);
      t.timestamps(true, true);        // created_at, updated_at
    });
  });

  // POSTOS
  await knex.schema.hasTable('postos').then(exists => {
    if (exists) return;
    return knex.schema.createTable('postos', t => {
      t.increments('id').primary();
      t.string('nome').notNullable();
      t.string('cnpj').unique();
      t.string('endereco');
      t.string('cidade');
      t.string('uf', 2);
      t.decimal('lat', 10, 7);
      t.decimal('lng', 10, 7);
      t.string('ip_horustech');        // IP da automação no posto
      t.integer('porta_horustech').defaultTo(2001);
      t.decimal('preco_gasolina', 6, 3);
      t.decimal('preco_etanol', 6, 3);
      t.decimal('preco_diesel', 6, 3);
      t.decimal('cashback_pct', 5, 2).defaultTo(1);
      t.boolean('ativo').defaultTo(true);
      t.timestamps(true, true);
    });
  });

  // BICOS
  await knex.schema.hasTable('bicos').then(async exists => {
    if (!exists) {
      await knex.schema.createTable('bicos', t => {
        t.increments('id').primary();
        t.integer('posto_id');             // opcional no MVP
        t.string('numero', 4).notNullable(); // ex: "01", "24"
        t.string('codigo_adesivo', 20);    // código do adesivo colado na bomba
        t.string('combustivel').defaultTo('Gasolina Comum');
        t.boolean('ativo').defaultTo(true);
      });
    } else {
      // Adiciona coluna se não existir (migração incremental)
      const temCodigo = await knex.schema.hasColumn('bicos', 'codigo_adesivo');
      if (!temCodigo) {
        await knex.schema.table('bicos', t => t.string('codigo_adesivo', 20));
      }
    }
  });

  // ABASTECIMENTOS
  await knex.schema.hasTable('abastecimentos').then(exists => {
    if (exists) return;
    return knex.schema.createTable('abastecimentos', t => {
      t.increments('id').primary();
      t.integer('usuario_id').references('id').inTable('usuarios');
      t.integer('posto_id').references('id').inTable('postos');
      t.string('bico_numero', 4);
      t.decimal('valor_autorizado', 10, 2);  // valor programado no app
      t.decimal('valor_cobrado', 10, 2);     // valor real abastecido
      t.decimal('volume_litros', 10, 3);
      t.decimal('preco_litro', 6, 3);
      t.decimal('cashback_gerado', 10, 2);
      t.string('combustivel');
      t.enum('status', [
        'aguardando',      // bico liberado, esperando abastecer
        'abastecendo',     // em progresso
        'concluido',       // finalizado com sucesso
        'cancelado',       // cancelado pelo usuário
        'erro',
      ]).defaultTo('aguardando');
      t.string('ciclo_id');             // ID retornado pela HORUSTECH
      t.timestamp('iniciado_em');
      t.timestamp('concluido_em');
      t.timestamps(true, true);
    });
  });

  // PAGAMENTOS
  await knex.schema.hasTable('pagamentos').then(exists => {
    if (exists) return;
    return knex.schema.createTable('pagamentos', t => {
      t.increments('id').primary();
      t.integer('abastecimento_id').references('id').inTable('abastecimentos');
      t.integer('usuario_id').references('id').inTable('usuarios');
      t.decimal('valor', 10, 2).notNullable();
      t.enum('metodo', ['credito', 'debito', 'pix', 'dinheiro', 'cashback']).notNullable();
      t.enum('status', ['pendente', 'aprovado', 'recusado', 'estornado']).defaultTo('pendente');
      t.string('tid_operadora');        // ID da transação Cielo/Getnet
      t.string('autorizacao');
      t.timestamp('processado_em');
      t.timestamps(true, true);
    });
  });

  // CARTÕES SALVOS
  await knex.schema.hasTable('cartoes').then(exists => {
    if (exists) return;
    return knex.schema.createTable('cartoes', t => {
      t.increments('id').primary();
      t.integer('usuario_id').references('id').inTable('usuarios').notNullable();
      t.string('bandeira');             // visa, mastercard, elo
      t.string('ultimos_digitos', 4);
      t.string('token_operadora');      // token Cielo/Getnet (não salva número completo)
      t.string('apelido');              // "Nubank crédito"
      t.boolean('padrao').defaultTo(false);
      t.timestamps(true, true);
    });
  });

  // HISTÓRICO DE CASHBACK
  await knex.schema.hasTable('cashback_extrato').then(exists => {
    if (exists) return;
    return knex.schema.createTable('cashback_extrato', t => {
      t.increments('id').primary();
      t.integer('usuario_id').references('id').inTable('usuarios').notNullable();
      t.integer('abastecimento_id').references('id').inTable('abastecimentos');
      t.decimal('valor', 10, 2).notNullable();
      t.enum('tipo', ['credito', 'debito']).notNullable();
      t.string('descricao');
      t.timestamps(true, true);
    });
  });

  console.log('✅ Banco de dados inicializado com sucesso');
}

module.exports = { knex, inicializarBanco };
