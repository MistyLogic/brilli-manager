import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/cliente';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la app, pregunta al servidor si ya hay sesión
  useEffect(() => {
    api
      .get('/auth/me')
      .then((datos) => setUsuario(datos.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  // Si el servidor responde 401 en cualquier módulo, vuelve al login
  useEffect(() => {
    const alExpirar = () => setUsuario(null);
    window.addEventListener('sesion-expirada', alExpirar);
    return () => window.removeEventListener('sesion-expirada', alExpirar);
  }, []);

  async function login(username, password) {
    const datos = await api.post('/auth/login', { username, password });
    setUsuario(datos.usuario);
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setUsuario(null);
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}