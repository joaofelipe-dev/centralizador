import React, { useState, useEffect } from 'react';
import { createAdjustment } from '@/lib/movement-api';
import type { CreateAdjustmentData } from '@/types/movement';
import { api } from '@/lib/api';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Settings, Package } from 'lucide-react';
import { toast } from 'sonner';

interface AdjustmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AdjustmentForm({ onSuccess, onCancel }: AdjustmentFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAdjustmentData>({
    productId: '',
    quantity: 0,
    reason: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      toast.error('Erro ao carregar produtos');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.reason || formData.quantity === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await createAdjustment(formData);
      toast.success('Ajuste aplicado com sucesso!');
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao aplicar ajuste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Produto
        </label>
        <Select
          value={formData.productId}
          onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
          required
        >
          <option value="">Selecione um produto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} (Estoque CD: {product.stockCD || 0})
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          Quantidade
        </label>
        <Input
          type="number"
          value={formData.quantity || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
          placeholder="Digite a quantidade (positiva para entrada, negativa para saída)"
          required
        />
        <p className="text-xs text-muted-foreground">
          Use valores positivos para entrada e negativos para saída
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">
          Motivo
        </label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
          placeholder="Descreva o motivo do ajuste..."
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          rows={3}
          required
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Spinner size="sm" /> : <Settings className="h-4 w-4" />}
          Aplicar Ajuste
        </Button>
      </div>
    </form>
  );
}
