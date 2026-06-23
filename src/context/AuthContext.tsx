"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { User, AuthContextType } from "@/types/auth";

const STORAGE_KEYS = {
  USER: 'offline_user',
  TOKEN: 'token',
} as const;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      // ponytail: restaura user do cache antes de chamar API
      // Assim a UI aparece instantaneamente no refresh
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch { localStorage.removeItem(STORAGE_KEYS.USER); }
      }

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (!isOnline) {
        setLoading(false);
        return;
      }

      try {
        const { user } = await api.getMe();
        setUser(user);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } catch {
        // fallback silencioso — se já tem user do cache, mantém
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  async function login(username: string, password: string) {
    try {
      const { user, token } = await api.login({ username, password });
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      setUser(user);
      router.push('/');
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Falha na autenticação',
      };
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
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