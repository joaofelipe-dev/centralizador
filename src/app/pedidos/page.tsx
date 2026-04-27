"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/Button/Button";
import StoreSelector from "@/components/StoreSelector";
import OrderForm from "@/components/OrderForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header/Header";
import type { Store } from "@/types/product";

export default function PedidosFlowPage() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const { user, loading } = useAuth();
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

  const permittedStores: Store[] = user?.stores || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

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
