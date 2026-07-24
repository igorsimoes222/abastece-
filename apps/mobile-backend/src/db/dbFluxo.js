/**
 * Banco de FLUXO — Knex.js (instância separada do banco principal)
 *
 * Escopo: posto → bomba → bico → autorização → abastecimento → pagamento.
 * Fica isolado do banco de conta/carteira (db.js) de propósito — é o banco de
 * alto volume transacional, que conversa com o app local de cada posto.
 *
 * Hoje: SQLite (arquivo local)
 * Produção: instância Postgres PRÓPRIA (não a mesma do banco principal)
 *   1. npm install pg
 *   2. Trocar o bloco de config abaixo para:
 *      client: 'pg',
 *      connection: process.env.DATABASE_URL_FLUXO
 *
 * IMPORTANTE — referências entre bancos:
 * Como este é um banco separado do banco de conta (usuarios/carteira em db.js),
 * as colunas `cliente_id` abaixo NÃO têm foreign key de banco — são só um ID
 * validado na camada de aplicação (a API confere se o cliente existe chamando
 * db.js antes de gravar aqui). Não dá pra confiar em constraint de FK cruzando
 * bancos diferentes.
 */

const path = require('path');
const bcrypt = require('bcrypt');

const knexFluxo = require('knex')({
  client: 'better-sqlite3',
  connection: { filename: path.join(__dirname, '../../abastecefluxo.db') },
  useNullAsDefault: true,
});

