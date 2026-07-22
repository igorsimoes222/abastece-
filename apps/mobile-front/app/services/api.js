import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_TIMEOUT, TOKEN_KEY, REFRESH_TOKEN_KEY } from '../config/env';

async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

async function refreshToken() {
  const refresh = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) throw { status: 401, message: 'Sessão expirada. Faça login novamente.' };

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });

  if (!res.ok) {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
    throw { status: 401, message: 'Sessão expirada. Faça login novamente.' };
  }

  const data = await res.json();
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  if (data.refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  return data.token;
}

async function request(method, path, body, retry = true) {
  const token = await getToken();

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Token expirado — tenta renovar uma vez
    if (res.status === 401 && retry) {
      const newToken = await refreshToken();
      headers['Authorization'] = `Bearer ${newToken}`;
      return request(method, path, body, false);
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw { status: res.status, message: data.mensagem ?? data.message ?? mensagemPorStatus(res.status) };
    }

    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw { message: 'Tempo limite excedido. Verifique sua conexão.', code: 'TIMEOUT' };
    }
    if (err.message === 'Network request failed') {
      throw { message: 'Sem conexão com a internet.', code: 'OFFLINE' };
    }
    throw err;
  }
}

function mensagemPorStatus(status) {
  const msgs = {
    400: 'Dados inválidos.',
    403: 'Acesso não permitido.',
    404: 'Recurso não encontrado.',
    409: 'Conflito com dados existentes.',
    422: 'Dados inválidos.',
    429: 'Muitas tentativas. Aguarde um momento.',
    500: 'Erro no servidor. Tente novamente.',
    502: 'Servidor indisponível. Tente novamente.',
    503: 'Serviço temporariamente indisponível.',
  };
  return msgs[status] ?? 'Erro inesperado. Tente novamente.';
}

export const api = {
  get:    (path)       => request('GET',    path),
  post:   (path, body) => request('POST',   path, body),
  put:    (path, body) => request('PUT',    path, body),
  patch:  (path, body) => request('PATCH',  path, body),
  delete: (path)       => request('DELETE', path),
};
