// Endereço do backend — usa mDNS em dev, URL fixa em produção
const MDNS_URL  = 'http://abasteceplus.local:3334';
const PROD_URL  = 'https://api.abasteceplus.com.br';

export const API_URL     = __DEV__ ? MDNS_URL : PROD_URL;
export const API_TIMEOUT = 10000;

export const TOKEN_KEY         = '@abasteceplus:token';
export const REFRESH_TOKEN_KEY = '@abasteceplus:refresh_token';
export const USER_KEY          = '@abasteceplus:user';
