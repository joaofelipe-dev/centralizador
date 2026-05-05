import React, { useState, useEffect } from "react";
import { X, Save, Plus, Minus, Package, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import type { Order } from "@/types/order";

interface EditableItem {
  productId: string;
  name: string;
  quantity: number;
  currentStock: number;
}

interface OrderEditModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function OrderEditModal({ order, isOpen, onClose, onSave }: OrderEditModalProps) {
  const [items, setItems] = useState<EditableItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order && order.items) {
      setItems(order.items.map(item => ({
        productId: String(item.productId),
        name: (item as unknown as { product?: { name?: string } }).product?.name || 'Produto Desconhecido',
        quantity: item.quantity,
        currentStock: item.currentStock ?? 0
      })));
    }
  }, [order]);

  const updateItem = (productId: string, field: 'currentStock' | 'quantity', delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const nextValue = Math.max(0, (item[field] || 0) + delta);
        return { ...item, [field]: nextValue };
      }
      return item;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        items: items.map(it => ({
          productId: it.productId,
          quantity: it.quantity,
          currentStock: it.currentStock
        }))
      };
      await api.updateOrder(order!.id, payload);
      onSave();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Erro ao salvar ajustes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      closeOnOverlayClick={false}
      className="glass-card !rounded-xl !p-0 !overflow-visible !max-w-2xl !max-h-[90vh] !flex !flex-col"
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Ajustar Pedido</h3>
              <p className="text-xs text-muted-foreground">{order.store?.name} • Pedido #{String(order.id).split('-')[0]}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item) => (
              <div key={String(item.productId)} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/[0.08] transition-all">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white group-hover:text-primary transition-colors">{item.name}</h4>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Estoque</span>
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                      <button onClick={() => updateItem(item.productId, 'currentStock', -1)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white/10 text-muted-foreground">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-white">{item.currentStock}</span>
                      <button onClick={() => updateItem(item.productId, 'currentStock', 1)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white/10 text-muted-foreground">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Pedido</span>
                    <div className="flex items-center gap-1 bg-primary/10 p-1 rounded-lg border border-primary/20">
                      <button onClick={() => updateItem(item.productId, 'quantity', -1)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white/10 text-primary">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                      <button onClick={() => updateItem(item.productId, 'quantity', 1)} className="h-7 w-7 flex items-center justify-center rounded-md bg-primary text-white shadow-lg shadow-primary/20">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5 h-12">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-12 gap-2 shadow-lg shadow-primary/20">
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Salvar Ajustes
          </Button>
        </div>
      </div>
    </Modal>
  );
}