"use client";

import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { SaleList } from '@/components/Admin/SaleList';
import { SaleForm } from '@/components/Admin/SaleForm';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from "next/navigation";

export default function SalesPage() {
  const router = useRouter();
  const [saleModalOpen, setSaleModalOpen] = useState(false);

  const handleSaleSuccess = () => {
    setSaleModalOpen(false);
    window.location.reload();
  };

    return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/admin')}
          className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Vendas</h1>
          <p className="text-sm text-muted-foreground">
            Registre vendas para fornecedores externos
          </p>
        </div>
      </div>

      <SaleList onSaleClick={() => setSaleModalOpen(true)} />

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
  );
}
