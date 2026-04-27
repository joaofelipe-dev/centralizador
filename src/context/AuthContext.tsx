"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { User, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

  async function login(username: string, password: string) {
    try {
      const { user, token } = await api.login({ username, password });
      localStorage.setItem('token', token);
      setUser(user);
      router.push('/');
      console.info('Login bem-sucedido para usuário', user.username)
      return { success: true };
    } catch (error: unknown) {
      console.error('Erro no login:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Falha na autenticação',
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};