'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import type { PurchaseOrderItem, Supplier } from '@/types/purchase';
import { createPurchase, listSuppliers } from '@/lib/purchase-api';

interface PurchaseFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Product {
  id: string;
  name: string;
  stockCD: number;
}

export function PurchaseForm({ open, onClose, onSuccess }: PurchaseFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState<(PurchaseOrderItem & { productName?: string; stockCD?: number })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    try {
      const data = await listSuppliers('CEASA');
      setSuppliers(data);
    } catch {
      toast.error('Erro ao carregar fornecedores');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3333` : 'http://localhost:3333')}/products`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include',
        }
      );
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchSuppliers();
      fetchProducts();
      setSelectedSupplier('');
      setItems([]);
      setSearch('');
    }
  }, [open, fetchSuppliers, fetchProducts]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (product: Product) => {
    if (items.some(i => i.productId === product.id)) return;
    setItems(prev => [...prev, {
      id: '',
      productId: product.id,
      productName: product.name,
      stockCD: product.stockCD,
      quantity: 1,
      unitCost: undefined,
    }]);
  };

  const updateItem = (index: number, field: string, value: number) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedSupplier) {
      toast.error('Selecione um fornecedor');
      return;
    }
    if (items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    setLoading(true);

    try {
      await createPurchase({
        supplierId: selectedSupplier,
        items: items.map(({ productId, quantity, unitCost }) => ({
          productId,
          quantity,
          unitCost,
        })),
      });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nova Compra" size="lg">
      <div className="space-y-4">

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Fornecedor (CEASA)
          </label>
          <Select
            value={selectedSupplier}
            onChange={e => setSelectedSupplier(e.target.value)}
            className="w-full"
          >
            <option value="">Selecione...</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Buscar Produto
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Digite para buscar..."
              variant="default"
            />
          </div>
        </div>

        {search && filteredProducts.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-card">
            {filteredProducts.map(p => (
              <button
                key={p.id}
                onClick={() => addItem(p)}
                className="w-full text-left px-3 py-2 hover:bg-surface-hover flex items-center justify-between text-sm text-foreground transition-colors"
              >
                <span>{p.name}</span>
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Package className="h-4 w-4" />
            Itens ({items.length})
          </h4>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-card border border-border">
              <div className="col-span-4 text-xs text-foreground truncate">
                {item.productName}
              </div>
              <div className="col-span-2 text-[10px] text-muted-foreground">
                Est: {item.stockCD || 0}
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                  min={1}
                  className="h-7 text-xs"
                  variant="ghost"
                />
              </div>
              <div className="col-span-3">
                  <Input
                    type="number"
                    value={item.unitCost || ''}
                    onChange={e => updateItem(index, 'unitCost', Number(e.target.value))}
                    placeholder="Custo"
                    step="0.01"
                    className="h-7 text-xs"
                    variant="ghost"
                  />
              </div>
              <div className="col-span-1">
                <button
                  onClick={() => removeItem(index)}
                  className="text-destructive hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Busque e adicione produtos acima
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
