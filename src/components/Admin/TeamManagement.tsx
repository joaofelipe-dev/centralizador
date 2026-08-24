import React, { useState, useCallback } from "react";
import { Plus, Loader2, Shield, Eye, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Store } from "@/types/product";
import { UserTable } from "./UserTable";
import { UserDialog } from "./UserDialog";
import { ConfirmDialog } from "./ConfirmDialog";

export type { Store } from "@/types/product";

interface RoleConfig {
  label: string;
  color: string;
  icon: typeof Shield;
}

export const roleConfig: Record<string, RoleConfig> = {
  ADMIN: { label: 'Admin', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: Shield },
  SUPERVISOR: { label: 'Supervisor', color: 'bg-warning/20 text-warning-foreground border-warning/30', icon: Eye },
  DEFAULT: { label: 'Padrão', color: 'bg-primary/20 text-primary border-primary/30', icon: User },
};

export type UserRole = "ADMIN" | "SUPERVISOR" | "DEFAULT";

export interface TeamUser {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  stores: Store[];
}

interface UserForm {
  username: string;
  name: string;
  email: string;
  password: string;
  storeIds: string[];
  role: UserRole;
}

const emptyForm: UserForm = {
  username: "",
  name: "",
  email: "",
  password: "",
  storeIds: [],
  role: "DEFAULT",
};

interface TeamManagementProps {
  users: TeamUser[];
  allStores: Store[];
  isLoading?: boolean;
  onSave: (data: {
    id?: string;
    username: string;
    name: string;
    email: string;
    password?: string;
    storeIds: string[];
    role: UserRole;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TeamManagement({
  users,
  allStores,
  isLoading = false,
  onSave,
  onDelete,
}: TeamManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (user: TeamUser) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      name: user.name,
      email: user.email || "",
      password: "",
      storeIds: (user.stores || []).map(s => String(s.id)),
      role: user.role || "DEFAULT",
    });
    setDialogOpen(true);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave({
        ...(editingUser ? { id: editingUser.id } : {}),
        username: form.username,
        name: form.name,
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
        storeIds: form.storeIds,
        role: form.role,
      });
      setDialogOpen(false);
      setEditingUser(null);
      setForm(emptyForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    await onDelete(deleteConfirm);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Gerenciar Equipe</h2>
        <Button
          onClick={handleOpenCreate}
          className="font-bold gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Membro
        </Button>
      </div>

      <UserTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        loading={isLoading}
        deleteLoadingId={deleteConfirm}
      />

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingUser={
          editingUser
            ? {
                id: editingUser.id,
                username: editingUser.username,
                name: editingUser.name,
                email: editingUser.email || "",
                role: editingUser.role,
                storeIds: (editingUser.stores || []).map(s => String(s.id)),
              }
            : null
        }
        allStores={allStores}
        onSubmit={handleSubmit}
        loading={isSubmitting}
        form={form}
        setForm={setForm}
        onCancel={handleCancel}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar exclusão"
        description="Esta ação não pode ser desfeita. O usuário será removido permanentemente."
        loading={false}
        confirmText="Excluir"
      />
    </div>
  );
}
