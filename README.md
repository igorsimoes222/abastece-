# PostoPrático — Monorepo

Plataforma nacional de abastecimento digital — **SECC Informática / Rede Sete Estrelas**

---

## Estrutura do repositório

```
postopratico/
├── apps/
│   ├── mobile-front/     App do cliente (React Native + Expo)
│   ├── mobile-backend/   API REST em nuvem (Node.js + MySQL)
│   ├── posto-agente/     Agente local do posto — protocolo CBC (Node.js)
│   └── posto-front/      App do frentista na Smart Cielo (React Native) [futuro]
└── packages/
    └── domain/           Lógica de negócio compartilhada [futuro]
```

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
node server.js
```
- Porta padrão: **3334**
- Banco: SQLite local em dev → MySQL em produção
- Variáveis de ambiente: `CBC_HOST`, `CBC_PORT`

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
    │  NFC / código manual
    ▼
mobile-backend (nuvem)
    │  autoriza + notifica
    ▼
posto-agente (local no posto)
    │  protocolo CBC
    ▼
Concentrador de bombas
    │  programa + monitora
    ▼
mobile-backend (nuvem)
    │  valor real abastecido
    ▼
Cliente (app) → confirma → Cielo processa pagamento
```

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

### mobile-backend
```env
CBC_HOST=192.168.0.91       # IP do concentrador de bombas
CBC_PORT=2001               # Porta do protocolo CBC
PORT=3334                   # Porta da API HTTP
```

### mobile-front (`app/config/env.js`)
```js
// Dev: backend na rede local via mDNS
export const API_URL = 'http://abasteceplus.local:3334';

// Produção: trocar para URL da nuvem
// export const API_URL = 'https://api.postopratico.com.br';
```
