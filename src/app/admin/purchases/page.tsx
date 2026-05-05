'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PackageSearch, ArrowLeft } from 'lucide-react';
import { PurchaseList } from '@/components/Admin/PurchaseList';
import { PurchaseForm } from '@/components/Admin/PurchaseForm';
import { PurchaseReceiveModal } from '@/components/Admin/PurchaseReceiveModal';
import type { PurchaseOrder } from '@/types/purchase';
import { listPurchases } from '@/lib/purchase-api';
import { useRouter } from 'next/navigation';

export default function PurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPurchases();
      setPurchases(data);
    } catch (err) {
      console.error('Erro ao carregar compras:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleNewPurchase = () => {
    setFormOpen(true);
  };

  const handleReceive = (purchase: PurchaseOrder) => {
    setSelectedPurchase(purchase);
    setReceiveOpen(true);
  };

    return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin')}
          className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <PackageSearch className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Gestão de Compras</h1>
          <p className="text-xs text-muted-foreground">Entrada de produtos das CEASAs</p>
        </div>
      </div>

      <PurchaseList
        purchases={purchases}
        loading={loading}
        onNewPurchase={handleNewPurchase}
        onReceive={handleReceive}
      />

      <PurchaseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchPurchases}
      />

      <PurchaseReceiveModal
        open={receiveOpen}
        purchase={selectedPurchase}
        onClose={() => {
          setReceiveOpen(false);
          setSelectedPurchase(null);
        }}
        onSuccess={fetchPurchases}
      />
    </div>
  );
}
