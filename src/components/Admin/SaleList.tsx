"use client";

import React, { useState, useEffect } from 'react';
import { listSales } from '@/lib/sale-api';
import type { Sale } from '@/lib/sale-api';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ShoppingCart, Package, Calendar, User, DollarSign } from 'lucide-react';

interface SaleListProps {
  onSaleClick: () => void;
}

export function SaleList({ onSaleClick }: SaleListProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listSales();
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart className="text-primary h-5 w-5" />
          Histórico de Vendas
        </h2>
        <Button onClick={onSaleClick} variant="default" className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table hoverable className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Fornecedor</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Data</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Total de Itens</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor Total</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Usuário</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-border hover:bg-surface-hover">
                  <td className="p-4 text-sm text-foreground font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      {sale.supplier?.name || 'Fornecedor não encontrado'}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(sale.createdAt)}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-foreground font-bold">
                    {sale.totalItems || sale.items?.length || 0} itens
                  </td>
                  <td className="p-4 text-sm text-foreground font-bold">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-success" />
                      {sale.totalValue ? formatCurrency(sale.totalValue) : 'N/A'}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {sale.user?.name || 'Sistema'}
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
