"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { user } = await api.getMe();
          setUser(user);
        } catch (error) {
          console.error("Erro ao carregar usuário:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  async function login(username, password) {
    try {
      const { user, token } = await api.login({ username, password });
      localStorage.setItem('token', token);
      setUser(user);
      router.push('/');
      console.info('Login bem-sucedido para usuário', user.username)
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error)
      return {
        success: false,
        message: error?.message || 'Falha na autenticação',
      };
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