async function inicializarBancoFluxo() {
  // PRODUTOS (catálogo de combustível — global, compartilhado por todos os
  // postos. Nome/tipo aparece UMA vez só aqui; preço varia por posto e mora
  // em postos_produtos, não aqui.)
  await knexFluxo.schema.hasTable('produtos').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('produtos', t => {
      t.increments('id').primary();
      t.string('descricao').notNullable().unique(); // ex: "Gasolina Comum", "Etanol", "Diesel S10"
      t.string('codigo', 20);
      t.timestamps(true, true);
    });
  });

  // POSTOS (dado descritivo consolidado aqui — antes existia duplicado em
  // db.js também; essa é a fonte única agora. Preço fica em postos_produtos,
  // não em coluna solta.)
  await knexFluxo.schema.hasTable('postos').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('postos', t => {
      t.increments('id').primary();
      t.string('nome').notNullable();
      t.string('codigo_local').unique().notNullable(); // identifica o posto pro app local
      t.string('api_key_hash').notNullable();           // credencial do app local, não é o JWT do cliente
      t.string('endereco');
      t.string('cidade');
      t.string('uf', 2);
      t.decimal('lat', 10, 7);
      t.decimal('lng', 10, 7);
      t.timestamp('ultimo_heartbeat');                  // último "estou vivo" recebido do app local
      t.enum('status_conexao', ['online', 'offline']).defaultTo('offline');
      t.boolean('ativo').defaultTo(true);
      t.timestamps(true, true);
    });
  });

  // POSTOS_PRODUTOS (junção N:N — cada linha é "esse posto vende esse
  // produto por esse preço". É aqui que o preço mora, não em bicos nem em
  // postos.)
  await knexFluxo.schema.hasTable('postos_produtos').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('postos_produtos', t => {
      t.increments('id').primary();
      t.integer('posto_id').references('id').inTable('postos').notNullable();
      t.integer('produto_id').references('id').inTable('produtos').notNullable();
      t.decimal('preco', 6, 3).notNullable();
      t.unique(['posto_id', 'produto_id']); // um preço só por combinação
      t.timestamps(true, true);
    });
  });

  // BOMBAS
  await knexFluxo.schema.hasTable('bombas').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('bombas', t => {
      t.increments('id').primary();
      t.integer('posto_id').references('id').inTable('postos').notNullable();
      t.string('numero', 4).notNullable(); // identificador físico, ex "01"
      t.boolean('ativo').defaultTo(true);
      t.timestamps(true, true);
    });
  });

  // BICOS
  await knexFluxo.schema.hasTable('bicos').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('bicos', t => {
      t.increments('id').primary();
      t.integer('bomba_id').references('id').inTable('bombas').notNullable();
      t.string('numero', 4).notNullable();
      t.string('codigo_adesivo', 20);
      // Aponta pro catálogo em vez de guardar o nome como texto solto.
      // Nullable por enquanto — ainda não existe rota de cadastro de
      // equipamento que obrigue informar o produto na criação (ver
      // simplificação find-or-create em autorizacaoRoutes.js).
      t.integer('produto_id').references('id').inTable('produtos');
      t.boolean('ativo').defaultTo(true);
      t.timestamps(true, true);
    });
  });

  // AUTORIZACOES (pedido do cliente, antes de virar abastecimento de fato)
  await knexFluxo.schema.hasTable('autorizacoes').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('autorizacoes', t => {
      t.increments('id').primary();
      t.integer('cliente_id').notNullable();   // referência ao banco principal, sem FK (ver comentário no topo)
      t.integer('bico_id').references('id').inTable('bicos').notNullable();
      t.decimal('valor_solicitado', 10, 2).notNullable();
      // Sem coluna de combustível aqui — deriva de bico_id -> produto_id,
      // não duplica o nome do produto numa string solta.
      t.enum('status', [
        'pendente',          // criada na nuvem, ainda não chegou no posto
        'enviada_posto',     // app local recebeu o comando
        'confirmada_posto',  // app local confirmou que liberou o bico
        'expirada',
        'cancelada',
      ]).defaultTo('pendente');
      t.timestamp('enviada_em');
      t.timestamp('confirmada_em');
      t.timestamp('expira_em');
      t.timestamps(true, true);
    });
  });

  // ABASTECIMENTOS
  await knexFluxo.schema.hasTable('abastecimentos').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('abastecimentos', t => {
      t.increments('id').primary();
      t.integer('autorizacao_id').references('id').inTable('autorizacoes'); // nullable: permite abastecimento iniciado direto na bomba, sem app
      t.integer('bico_id').references('id').inTable('bicos').notNullable();
      t.decimal('valor_autorizado', 10, 2);
      t.decimal('valor_cobrado', 10, 2);
      t.decimal('volume_litros', 10, 3);
      t.decimal('preco_litro', 6, 3);
      // Sem coluna de combustível aqui — mesmo motivo do autorizacoes acima.
      t.enum('status', ['aguardando', 'abastecendo', 'concluido', 'cancelado', 'erro']).defaultTo('aguardando');
      t.string('ciclo_id'); // ID retornado pela automação
      t.timestamp('iniciado_em');
      t.timestamp('concluido_em');
      t.timestamps(true, true);
    });
  });

  // PAGAMENTOS
  await knexFluxo.schema.hasTable('pagamentos').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('pagamentos', t => {
      t.increments('id').primary();
      t.integer('abastecimento_id').references('id').inTable('abastecimentos').notNullable();
      t.integer('cliente_id').notNullable(); // referência ao banco principal, sem FK
      t.decimal('valor', 10, 2).notNullable();
      t.enum('status', ['pendente', 'aprovado', 'recusado', 'estornado']).defaultTo('pendente');
      t.timestamp('processado_em');
      t.timestamps(true, true);
    });
  });

  // FINALIZADORAS (forma de pagamento usada — um pagamento pode ser dividido em várias)
  await knexFluxo.schema.hasTable('finalizadoras').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('finalizadoras', t => {
      t.increments('id').primary();
      t.integer('pagamento_id').references('id').inTable('pagamentos').notNullable();
      t.enum('forma', ['credito', 'debito', 'pix', 'dinheiro', 'cashback']).notNullable();
      t.decimal('valor', 10, 2).notNullable();
      t.string('tid_operadora');   // ID da transação Cielo/Getnet, se aplicável
      t.string('autorizacao_cod');
      t.timestamps(true, true);
    });
  });

  // CUPONS (opcional — nem todo pagamento gera um)
  await knexFluxo.schema.hasTable('cupons').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('cupons', t => {
      t.increments('id').primary();
      t.integer('pagamento_id').references('id').inTable('pagamentos'); // nullable: cupom promocional pode existir sem pagamento ainda
      t.string('codigo').unique();
      t.string('tipo'); // ex: 'desconto', 'cashback_bonus'
      t.decimal('valor', 10, 2);
      t.decimal('percentual', 5, 2);
      t.timestamp('usado_em');
      t.timestamps(true, true);
    });
  });

  // DEVENDO (débito em aberto quando um pagamento falha)
  await knexFluxo.schema.hasTable('devendo').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('devendo', t => {
      t.increments('id').primary();
      t.integer('pagamento_id').references('id').inTable('pagamentos').notNullable().unique(); // no máx. 1 devendo por pagamento
      t.integer('cliente_id').notNullable();
      t.decimal('valor', 10, 2).notNullable();
      t.enum('status', ['aberto', 'quitado']).defaultTo('aberto');
      t.timestamp('quitado_em');
      t.timestamps(true, true);
    });
  });

  // HISTORICO (log de eventos append-only — auditoria e reconciliação nuvem↔posto)
  await knexFluxo.schema.hasTable('historico').then(exists => {
    if (exists) return;
    return knexFluxo.schema.createTable('historico', t => {
      t.increments('id').primary();
      t.integer('abastecimento_id').references('id').inTable('abastecimentos');
      t.integer('pagamento_id').references('id').inTable('pagamentos');
      t.string('evento').notNullable(); // ex: 'autorizacao_enviada_posto', 'abastecimento_concluido'
      t.text('payload'); // snapshot JSON do estado no momento do evento
      t.timestamp('criado_em').defaultTo(knexFluxo.fn.now());
    });
  });

  // Seed de desenvolvimento: catálogo de produtos + posto local padrão usado
  // pelo agente do posto (credenciais batem com os defaults de
  // POSTO_CODIGO/POSTO_API_KEY do agente), com preço de exemplo — pra testar
  // a tela de comparação de preço sem precisar cadastrar nada na mão.
  if (process.env.NODE_ENV !== 'production') {
    for (const descricao of ['Gasolina Comum', 'Etanol', 'Diesel S10']) {
      const existeProduto = await knexFluxo('produtos').where({ descricao }).first();
      if (!existeProduto) await knexFluxo('produtos').insert({ descricao });
    }

    const existe = await knexFluxo('postos').where({ codigo_local: 'posto-dev' }).first();
    if (!existe) {
      const apiKeyHash = await bcrypt.hash('dev-local-key', 10);
      const [postoId] = await knexFluxo('postos').insert({
        nome: 'Posto de Desenvolvimento',
        codigo_local: 'posto-dev',
        api_key_hash: apiKeyHash,
        endereco: 'Rua de Teste, 123',
        cidade: 'São José dos Campos',
        uf: 'SP',
        lat: -23.2237,
        lng: -45.9009,
      });

      const gasolina = await knexFluxo('produtos').where({ descricao: 'Gasolina Comum' }).first();
      await knexFluxo('postos_produtos').insert({ posto_id: postoId, produto_id: gasolina.id, preco: 5.79 });

      console.log('  [seed] posto-dev criado (uso local/dev)');
    }
  }

  console.log('✅ Banco de fluxo inicializado com sucesso');
}

module.exports = { knexFluxo, inicializarBancoFluxo };
