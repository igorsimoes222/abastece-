# PostoPrático — Monorepo

Plataforma nacional de abastecimento digital — SECC Informática / Rede Sete Estrelas.

## Estrutura

```
apps/
├── mobile-front/     App do cliente (React Native + Expo)
├── mobile-backend/   API REST em nuvem (Node.js + MySQL)
├── posto-agente/     Agente local do posto (Node.js + protocolo CBC)
└── posto-front/      App do frentista na Smart Cielo (React Native)

packages/
└── domain/           Lógica de negócio compartilhada (tipos, validações)
```

## Como rodar cada parte

### App do cliente
```bash
cd apps/mobile-front
npx expo start
```

### Backend (nuvem)
```bash
cd apps/mobile-backend
node server.js
```

### Agente do posto (CBC)
```bash
cd apps/posto-agente
CBC_HOST=192.168.0.91 CBC_PORT=2001 node index.js
```
