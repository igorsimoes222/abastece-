import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_KEY = '@abasteceplus:avatar';

export const avatarService = {
  async salvar(uri) {
    await AsyncStorage.setItem(AVATAR_KEY, uri);
  },
  async carregar() {
    return AsyncStorage.getItem(AVATAR_KEY);
  },
  async remover() {
    return AsyncStorage.removeItem(AVATAR_KEY);
  },
};
