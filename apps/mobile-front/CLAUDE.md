# mobile-front — App do Cliente (PostoPrático)

App React Native do cliente final. Permite identificar a bomba, autorizar abastecimento, pagar e acompanhar histórico.

---

## Stack

- React Native + **Expo SDK 54**
- React Navigation (Native Stack)
- expo-location (geolocalização)
- expo-asset (ícones/logos no mapa)
- AsyncStorage (token + avatar)
- WebView + Leaflet (mapa interativo)

---

## Como rodar

```bash
cd apps/mobile-front
npm install
npx expo start
```

Escanear QR com **Expo Go** no celular ou pressionar `w` para web.

O backend precisa estar rodando em `apps/mobile-backend` ou `apps/posto-agente`.

---

## Configuração de IP / backend

Arquivo: `app/config/env.js`

```js
// Dev — backend na rede local (mDNS, não precisa mudar o IP)
export const API_URL = 'http://abasteceplus.local:3334';

// Produção — trocar quando subir para nuvem
// export const API_URL = 'https://api.postopratico.com.br';
```

Se o mDNS não funcionar no dispositivo, substituir pelo IP direto:
```js
export const API_URL = 'http://192.168.0.XXX:3334';
```

---

## Estrutura de arquivos

```
apps/mobile-front/
├── App.js                        Navegação principal (Stack Navigator)
├── app/
│   ├── config/
│   │   └── env.js                URL do backend + chaves AsyncStorage
│   ├── context/
│   │   └── AuthContext.js        Estado de autenticação global
│   ├── screens/
│   │   ├── SplashScreen.js       Animação de entrada
│   │   ├── OnboardingScreen.js   3 slides de apresentação
│   │   ├── LoginScreen.js        Login + cadastro em tabs
│   │   ├── MapaScreen.js         Home: mapa Leaflet + postos próximos
│   │   ├── NFCScreen.js          Leitura NFC com ondas animadas
│   │   ├── AutorizacaoScreen.js  Bomba + bico + valor + confirmação
│   │   ├── AbastecendoScreen.js  Progresso em tempo real (polling)
│   │   ├── ConfirmacaoValorScreen.js  Confirma valor real abastecido
│   │   ├── PagamentoScreen.js    Seleção de forma de pagamento
│   │   ├── ComprovanteScreen.js  Recibo digital + cashback + rating
│   │   ├── CarteiraScreen.js     Saldo + cashback + cartões + extrato
│   │   ├── HistoricoScreen.js    Lista de abastecimentos + filtros
│   │   ├── PerfilScreen.js       Dados pessoais + veículos + config
│   │   ├── FrotaScreen.js        Gestão de frota (PJ)
│   │   ├── NotificacoesScreen.js Notificações do app
│   │   ├── DadosPessoaisScreen.js Edição de dados
│   │   ├── SegurancaScreen.js    Troca de senha
│   │   ├── PreAutorizacaoScreen.js Pré-autorização de crédito
│   │   └── PagoDiretoPostoScreen.js Registro de pagamento no caixa
│   └── services/
│       ├── api.js                Cliente HTTP com interceptor de token
│       ├── authService.js        Login, cadastro, refresh token
│       ├── avatarService.js      Foto de perfil (AsyncStorage + validação URI)
│       ├── abastecimentoService.js Iniciar/acompanhar abastecimento
│       ├── carteiraService.js    Saldo e extrato de cashback
│       ├── pagamentoService.js   Processar pagamentos
│       └── postosService.js      Buscar postos próximos
├── components/
│   ├── theme.js                  Cores, espaçamentos e raios globais
│   ├── ScreenWrapper.js          Wrapper com SafeArea
│   ├── ErroConexao.js            Tela de erro de conexão
│   └── LogoBranca.js             Logo do app
└── assets/                       Imagens, ícones e splash
```

---

## Fluxo de navegação

```
Splash → Onboarding → Login
                          └── Mapa (home)
                                ├── NFC → Autorizacao → Abastecendo → ConfirmacaoValor → Pagamento → Comprovante
                                ├── Carteira
                                ├── Historico
                                ├── Perfil
                                │     ├── DadosPessoais
                                │     ├── Seguranca
                                │     └── Frota (PJ)
                                └── Notificacoes
```

---

## Geofence de segurança

O botão **Abastecer** só é liberado quando o cliente está a **menos de 150 metros** do posto selecionado. Implementado em `MapaScreen.js` com a fórmula de Haversine.

Objetivo: impedir fraude (alguém de fora autorizar abastecimento com código de outro cliente).

---

## Tema

| Token | Valor | Uso |
|---|---|---|
| `colors.verde` | `#6CC24A` | Ações principais, destaque |
| `colors.verdeBg` | `rgba(108,194,74,0.08)` | Fundos de cards ativos |
| `colors.laranja` | `#FF9800` | Cashback, avisos |
| `colors.bg` | `#0B1F0B` | Fundo da tela |
| `colors.card` | `#131F13` | Fundo de cards |
| `colors.border` | `#2A3A2A` | Bordas |
| `colors.text` | `#FFFFFF` | Texto principal |
| `colors.textSec` | `#A0B8A0` | Texto secundário |
| `colors.textMuted` | `#607060` | Texto desabilitado |

---

## Autenticação

- Token JWT armazenado em AsyncStorage (`@abasteceplus:token`)
- Interceptor em `api.js` injeta o token em toda requisição
- `AuthContext.js` detecta token expirado e redireciona para Login
- Tokens mock (sem `eyJ`) são limpos automaticamente no startup

---

## NFC

- `NFCScreen.js` contém animação de ondas pulsantes (sem pacote externo)
- Em produção: integrar `react-native-nfc-manager` (requer custom dev client)
- Tag NFC: NTAG213 com JSON `{ bico, bomba, posto_id, combustivel }`
- Botão **DEV** (`__DEV__`) simula leitura NFC para testes
- Fallback: botão "Prefere digitar o código?" → `AutorizacaoScreen`
