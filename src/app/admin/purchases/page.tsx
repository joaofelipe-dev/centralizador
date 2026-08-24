'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PackageSearch } from 'lucide-react';
import { PurchaseList } from '@/components/Admin/PurchaseList';
import { PurchaseForm } from '@/components/Admin/PurchaseForm';
import { PurchaseReceiveModal } from '@/components/Admin/PurchaseReceiveModal';
import type { PurchaseOrder } from '@/types/purchase';
import { listPurchases } from '@/lib/purchase-api';
import { PageNav } from '@/components/PageNav';
import { useRequireRole } from '@/hooks/useRequireRole';

export default function PurchasesPage() {
  const { loading: authLoading, allowed } = useRequireRole(['ADMIN']);
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
    if (!allowed) return;
    fetchPurchases();
  }, [fetchPurchases, allowed]);

  const handleNewPurchase = () => {
    setFormOpen(true);
  };

  const handleReceive = (purchase: PurchaseOrder) => {
    setSelectedPurchase(purchase);
    setReceiveOpen(true);
  };

  if (authLoading || !allowed) return null;

    return (
    <>
      <PageNav
        title="Gestão de Compras"
        description="Entrada de produtos das CEASAs"
        backHref="/admin"
        icon={<PackageSearch className="h-5 w-5 text-primary" />}
      />
      <div className="space-y-6 p-6">

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
    </>
  );
}
