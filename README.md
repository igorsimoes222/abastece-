# PostoPrático — App Mobile

Plataforma Nacional de Abastecimento Digital e Gestão de Frotas

## Pré-requisitos

- Node.js 18+ instalado (https://nodejs.org)
- Expo Go no celular (Google Play ou App Store)

## Como rodar

1. Descompacte este arquivo em `C:\Projetos\PostoPratico\telas-app\`

2. Abra o terminal (CMD ou PowerShell) na pasta e rode:

```bash
npm install
npx expo start
```

3. Escaneie o QR Code com o Expo Go no celular

## Telas incluídas

| Arquivo | Tela |
|---------|------|
| SplashScreen.jsx | Login / Entrada |
| LoginScreen.jsx | Autenticação |
| CadastroScreen.jsx | Cadastro em 3 etapas |
| MapaScreen.jsx | Mapa de postos credenciados |
| AutorizacaoScreen.jsx | Seleção de bomba e autorização |
| AbastecendoScreen.jsx | Acompanhamento em tempo real |
| ComprovanteScreen.jsx | Comprovante e cashback |
| HistoricoScreen.jsx | Histórico de abastecimentos |
| FrotaScreen.jsx | Gestão de frota (PJ) |

## Fluxo principal

```
Splash → Login → Mapa → Autorização → Abastecendo → Comprovante
                   ↓
               Histórico / Frota
```

## Próximos passos

- Integrar `react-native-maps` para mapa real
- Conectar API de pagamentos Cielo
- Implementar integração com concentrador de bombas
- Adicionar notificações push (Expo Notifications)
- Tela do operador do posto (lado Sérgio)
