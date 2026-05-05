'use client';

import React from 'react';
import { ShoppingCart, Truck, Calendar, Package, CheckCircle2, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import type { PurchaseOrder } from '@/types/purchase';

interface PurchaseListProps {
  purchases: PurchaseOrder[];
  loading?: boolean;
  onNewPurchase: () => void;
  onReceive: (purchase: PurchaseOrder) => void;
}

export function PurchaseList({ purchases, loading, onNewPurchase, onReceive }: PurchaseListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge color="warning" variant="soft">Rascunho</Badge>;
      case 'RECEIVED':
        return <Badge color="success" variant="soft">Recebido</Badge>;
      case 'CANCELLED':
        return <Badge color="danger" variant="soft">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="text-primary h-5 w-5" />
          Compras (CEASA)
        </h2>
        <Button onClick={onNewPurchase} variant="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Compra
        </Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table hoverable loading={loading}>
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs font-medium text-muted-foreground">Fornecedor</th>
              <th className="text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground">Data</th>
              <th className="text-left text-xs font-medium text-muted-foreground">Itens</th>
              <th className="text-right text-xs font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-b border-white/5">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-sm text-white font-medium">
                      {purchase.supplier?.name || 'CEASA'}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  {getStatusBadge(purchase.status)}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(purchase.createdAt)}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {purchase.items.length} produtos
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  {purchase.status === 'DRAFT' && (
                    <Button
                      onClick={() => onReceive(purchase)}
                      variant="glass"
                      size="sm"
                      className="gap-2 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Receber
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {purchases.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhuma compra encontrada.</p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
