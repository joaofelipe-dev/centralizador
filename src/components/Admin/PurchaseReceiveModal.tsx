'use client';

import React from 'react';
import { CheckCircle2, Package, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { PurchaseOrder } from '@/types/purchase';
import { receivePurchase } from '@/lib/purchase-api';

interface PurchaseReceiveModalProps {
  open: boolean;
  purchase: PurchaseOrder | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PurchaseReceiveModal({ open, purchase, onClose, onSuccess }: PurchaseReceiveModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleReceive = async () => {
    if (!purchase) return;
    setLoading(true);
    setError('');

    try {
      await receivePurchase(purchase.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao receber compra');
    } finally {
      setLoading(false);
    }
  };

  if (!purchase) return null;

  return (
    <Modal open={open} onClose={onClose} title="Confirmar Recebimento" size="lg">
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 p-3 rounded-lg bg-surface">
          <Truck className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm font-bold text-foreground">
              {purchase.supplier?.name || 'CEASA'}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Package className="h-4 w-4" />
            Itens da Compra
          </h4>

          <div className="space-y-1 max-h-60 overflow-y-auto">
            {purchase.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-surface text-xs"
              >
                <div className="col-span-5 text-foreground truncate">
                  {item.product?.name || 'Produto'}
                </div>
                <div className="col-span-3 text-muted-foreground">
                  Qtd: {item.quantity}
                </div>
                <div className="col-span-4 flex items-center gap-1 text-muted-foreground">
                  <span>Est: {item.product?.stockCD || 0}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="text-success">
                    {((item.product?.stockCD || 0) + item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <p className="text-xs text-warning">
            Ao confirmar, o estoque CD de cada produto será atualizado automaticamente.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleReceive}
            disabled={loading}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? 'Confirmando...' : 'Confirmar Recebimento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
