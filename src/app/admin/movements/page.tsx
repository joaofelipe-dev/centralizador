"use client";

import React, { useState } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { MovementList } from '@/components/Admin/MovementList';
import { AdjustmentForm } from '@/components/Admin/AdjustmentForm';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from "next/navigation";

export default function MovementsPage() {
  const router = useRouter();
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);

  const handleAdjustmentSuccess = () => {
    setAdjustmentModalOpen(false);
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
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Movimentações</h1>
          <p className="text-sm text-muted-foreground">
            Consulte o histórico de entradas, saídas e ajustes de estoque
          </p>
        </div>
      </div>

      <MovementList onAdjustmentClick={() => setAdjustmentModalOpen(true)} />

      <Modal
        open={adjustmentModalOpen}
        onClose={() => setAdjustmentModalOpen(false)}
        title="Novo Ajuste de Estoque"
        description="Ajuste manual de entrada ou saída de produtos no estoque CD"
        size="md"
      >
        <AdjustmentForm
          onSuccess={handleAdjustmentSuccess}
          onCancel={() => setAdjustmentModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
