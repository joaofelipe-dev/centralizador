import React from "react";
import { TriangleAlert, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirmar exclusão",
  description = "Esta ação não pode ser desfeita. O item será removido permanentemente.",
  loading = false,
  confirmText = "Excluir",
  cancelText = "Cancelar",
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={() => !loading && onOpenChange(false)}
      size="md"
      closeOnOverlayClick={!loading}
      closeOnEsc={!loading}
      className="glass-card !bg-transparent !shadow-none !rounded-none !overflow-visible !p-0"
    >
      <div className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500/20">
              <TriangleAlert className="h-5 w-5 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={() => !loading && onOpenChange(false)}
            disabled={loading}
            className="rounded-full p-1 hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          {description}
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            type="button"
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
