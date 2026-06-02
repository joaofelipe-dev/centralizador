"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { User, AuthContextType } from "@/types/auth";

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'offline_user',
} as const;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

        if (!isOnline) {
          const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              localStorage.removeItem(STORAGE_KEYS.USER);
            }
          }
          setLoading(false);
          return;
        }

        try {
          const { user } = await api.getMe();
          setUser(user);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        } catch (error) {
          const isNetworkError = error instanceof Error && (
            error.message === 'Failed to fetch' ||
            error.message.includes('conectar ao servidor')
          );

          if (isNetworkError) {
            const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
            if (savedUser) {
              try {
                setUser(JSON.parse(savedUser));
              } catch {
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
              }
            }
          } else {
            console.error("Erro ao carregar usuário:", error);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            setUser(null);
          }
        }
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  async function login(username: string, password: string) {
    try {
      const { user, token } = await api.login({ username, password });
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
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
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
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