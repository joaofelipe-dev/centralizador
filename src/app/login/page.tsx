"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Lock, Loader2, User, UserRound } from "lucide-react";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await login(username, password);

    if (!result.success) {
      setError(result.message || "Falha na autenticação. Verifique seu usuário e senha e tente novamente.");
      setIsLoading(false);
    }
  }

    return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-[#3DE585]/50 to-[#138565]/50">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {error}
              </div>
            )}
            <User className="h-16 w-16 mx-auto rounded-full bg-primary p-3" />
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  Usuário
                </label>
                  <Input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="usuario"
                    aria-label="Nome de usuário"
                    aria-required="true"
                    autoComplete="username"
                  />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha
                </label>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    aria-label="Senha"
                    aria-required="true"
                    autoComplete="current-password"
                  />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-6 text-base font-semibold shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
