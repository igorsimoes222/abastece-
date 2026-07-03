// DEV local: aponta para o backend rodando no notebook
export const API_URL = 'http://192.168.0.110:3334';

// PROD (quando subir para nuvem):
// export const API_URL = 'https://api.abasteceplus.com.br/v1';

// Tempo limite das requisições (ms)
export const API_TIMEOUT = 10000;

// Chave para armazenar o token no AsyncStorage
export const TOKEN_KEY         = '@abasteceplus:token';
export const REFRESH_TOKEN_KEY = '@abasteceplus:refresh_token';
export const USER_KEY          = '@abasteceplus:user';
