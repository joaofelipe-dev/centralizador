"use client";

import React, { useState } from "react";
import { Settings } from "lucide-react";
import { MovementList } from "@/components/Admin/MovementList";
import { AdjustmentForm } from "@/components/Admin/AdjustmentForm";
import { Modal } from "@/components/ui/Modal";
import { PageNav } from "@/components/PageNav";

export default function MovementsPage() {
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdjustmentSuccess = () => {
    setAdjustmentModalOpen(false);
    setRefreshKey(k => k + 1);
  };

  return (
    <>
      <PageNav
        title="Movimentações"
        description="Consulte o histórico de entradas, saídas e ajustes de estoque"
        backHref="/admin"
        icon={<Settings className="h-5 w-5 text-primary" />}
      />
      <div className="space-y-6 p-6">

        <MovementList key={refreshKey} onAdjustmentClick={() => setAdjustmentModalOpen(true)} />
      </div>

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
    </>
  );
}
