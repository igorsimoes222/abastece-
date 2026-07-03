import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_KEY = '@abasteceplus:avatar';

function uriValida(uri) {
  if (!uri || typeof uri !== 'string') return false;
  return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('http');
}

export const avatarService = {
  async salvar(uri) {
    if (!uriValida(uri)) return;
    await AsyncStorage.setItem(AVATAR_KEY, uri);
  },
  async carregar() {
    const uri = await AsyncStorage.getItem(AVATAR_KEY);
    if (!uriValida(uri)) {
      if (uri) await AsyncStorage.removeItem(AVATAR_KEY);
      return null;
    }
    return uri;
  },
  async remover() {
    return AsyncStorage.removeItem(AVATAR_KEY);
  },
};
