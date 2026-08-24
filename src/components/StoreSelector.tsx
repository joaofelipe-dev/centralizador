"use client";

import { useState } from "react";
import { Store, ChevronRight, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Store as StoreType } from "@/types/product";

interface StoreSelectorProps {
  stores?: StoreType[];
  onSelect: (store: StoreType) => void;
  requiresAuth?: boolean;
}

export default function StoreSelector({ onSelect, stores: assignedStores = [], requiresAuth = false }: StoreSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStores = assignedStores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-md md:max-w-xl mx-auto p-4 animate-slide-up">
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Selecione sua Loja</h2>
          <p className="text-muted-foreground">Escolha a unidade para realizar o pedido.</p>
        </div>

        <Input
          type="text"
          placeholder="Buscar loja..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />

        <div className="grid gap-3">
          {filteredStores.length === 0 ? (
            <Card padding="md" className="text-center">
              <p className="text-sm text-muted-foreground">{requiresAuth ? 'Você não tem permissão para nenhuma loja. Contate o administrador.' : 'Nenhuma loja encontrada.'}</p>
            </Card>
          ) : (
            filteredStores.map((store) => (
              <button
                key={store.id}
                type="button"
                onClick={() => onSelect(store)}
                className="group flex min-h-16 items-center justify-between rounded-lg border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-surface-hover"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{store.name}</h3>
                    <p className="text-xs text-muted-foreground">{store.address}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
