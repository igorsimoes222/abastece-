import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../config/env';

const USE_MOCK = false;

const MOCK_USER = {
  id: 'usr_001',
  nome: 'Lucas',
  email: 'lucas@email.com',
  cpf: '123.456.789-00',
  telefone: '(12) 99999-0000',
  cashback: '14,63',
  abastecimentos: 7,
};

export const authService = {
  async login(email, senha) {
    if (USE_MOCK) {
      await AsyncStorage.setItem(TOKEN_KEY, 'mock_token_123');
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(MOCK_USER));
      return MOCK_USER;
    }

    const data = await api.post('/auth/login', { email, senha });
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    if (data.refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    return data.usuario;
  },

  async cadastro(payload) {
    if (USE_MOCK) {
      await AsyncStorage.setItem(TOKEN_KEY, 'mock_token_123');
      await AsyncStorage.setItem(USER_KEY, JSON.stringify({ ...MOCK_USER, ...payload }));
      return MOCK_USER;
    }

    const data = await api.post('/auth/cadastro', payload);
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    if (data.refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    return data.usuario;
  },

  async logout() {
    try { await api.post('/auth/logout', {}); } catch {}
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  },

  async getUsuarioLocal() {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async isAutenticado() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },
};
