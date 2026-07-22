import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario]       = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [sessaoExpirada, setSessaoExpirada] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    authService.getUsuarioLocal().then(u => {
      setUsuario(u);
      setCarregando(false);
    });
  }, []);

  const tratarErro = (err) => {
    if (err?.status === 401) {
      setSessaoExpirada(true);
      setUsuario(null);
      authService.logout();
    }
    throw err;
  };

  const login = async (email, senha) => {
    try {
      const u = await authService.login(email, senha);
      setUsuario(u);
      setSessaoExpirada(false);
      return u;
    } catch (err) { throw err; }
  };

  const cadastro = async (payload) => {
    try {
      const u = await authService.cadastro(payload);
      setUsuario(u);
      return u;
    } catch (err) { throw err; }
  };

  const logout = async () => {
    await authService.logout();
    setUsuario(null);
    setSessaoExpirada(false);
  };

  const atualizarUsuario = (dados) => {
    setUsuario(prev => ({ ...prev, ...dados }));
  };

  return (
    <AuthContext.Provider value={{
      usuario, carregando, sessaoExpirada,
      login, cadastro, logout, atualizarUsuario, tratarErro,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
