# PostoPrático — Monorepo

Plataforma nacional de abastecimento digital — **SECC Informática / Rede Sete Estrelas**

---

## Estrutura do repositório

```
postopratico/
├── apps/
│   ├── mobile-front/     App do cliente (React Native + Expo)
│   ├── mobile-backend/   API REST + gateway WebSocket em nuvem (Node.js + SQLite/Postgres)
│   ├── posto-agente/     Agente local do posto — protocolo CBC (Node.js) [ainda na versão antiga, não reconstruído]
│   └── posto-front/      App do frentista (React Native) [futuro]
```

`packages/domain/` não existe mais como pacote separado — a lógica de negócio
compartilhada (entidades, services, 60 testes) foi portada de TypeScript pra
JavaScript e vive dentro de `apps/mobile-backend/src/` (`entities/`,
`services/`, `shared/`), já que hoje só o backend consome. Decisão documentada
no README do `mobile-backend`.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Expo CLI | `npx expo` (sem instalar globalmente) |
| Git | qualquer |

---

## Como rodar cada parte

### 1. App do cliente (`mobile-front`)
```bash
cd apps/mobile-front
npm install
npx expo start
```
- Escanear QR com **Expo Go** no celular (Android/iOS)
- Pressionar `w` para abrir no navegador
- IP do backend configurado em `app/config/env.js`

### 2. API em nuvem (`mobile-backend`)
```bash
cd apps/mobile-backend
npm install
cp .env.example .env   # preencher JWT_SECRET
npm start
```
- Porta padrão: **3334**
- Dois bancos SQLite separados em dev (`abasteceplus.db` banco principal,
  `abastecefluxo.db` banco de fluxo/postos/autorizações) → Postgres em produção
  (cada um numa instância própria — ver README do app pra detalhes)
- Não fala mais TCP direto com o concentrador CBC — isso ficou isolado no
  `posto-agente`. A nuvem conversa com o posto via WebSocket
  (`/postos-ws`), não mais `CBC_HOST`/`CBC_PORT` diretamente nela.
- Script pra importar os 60 postos "Sete Estrelas" com localização real:
  `node scripts/importarPostosSeteEstrelas.js`

### 3. Agente do posto (`posto-agente`)
```bash
cd apps/posto-agente
npm install
CBC_HOST=192.168.0.91 CBC_PORT=2001 node index.js
```
- Roda **localmente no computador do posto**
- `CBC_HOST` = IP do concentrador de bombas
- `CBC_PORT` = porta do protocolo CBC (padrão 2001)
- Porta da API local: **3334**

---

## Fluxo completo do sistema

```
Cliente (app)
    │  NFC / código manual → POST /autorizar
    ▼
mobile-backend (nuvem) — cria autorização PENDENTE, não libera nada ainda
    │  push via WebSocket (nova_autorizacao)
    ▼
posto-agente (local no posto) — mostra pedido pro frentista
    │  frentista confirma na tela
    ▼
posto-agente → protocolo CBC → Concentrador de bombas (preset de verdade)
    │  avisa a nuvem (confirmar_autorizacao)
    ▼
mobile-backend (nuvem) — status confirmada_posto
    │  valor real abastecido
    ▼
Cliente (app) → confirma → processa pagamento
```

O preset **nunca** é mandado automaticamente — precisa de confirmação manual
do frentista no posto. Ver README do `mobile-backend` pra detalhe completo do
fluxo pendente → confirmação.

---

## Responsáveis por cada parte

| Projeto | Responsável |
|---|---|
| `mobile-front` | Igor |
| `mobile-backend` | Ana |
| `posto-agente` | Sérgio |
| `posto-front` | A definir |

---

## Branches

| Branch | Conteúdo |
|---|---|
| `main` | Monorepo completo (fonte da verdade) |
| `backend` | Legado — substituído por `apps/mobile-backend/` |

---

## Variáveis de ambiente

### mobile-backend (`.env`, ver `.env.example`)
```env
JWT_SECRET=algum-valor-aleatorio   # obrigatório — servidor recusa subir sem ele
NODE_ENV=development               # ativa o seed automático do posto-dev
PORT=3334                          # opcional, default 3334
```

### mobile-front (`app/config/env.js`)
Escolhe o endereço do backend automaticamente por plataforma em dev — web usa
`localhost`, celular físico (Expo Go) usa o IP da rede local da máquina (não
alcança `localhost`). Atualizar o IP se a rede/DHCP mudar.
