"use client";

import { useEffect } from "react";
import { ShoppingBag, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/Button/Button";
import Onboarding from "@/components/Onboarding";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

const Home = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (user && hasCompletedOnboarding) {
      router.push('/pedidos');
    }
  }, [user, loading, router]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    router.push('/pedidos');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar position="top" sticky className="z-[80]" maxWidth="max-w-7xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap">
            Central <span className="text-primary">Pedidos</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {(user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
                <Link href="/admin">
                  <Button variant="ghost" className="flex items-center gap-2 rounded-full px-4 text-sm font-medium text-primary hover:text-primary hover:bg-primary/10">
                    <ShieldCheck className="h-4 w-4" />
                    Painel Admin
                  </Button>
                </Link>
              )}
              <Link href="/pedidos">
                <Button variant="ghost" className="rounded-full px-4 text-sm font-medium">
                  Meus Pedidos
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="flex items-center gap-2 rounded-full px-4 text-sm font-medium">
                <LogIn className="h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </Navbar>

      <main className="flex-1 flex flex-col items-center justify-center py-12">
        <Onboarding onComplete={handleOnboardingComplete} />
      </main>
    </div>
  );
}

export default Home;