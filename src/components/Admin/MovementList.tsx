"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { listMovements } from '@/lib/movement-api';
import type { StockMovement, MovementFilters, MovementType } from '@/types/movement';
import { api } from '@/lib/api';
import type { Product } from '@/types/product';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowDownCircle, ArrowUpCircle, Settings, Package, User, Calendar } from 'lucide-react';

interface MovementListProps {
  onAdjustmentClick: () => void;
}

export function MovementList({ onAdjustmentClick }: MovementListProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MovementFilters>({});

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listMovements(filters);
      setMovements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar movimentações');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  }, []);

  useEffect(() => {
    fetchMovements();
    fetchProducts();
  }, [fetchMovements, fetchProducts]);

  const handleFilterChange = (key: keyof MovementFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'ENTRY': return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case 'EXIT': return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      case 'ADJUST': return <Settings className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'ENTRY': return 'Entrada';
      case 'EXIT': return 'Saída';
      case 'ADJUST': return 'Ajuste';
      default: return type;
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
          <Package className="text-primary h-5 w-5" />
          Histórico de Movimentações
        </h2>
        <Button onClick={onAdjustmentClick} variant="default" className="gap-2">
          <Settings className="h-4 w-4" />
          Novo Ajuste
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 glass-card rounded-xl">
        <Select
          value={filters.type || ''}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">Todos os tipos</option>
          <option value="ENTRY">Entrada</option>
          <option value="EXIT">Saída</option>
          <option value="ADJUST">Ajuste</option>
        </Select>

        <Select
          value={filters.productId || ''}
          onChange={(e) => handleFilterChange('productId', e.target.value)}
        >
          <option value="">Todos os produtos</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>{product.name}</option>
          ))}
        </Select>

        <Input
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          placeholder="Data inicial"
        />

        <Input
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          placeholder="Data final"
        />

        <Button onClick={clearFilters} variant="ghost" className="md:col-span-4">
          Limpar Filtros
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
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
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Data</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Produto</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Tipo</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Quantidade</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Motivo</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Usuário</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-sm text-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(movement.createdAt)}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white font-medium">
                    {movement.product?.name || 'Produto não encontrado'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getMovementIcon(movement.type)}
                      <span className="text-sm text-white">{getMovementTypeLabel(movement.type)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white font-bold">
                    {movement.quantity}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {movement.reason || '-'}
                  </td>
                  <td className="p-4 text-sm text-white">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {movement.user?.name || 'Sistema'}
                    </div>
                  </td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    Nenhuma movimentação encontrada
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
