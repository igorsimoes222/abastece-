# mobile-backend — API REST (PostoPrático)

API central em nuvem. Recebe requisições do app do cliente, gerencia autorizações, processa pagamentos via Cielo e se comunica com o agente local do posto.

---

## Stack

- **Node.js** (CommonJS)
- **Knex.js** + SQLite (dev) → MySQL (produção)
- HTTP nativo (`http` module)
- JWT para autenticação
- bcrypt para senhas
- bonjour-service (mDNS — descoberta automática na rede local)

---

## Como rodar

```bash
cd apps/mobile-backend
npm install
node server.js
```

### Com concentrador real do posto:
```bash
CBC_HOST=192.168.0.91 CBC_PORT=2001 node server.js
```

### Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `CBC_HOST` | `127.0.0.1` | IP do concentrador de bombas CBC |
| `CBC_PORT` | `2001` | Porta TCP do protocolo CBC |
| `PORT` | `3334` | Porta da API HTTP |

---

## Endpoints principais

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/cadastrar` | Cadastro de novo usuário |
| POST | `/login` | Login — retorna JWT |
| POST | `/refresh` | Renovar token |

### Postos e bicos
| Método | Rota | Descrição |
|---|---|---|
| GET | `/postos` | Lista postos cadastrados |
| GET | `/postos/:id` | Dados de um posto |
| POST | `/bico/validar` | Valida código do adesivo do bico |

### Abastecimento
| Método | Rota | Descrição |
|---|---|---|
| POST | `/autorizar` | Envia preset para a bomba via CBC |
| GET | `/status` | Status atual das bombas (polling) |
| POST | `/finalizar` | Registra abastecimento concluído |

### Histórico e carteira
| Método | Rota | Descrição |
|---|---|---|
| GET | `/historico` | Histórico de abastecimentos do usuário |
| GET | `/carteira` | Saldo e extrato de cashback |

---

## Protocolo CBC (Concentrador de Bombas)

O backend mantém uma **conexão TCP persistente** com o concentrador CBC do posto (porta 2001).

### Comandos implementados

| Comando | Descrição |
|---|---|
| `(&V...)` | Visualização — lê status de todos os bicos |
| `(&A...)` | Abastecimento — lê dados do último abastecimento |
| `(&P...)` | Preset — programa valor/limite na bomba |
| `(&L...)` | Libera bico para abastecimento |

### Formato do endereço CBC (`numero_cbc`)

Cada bico tem um endereço hexadecimal no concentrador CBC.
Exemplo: bico físico `09` → endereço CBC `4D` (decimal 77).

O campo `numero_cbc` na tabela `bicos` do banco armazena esse valor.

A função `buildCbcMap()` em `server.js` cria o mapeamento reverso:
`CBC hex → número físico do bico`

---

## Banco de dados

Arquivo: `db.js`

Tabelas principais:

| Tabela | Descrição |
|---|---|
| `usuarios` | Clientes cadastrados |
| `postos` | Postos credenciados |
| `bicos` | Bicos de cada posto (com `numero_cbc`) |
| `autorizacoes` | Autorizações de abastecimento |
| `abastecimentos` | Abastecimentos concluídos |
| `cashback_extrato` | Lançamentos de cashback |

Em produção: migrar para **MySQL** no Railway ou similar.

---

## mDNS (descoberta automática)

O backend anuncia o serviço na rede local via **Bonjour/mDNS**:

```
Nome: Abastece+ Backend
Tipo: _http._tcp
Porta: 3334
```

O app do cliente se conecta por `http://abasteceplus.local:3334` sem precisar saber o IP da máquina.

---

## Autenticação

- JWT com expiração de 7 dias
- Refresh token de 30 dias
- Middleware `verificarToken` protege rotas autenticadas
- Senhas com bcrypt (salt 10)
