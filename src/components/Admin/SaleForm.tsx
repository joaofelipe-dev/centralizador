"use client";

import React, { useState, useEffect } from 'react';
import { createSale } from '@/lib/sale-api';
import type { SaleItem, CreateSaleData } from '@/lib/sale-api';
import { listSuppliers } from '@/lib/supplier-api';
import { api } from '@/lib/api';
import type { Supplier } from '@/types/purchase';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ShoppingCart, Package, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SaleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SaleForm({ onSuccess, onCancel }: SaleFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [items, setItems] = useState<(SaleItem & { quantityToSell: number })[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [suppliersData, productsData] = await Promise.all([
        listSuppliers('EXTERNAL'),
        api.getProducts(),
      ]);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch (err) {
      toast.error('Erro ao carregar dados');
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = () => {
    if (!selectedProductId) return;

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existingItemIndex = items.findIndex((item) => item.productId === selectedProductId);
    if (existingItemIndex >= 0) {
      toast.error('Produto já adicionado. Ajuste a quantidade na lista.');
      return;
    }

    setItems([
      ...items,
      {
        productId: product.id,
        quantity: 1,
        quantityToSell: 1,
        product: {
          id: product.id,
          name: product.name,
          stockCD: product.stockCD || 0,
        },
      },
    ]);
    setSelectedProductId('');
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, quantityToSell: Math.max(1, quantity) } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplierId) {
      toast.error('Selecione um fornecedor');
      return;
    }

    if (items.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }

    const invalidItem = items.find((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product && item.quantityToSell > (product.stockCD || 0);
    });

    if (invalidItem) {
      toast.error(`Quantidade insuficiente em estoque para ${invalidItem.product?.name}`);
      return;
    }

    setLoading(true);
    try {
      const saleData: CreateSaleData = {
        supplierId: selectedSupplierId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantityToSell,
        })),
      };

      await createSale(saleData);
      toast.success('Venda registrada com sucesso!');
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao registrar venda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          Fornecedor Externo
        </label>
        <Select
          value={selectedSupplierId}
          onChange={(e) => setSelectedSupplierId(e.target.value)}
          required
        >
          <option value="">Selecione um fornecedor</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Produtos
        </label>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="flex-1"
          >
            <option value="">Selecione um produto</option>
            {filteredProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (Estoque CD: {product.stockCD || 0})
              </option>
            ))}
          </Select>
          <Button type="button" onClick={addItem} disabled={!selectedProductId}>
            Adicionar
          </Button>
        </div>

        {items.length > 0 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Produto</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Estoque CD</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Qtd. Venda</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <tr key={item.productId} className="border-b border-white/5">
                      <td className="p-3 text-sm text-white">{item.product?.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">{product?.stockCD || 0}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={item.quantityToSell}
                          onChange={(e) =>
                            updateItemQuantity(item.productId, Number(e.target.value))
                          }
                          className="w-20"
                          min={1}
                          max={product?.stockCD || 0}
                        />
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.productId)}
                          className="text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Spinner size="sm" /> : <ShoppingCart className="h-4 w-4" />}
          Registrar Venda
        </Button>
      </div>
    </form>
  );
}
