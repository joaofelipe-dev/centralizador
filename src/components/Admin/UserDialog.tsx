import React from "react";
import { X, UserPlus, Pencil } from "lucide-react";
import type { Store } from "@/types/product";
import type { UserRole } from "./TeamManagement";
import { UserForm } from "./UserForm";
import { Modal } from "@/components/ui/Modal";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: { id: string; username: string; name: string; email: string; role: UserRole; storeIds: string[] } | null;
  allStores: Store[];
  onSubmit: () => void;
  loading?: boolean;
  form: {
    username: string;
    name: string;
    email: string;
    password: string;
    storeIds: string[];
    role: UserRole;
  };
  setForm: (form: {
    username: string;
    name: string;
    email: string;
    password: string;
    storeIds: string[];
    role: UserRole;
  }) => void;
  onCancel: () => void;
}

export function UserDialog({
  open,
  onOpenChange,
  editingUser,
  allStores,
  onSubmit,
  loading = false,
  form,
  setForm,
  onCancel,
}: UserDialogProps) {
  const isEditing = !!editingUser;

  return (
    <Modal
      open={open}
      onClose={() => !loading && onOpenChange(false)}
      size="lg"
      closeOnOverlayClick={!loading}
      closeOnEsc={!loading}
      className="!bg-transparent !shadow-none !rounded-none !p-0"
    >
      <div className="w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="p-2 rounded-full bg-warning/20">
                <Pencil className="h-5 w-5 text-warning-foreground" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-primary/20">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
            )}
            <h3 className="text-lg font-bold text-foreground">
              {isEditing ? "Editar Usuário" : "Novo Usuário"}
            </h3>
          </div>
          <button
            onClick={() => !loading && onCancel()}
            disabled={loading}
            className="rounded-full p-1 hover:bg-surface-hover transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <UserForm
          form={form}
          setForm={setForm}
          onSubmit={onSubmit}
          isEditing={isEditing}
          loading={loading}
          allStores={allStores}
          onCancel={() => !loading && onCancel()}
        />
      </div>
    </Modal>
  );
}
