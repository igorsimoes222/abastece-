# posto-agente — Agente Local do Posto (PostoPrático)

Processo Node.js que roda **localmente no computador do posto**, conectado ao concentrador de bombas via protocolo CBC (CompanyTec).

Responsável por:
- Receber comandos de autorização da API em nuvem
- Programar valores nas bombas via TCP
- Monitorar abastecimentos em andamento
- Enviar dados de conclusão para a API

---

## Responsável

**Sérgio** — integração com concentrador CBC + impressão de comprovantes na Smart Cielo

---

## Como rodar

```bash
cd apps/posto-agente
npm install
CBC_HOST=192.168.0.91 CBC_PORT=2001 node index.js
```

### Variáveis de ambiente obrigatórias

| Variável | Exemplo | Descrição |
|---|---|---|
| `CBC_HOST` | `192.168.0.91` | IP do concentrador de bombas no posto |
| `CBC_PORT` | `2001` | Porta TCP do protocolo CBC |

### Auto-start no Windows (sem admin)

Criar atalho para `iniciar-backend.bat` na pasta de inicialização do Windows:
```
%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
```

Conteúdo do `.bat`:
```bat
@echo off
set CBC_HOST=192.168.0.91
set CBC_PORT=2001
cd /d C:\caminho\para\posto-agente
node index.js
```

---

## Protocolo CBC — Visão geral

O concentrador CBC (CompanyTec) controla as bombas via **TCP na porta 2001**.

Comandos são delimitados por parênteses: `(&COMANDO dados)`

### Endereço dos bicos

Cada bico tem um endereço hexadecimal no concentrador que pode ser **diferente** do número físico.

Exemplo real (Sete Estrelas):
- Bico físico: `09`
- Endereço CBC: `4D` (decimal 77)

O campo `numero_cbc` no banco de dados armazena o endereço hex de cada bico.

### Comandos implementados

| Comando | Formato | Descrição |
|---|---|---|
| Visualização | `(&V nn)` | Lê status do bico `nn` (hex) |
| Abastecimento | `(&A nn)` | Lê dados do último abastecimento |
| Preset | `(&P nn vvvvvv)` | Programa valor em centavos no bico |
| Liberar | `(&L nn)` | Libera bico para abastecimento |

### Mapeamento reverso CBC → bico físico

```js
async function buildCbcMap() {
  // Lê do banco: { numero: '09', numero_cbc: '4D' }
  // Retorna: { 77: '09' }  (decimal CBC → número físico)
}
```

Usado para interpretar respostas `(&V)` e `(&A)` que retornam o endereço CBC.

---

## Arquivos

| Arquivo | Descrição |
|---|---|
| `index.js` | Servidor principal — API HTTP + conexão CBC |
| `db.js` | Banco de dados SQLite + migrações automáticas |
| `auth.js` | Autenticação JWT |
| `package.json` | Dependências |

---

## Comunicação com a API em nuvem

```
API nuvem (mobile-backend)
    │  POST /autorizar { bico, valor }
    ▼
posto-agente (local)
    │  (&P hex valor) via TCP
    ▼
Concentrador CBC
    │  Programa bomba
    ▼
posto-agente (polling &V e &A)
    │  POST /finalizar { litros, valor_real }
    ▼
API nuvem → notifica app do cliente
```

---

## Porta do serviço local

O agente sobe na porta **3334** localmente.
O mDNS anuncia como `abasteceplus.local` na rede do posto.
