import { Platform } from 'react-native';

// Endereço do backend em dev — o mobile-backend não faz mDNS (decisão da
// sessão: arquitetura de posto único via mDNS foi descartada em favor de
// nuvem + WebSocket pro posto). Por isso o endereço muda por plataforma:
//   - Web (Expo web/navegador): localhost funciona direto, mesma máquina.
//   - Celular físico (Expo Go): precisa do IP da rede local da máquina —
//     localhost não é alcançável a partir do celular. Atualizar LAN_IP se a
//     rede/DHCP mudar (rodar `ipconfig` e pegar o IPv4 do adaptador Wi-Fi).
const LOCALHOST_URL = 'http://localhost:3334';
const LAN_IP_URL    = 'http://192.168.0.106:3334';
const PROD_URL      = 'https://api.abasteceplus.com.br';

const DEV_URL = Platform.OS === 'web' ? LOCALHOST_URL : LAN_IP_URL;

export const API_URL     = __DEV__ ? DEV_URL : PROD_URL;
export const API_TIMEOUT = 10000;

export const TOKEN_KEY         = '@abasteceplus:token';
export const REFRESH_TOKEN_KEY = '@abasteceplus:refresh_token';
export const USER_KEY          = '@abasteceplus:user';
