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

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

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
      } catch (error) {
        // 401 significa sessão inválida ou expirada: o cache local não vale mais
        // nada e manter o usuário na tela só produz telas que falham uma a uma.
        // Qualquer outra falha (rede caída, backend fora) preserva o cache —
        // é exatamente o caso que o modo offline existe para atender.
        if ((error as { status?: number })?.status === 401) {
          clearSession();
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

  async function logout() {
    // O cookie httpOnly vale 7 dias e o cliente não consegue apagá-lo sozinho —
    // sem esta chamada a sessão sobrevive ao "sair". Se a rede falhar, ainda
    // assim limpamos o lado do cliente.
    try {
      await api.logout();
    } catch {
      // sem rede: o cookie expira sozinho, seguimos com a limpeza local
    }
    clearSession();
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