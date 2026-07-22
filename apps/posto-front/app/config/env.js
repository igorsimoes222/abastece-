// URL do backend — mesmo servidor do mobile-front
// Em dev usa mDNS, em produção troca para a URL da nuvem
export const API_URL = __DEV__
  ? 'http://abasteceplus.local:3334'
  : 'https://api.postopratico.com.br';

export const API_TIMEOUT = 10000;

// Polling do status das bombas (ms)
export const POLLING_INTERVAL = 2000;

// Tempo limite para o frentista aprovar (segundos)
export const TIMER_APROVACAO = 30;
