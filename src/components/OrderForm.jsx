"use client";

import { useState } from "react";
import { Package, Plus, Minus, Send, CheckCircle2, ChevronLeft, Carrot, Apple, LeafyGreen } from "lucide-react";
import { Button } from "@/components/Button/Button";
import { products } from "@/constants/products";

export default function OrderForm({ store, onBack }) {
  const [cart, setCart] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateQuantity = (id, delta) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-slide-up">
        <div className="h-20 w-20 bg-green-500/10 text-green-500 flex items-center justify-center rounded-full mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pedido Enviado!</h2>
        <p className="text-muted-foreground mb-8">
          Seu pedido para a <strong>{store.name}</strong> foi processado com sucesso.
        </p>
        <Button
          onClick={onBack}
          variant="default"
          className="px-8"
        >
          Novo Pedido
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 animate-slide-up">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-secondary/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{store.name}</h2>
            <p className="text-xs text-muted-foreground">Novo Pedido de Compra</p>
          </div>
        </div>

        <div className="space-y-8 pb-20 ">
          {Object.entries(products).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                {category === "Legumes" ? (
                  <Carrot className="h-5 w-5 text-orange-500" />
                ) : category === "Frutas" ? (
                  <Apple className="h-5 w-5 text-red-500" />
                ) : (
                  <LeafyGreen className="h-5 w-5 text-green-500" />
                )}
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {category}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Header for Desktop */}
                <div className="hidden md:grid grid-cols-[1fr_120px_160px] gap-4 px-6 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  <span>Produto</span>
                  <span className="text-center">Estoque CD</span>
                  <span className="text-right">Quantidade</span>
                </div>

                {items.map((product) => (
                  <div key={product.id} className="glass-card p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-white/10 group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        {category === "Legumes" ? (
                          <Carrot className="h-6 w-6" />
                        ) : category === "Frutas" ? (
                          <Apple className="h-6 w-6" />
                        ) : (
                          <LeafyGreen className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">{product.name}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{product.category}</p>
                      </div>
                    </div>

                    {/* Estoque CD Info */}
                    <div className="flex items-center justify-between md:justify-center w-full md:w-[120px] px-2 py-1 md:py-0 rounded-lg bg-white/5 md:bg-transparent">
                      <span className="text-[10px] md:hidden text-muted-foreground uppercase font-bold">Estoque CD</span>
                      <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-primary/50" />
                        <span className="text-sm font-bold text-white">--</span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between md:justify-end w-full md:w-[160px]">
                      <span className="text-[10px] md:hidden text-muted-foreground uppercase font-bold">Sua Lista</span>
                      <div className="flex items-center gap-3 bg-secondary/30 p-1 rounded-xl border border-white/5 ring-1 ring-white/5 shadow-inner">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-90 transition-all text-white"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-white">
                          {cart[product.id] || 0}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-90 transition-all"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {totalItems > 0 && (
          <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full max-w-sm glass-card h-14 rounded-2xl font-semibold shadow-2xl"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-3" />
                  Finalizar Pedido ({totalItems})
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
