# Abastece+ — App React Native

## Stack
- React Native + Expo SDK 54
- React Navigation (Native Stack)
- expo-location (geolocalização)

## Como rodar
```bash
npx expo start
```
Escanear QR com Expo Go (Android/iOS) ou pressionar `w` para web.

## Estrutura de telas

```
App.js
└── Stack Navigator
    ├── Splash          → SplashScreen.js       (animação de entrada)
    ├── Onboarding      → OnboardingScreen.js   (3 slides apresentação)
    ├── Login           → LoginScreen.js        (login + cadastro em tabs)
    ├── Mapa            → MapaScreen.js         (home: mapa + postos próximos)
    ├── Autorizacao     → AutorizacaoScreen.js  (bomba + modalidade + valor)
    ├── Abastecendo     → AbastecendoScreen.js  (progresso em tempo real)
    ├── Comprovante     → ComprovanteScreen.js  (recibo + cashback + rating)
    ├── Carteira        → CarteiraScreen.js     (saldo + cashback + cartões + extrato)
    ├── Historico       → HistoricoScreen.js    (gráfico + filtros + lista)
    ├── Perfil          → PerfilScreen.js       (dados + veículos + config)
    └── Frota           → FrotaScreen.js        (gestão de frota PJ)
```

## Tema (components/theme.js)
- Verde principal: `#6CC24A`
- Verde escuro: `#3A7D1E`
- Laranja/cashback: `#FF9800`
- Fundo: `#0B1F0B`
- Card: `#131F13`
- Borda: `#2A3A2A`

## Fluxo principal
Splash → Onboarding → Login → Mapa → Autorizacao → Abastecendo → Comprovante

## Perfis de usuário (conforme PDF)
- **PF** (Consumidor): fluxo principal acima
- **PJ** (Empresa): acesso via Perfil → Gestão de Frota
- **Posto**: app local separado (futuro)
