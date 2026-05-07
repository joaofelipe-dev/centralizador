"use client";

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { SaleList } from '@/components/Admin/SaleList';
import { SaleForm } from '@/components/Admin/SaleForm';
import { Modal } from '@/components/ui/Modal';
import { PageNav } from '@/components/PageNav';

export default function SalesPage() {
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaleSuccess = () => {
    setSaleModalOpen(false);
    setRefreshKey(k => k + 1);
  };

    return (
    <>
      <PageNav
        title="Vendas"
        description="Registre vendas para fornecedores externos"
        backHref="/admin"
        icon={<ShoppingCart className="h-5 w-5 text-primary" />}
      />
      <div className="space-y-6 p-6">

      <SaleList key={refreshKey} onSaleClick={() => setSaleModalOpen(true)} />

      <Modal
        open={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        title="Nova Venda"
        description="Registre uma venda de produtos para fornecedor externo"
        size="lg"
      >
        <SaleForm
          onSuccess={handleSaleSuccess}
          onCancel={() => setSaleModalOpen(false)}
        />
      </Modal>
    </div>
    </>
  );
}
