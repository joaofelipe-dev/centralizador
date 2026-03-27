"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/Button/Button";
import StoreSelector from "@/components/StoreSelector";
import OrderForm from "@/components/OrderForm";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PedidosFlowPage() {
  const [selectedStore, setSelectedStore] = useState(null);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando seus acessos...</p>
        </div>
      </div>
    );
  }

  const permittedStores = user?.stores || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                Central <span className="text-primary">Pedidos</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user?.isAdmin && (
              <Button
                onClick={() => router.push('/admin')}
                variant="ghost"
                className="hidden md:flex items-center gap-2 rounded-full px-4 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-white transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                Painel Admin
              </Button>
            )}

            <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block" />

            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-white">{user.name}</p>
              <p className="text-[10px] text-muted-foreground">{user.username}</p>
            </div>

            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col py-8 pb-32">
        {!selectedStore ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StoreSelector
              onSelect={setSelectedStore}
              stores={permittedStores}
              requiresAuth
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <OrderForm
              store={selectedStore}
              onBack={() => setSelectedStore(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
