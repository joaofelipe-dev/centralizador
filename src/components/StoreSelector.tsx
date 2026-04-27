"use client";

import { useState } from "react";
import { Store, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/Button/Button";
import { stores } from "@/constants/stores";
import { Store as StoreType } from "@/types/product";

interface StoreSelectorProps {
  stores?: StoreType[];
  onSelect: (store: StoreType) => void;
  requiresAuth?: boolean;
}

export default function StoreSelector({ onSelect, stores: assignedStores = [], requiresAuth = false }: StoreSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const storeList = assignedStores.length > 0 ? assignedStores : stores;

  const filteredStores = storeList.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-md md:max-w-xl mx-auto p-4 animate-slide-up">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Selecione sua Loja</h2>
          <p className="text-muted-foreground">Escolha a unidade para realizar o pedido.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar loja..."
            className="w-full bg-secondary/50 border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-3">
          {filteredStores.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-sm text-muted-foreground">{requiresAuth ? 'Você não tem permissão para nenhuma loja. Contate o administrador.' : 'Nenhuma loja encontrada.'}</p>
            </div>
          ) : (
            filteredStores.map((store) => (
              <Button
                key={store.id}
                onClick={() => onSelect(store)}
                className="group glass-card px-4 py-10 flex items-center justify-between transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{store.name}</h3>
                    <p className="text-xs text-muted-foreground">{store.address}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
              </Button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}