"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import StoreSelector from "@/components/StoreSelector";
import OrderForm from "@/components/OrderForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import type { Store } from "@/types/product";

const STORE_KEY = "current_order_store";

function getSavedStore(): Store | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export default function PedidosFlowPage() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(getSavedStore);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSelectStore = useCallback((store: Store) => {
    setSelectedStore(store);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch { /* quota exceeded */ }
  }, []);

  const handleBack = useCallback(() => {
    setSelectedStore(null);
    try {
      localStorage.removeItem(STORE_KEY);
      localStorage.removeItem("order_form_draft");
    } catch { /* ignore */ }
  }, []);

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
      <main className="flex-1 flex flex-col py-8 pb-32">
        {!selectedStore ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StoreSelector
              onSelect={handleSelectStore}
              stores={permittedStores}
              requiresAuth
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <OrderForm
              store={selectedStore}
              onBack={handleBack}
            />
          </div>
        )}
      </main>
    </div>
  );
}
