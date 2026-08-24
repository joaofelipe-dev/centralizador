"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types/auth";

type Role = NonNullable<User["role"]>;

/**
 * Guarda de rota do cliente: manda para /login quem não está autenticado e para
 * a home quem está autenticado mas sem o papel exigido.
 *
 * É conveniência de UI, não segurança — a API é quem decide de fato. Serve para
 * a página não carregar (e não expor sua estrutura) para quem não deveria vê-la.
 */
export function useRequireRole(roles: Role[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const allowed = !!user && roles.includes(user.role as Role);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!allowed) {
      router.push("/");
    }
  }, [user, loading, allowed, router]);

  return { user, loading, allowed };
}
