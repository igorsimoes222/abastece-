# mobile-backend

Backend na nuvem do Abastece+. Servidor HTTP puro (sem framework — roteamento
manual organizado por domínio, ver `src/routes/`) + gateway WebSocket que fala
com o agente de cada posto.

JavaScript puro, sem TypeScript — decisão deliberada, ver `src/README` da pasta
de domínio movida pra cá (`src/entities`, `src/services`, `src/shared`) pra
detalhes de por quê.

## Arquitetura

```
App (React Native/Expo)
        │  HTTP
        ▼
src/index.js (porta 3334) ──── knex ────► src/db/db.js (banco principal)
        │
        │  WebSocket (/postos-ws)
        ▼
src/gateway/gateway.js ──── knex ────► src/db/dbFluxo.js (banco de fluxo)
        ▲
        │  conexão de SAÍDA do posto (NAT/firewall não é problema)
        │
posto-agente (fora deste app — ver apps/posto-agente, ainda não reconstruído)
```

## Como rodar

```bash
npm install
cp .env.example .env   # preencher JWT_SECRET com um valor aleatório
npm start
```

`env.js` carrega o `.env` sozinho (via `dotenv`) — não precisa prefixar
variável na linha de comando. `JWT_SECRET` é **obrigatório**; sem ele no
`.env`, o servidor recusa subir (ver `src/env.js`). O `.env` não vai pro Git
(está no `.gitignore`), só o `.env.example` como modelo.

Os dois bancos SQLite (`abasteceplus.db` e `abastecefluxo.db`) são criados
automaticamente na primeira execução. Em dev (`NODE_ENV !== 'production'`, já
vem assim no `.env.example`), o banco de fluxo semeia sozinho um posto
`posto-dev` com `api_key` = `dev-local-key`, pra facilitar testar sem
configurar nada. Pra importar os 60 postos "Sete Estrelas" com localização
real (preços placeholder): `node scripts/importarPostosSeteEstrelas.js`.

## Variáveis de ambiente

| Variável | Obrigatória | Default | Uso |
|---|---|---|---|
| `JWT_SECRET` | **sim** | — | Assinatura dos tokens de login (servidor não sobe sem ela) |
| `PORT` | não | `3334` | Porta HTTP |
| `POSTO_CODIGO_PADRAO` | não | `posto-dev` | Qual posto as rotas falam com (ver limitação abaixo) |
| `NODE_ENV` | não | — | Quando `production`, desativa o seed do `posto-dev` |

## Estrutura

```
src/
├── index.js              entrypoint — sobe HTTP + gateway
├── env.js                validação de variáveis obrigatórias
├── http.js                helpers json()/bodyJson()
├── rateLimit.js            rate limit simples em memória (login/cadastro)
├── auth/auth.js            cadastro, login, verificarToken (JWT)
├── db/
│   ├── db.js                banco principal (usuarios, postos, bicos, abastecimentos, pagamentos, cartoes, cashback_extrato)
│   └── dbFluxo.js            banco de fluxo — instância separada (postos, bombas, bicos, autorizacoes, abastecimentos, pagamentos, finalizadoras, cupons, devendo, historico)
├── gateway/
│   ├── gateway.js            servidor WebSocket, autentica posto, comando request/response + push
│   └── connectionRegistry.js  registro de quem está conectado (em memória — ver nota sobre escala)
├── routes/
│   ├── router.js              dispatcher manual com suporte a :param
│   ├── authRoutes.js
│   ├── autorizacaoRoutes.js    /autorizar, /autorizacao/:id, /visualizacao, /abastecimento, /status, /ping, /postos, /postos/:id, /historico
│   ├── bicoRoutes.js
│   ├── adminRoutes.js          agora exige token (antes não pedia nenhum)
│   └── carteiraRoutes.js
├── entities/               regras de negócio (Autorizacao, Abastecimento, Pagamento, Cupom, Devendo, Carteira, Frota, Veiculo, ...)
├── services/                orquestram entidades (AutorizacaoService, PagamentoAbastecimentoService, ...)
└── shared/                  Money (value object) e Enums

test/                       espelha src/ — só arquivos .test.js, nada de código funcional aqui
```

`entities/`, `services/` e `shared/` vieram da branch `ana` (TypeScript,
com 60 testes) — foram portados pra JavaScript puro e movidos pra dentro
deste app (decisão: mais simples ter tudo relacionado ao backend numa pasta
só do que manter um pacote compartilhado separado, já que hoje só o backend
usa essa lógica).

## Fluxo de autorização — pendente até o frentista confirmar

O preset **não é mandado automaticamente**. O fluxo é:

1. App chama `POST /autorizar` → cria `autorizacoes` com `status: 'pendente'` no banco de fluxo.
2. A nuvem empurra `nova_autorizacao` pro posto via WebSocket (`gateway.notificarPosto`), status vira `enviada_posto`.
3. O posto-agente mostra na tela do frentista (fora deste app).
4. Frentista confirma → posto-agente manda o preset pro CBC de verdade, só depois avisa a nuvem (`confirmar_autorizacao` via WebSocket) → status vira `confirmada_posto`.
5. App consulta `GET /autorizacao/:id` (autenticado, só o dono da autorização pode ver — proteção contra IDOR/BOLA) pra saber se já foi confirmado.

## Segurança

- `JWT_SECRET` obrigatório, sem fallback.
- `bcrypt` nativo (não `bcryptjs`) — menor custo de CPU em alta carga de login.
- Token expira em 7 dias (era 30) — reduz a janela de um token vazado. Rotação completa de refresh token fica pra depois, não construída ainda.
- `/admin/*` agora exige token — antes estava completamente aberto.
- `GET /autorizacao/:id` confere se quem pede é o dono — antes qualquer token válido via qualquer autorização de qualquer cliente.
- Rate limit simples (10 tentativas/5min por IP) em `/auth/login` e `/auth/cadastro`.
- Erro dentro do handler de mensagem do gateway é capturado — não derruba a conexão dos outros postos.

## Pendências conhecidas

- `apps/posto-agente` ainda não foi reconstruído nesta rodada — hoje ele fala o protocolo antigo (mDNS, sem WebSocket), então o gateway não tem quem se conectar de verdade ainda. Testado nesta sessão com um script simulando o posto via WebSocket.
- `POSTO_CODIGO_PADRAO` fixo — não existe roteamento por posto pra múltiplos postos ainda; toda autorização assume um posto só.
- `find-or-create` de bomba/bico em `/autorizar` é uma simplificação — não existe rota de cadastro de equipamento no banco de fluxo ainda.
- Sem refresh token de verdade (só reduzimos o tempo de vida do token de acesso).
- `registro de conexão` do gateway é em memória — funciona bem no tamanho atual (validado até a casa de milhares de clientes com um processo só); só precisaria de Redis se um dia rodar em múltiplos processos.
