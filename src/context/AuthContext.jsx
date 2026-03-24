import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('calorie:token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('calorie:user');
    return raw ? JSON.parse(raw) : null;
  });

  const saveAuth = useCallback((data) => {
    localStorage.setItem('calorie:token', data.token);
    localStorage.setItem('calorie:user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    saveAuth(data);
  }, [saveAuth]);

  const register = useCallback(async (email, password) => {
    const data = await api.register(email, password);
    saveAuth(data);
  }, [saveAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('calorie:token');
    localStorage.removeItem('calorie:user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('calorie:user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
