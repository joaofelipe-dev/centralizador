"use client";

import { useEffect, useState, useCallback } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  LogOut,
  Loader2,
  ShoppingBag,
  Clock,
  Users,
  Package,
  Shield,
} from "lucide-react";
import { Button } from "@/components/Button/Button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

import { StatsGallery } from "@/components/Admin/StatsGallery";
import { PivotTable } from "@/components/Admin/PivotTable";
import { DateInput } from "@/components/DateInput/DateInput";
import { TeamManagement } from "@/components/Admin/TeamManagement";
import type { TeamUser, UserRole } from "@/components/Admin/TeamManagement";
import type { Store, Product } from "@/types/product";

interface MatrixCell {
  quantity: number;
  currentStock: number;
}

interface PivotMatrix {
  [productId: string]: {
    [storeId: string]: MatrixCell;
  };
}

interface AdminForm {
  username: string;
  name: string;
  email: string;
  password: string;
  storeIds: string[];
  role: UserRole;
}

type ConsolidatedData = {
  products: (Product & { categoryName?: string; price?: number })[];
  stores: (Store & { orderDate?: string; code?: string })[];
  matrix: PivotMatrix;
};

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [consolidated, setConsolidated] = useState<ConsolidatedData>({
    products: [],
    stores: [],
    matrix: {},
  });
  const [filterDate, setFilterDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [form, setForm] = useState<AdminForm>({
    username: "",
    name: "",
    email: "",
    password: "",
    storeIds: [],
    role: "USER" as UserRole,
  });
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const router = useRouter();

  const loadData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [usersData, storesData, consolidatedData] =
        await Promise.all([
          api.getUsers(),
          api.getStores(),
          api.getConsolidatedOrders(filterDate),
        ]);
      setUsers(
        (usersData || []).map((u: import("@/types/auth").User) => ({
          id: u.id,
          username: u.username,
          name: u.email?.split('@')[0] || u.username,
          email: u.email,
          role: u.role as UserRole,
          stores: storesData.filter((s) => s.id === u.storeId),
        }))
      );
      setAllStores(storesData || []);
      setConsolidated({
              products: [],
              stores: storesData || [],
              matrix: {},
            });
    } catch (error) {
      console.error("Falha ao carregar dados:", error);
      setFeedback("Erro ao carregar dados do sistema.");
    } finally {
      setIsDataLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user && user.role !== 'ADMIN') {
      router.push("/");
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, loading, router, loadData, filterDate]);

  const resetForm = useCallback(() => {
    setForm({ username: "", name: "", email: "", password: "", storeIds: [], role: "USER" as UserRole });
    setEditUserId(null);
    setFeedback("");
  }, []);

  const handleUserSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !form.username.trim() ||
      !form.name.trim() ||
      form.storeIds.length === 0
    ) {
      setFeedback("Usuário, nome e lojas são obrigatórios.");
      return;
    }

    try {
      const submitData = {
        ...form,
        role: form.role === "DEFAULT" ? "USER" : form.role,
      };
      if (!submitData.password) delete submitData.password;
      if (editUserId) {
        const apiRole = submitData.role === "DEFAULT" ? "USER" : submitData.role as "ADMIN" | "SUPERVISOR" | "USER";
      await api.updateUser(editUserId, {
        username: submitData.username,
        email: submitData.email,
        role: apiRole,
        storeId: submitData.storeIds[0],
      });
        setFeedback("Usuário atualizado!");
      } else {
        const apiRole = submitData.role === "DEFAULT" ? "USER" : submitData.role as "ADMIN" | "SUPERVISOR" | "USER";
await api.createUser({
          username: submitData.username,
          email: submitData.email,
          password: submitData.password || "changeme123",
          role: apiRole,
          storeId: submitData.storeIds[0],
        });
        setFeedback("Usuário criado!");
      }
      resetForm();
      await loadData();
    } catch (error) {
      setFeedback((error as Error)?.message || "Erro ao salvar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir usuário?")) return;
    try {
      await api.deleteUser(id);
      await loadData();
    } catch (error) {
      setFeedback("Erro ao excluir.");
    }
  };

  if (loading || isDataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse text-sm font-medium">
            Sincronizando painel central...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/pedidos")}
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold tracking-tight text-white drop-shadow-sm">
              Painel Administrativo
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <DateInput
              value={filterDate || ''}
              onChange={setFilterDate}
              className="text-lg focus:border-transparent"
            />
            {feedback ? (
              <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full font-bold animate-in fade-in slide-in-from-right-2 duration-300">
                {feedback}
              </span>
            ) : null}
            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              className="rounded-full text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-primary/60 border border-white/10 shadow-lg shadow-primary/20" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w- mx-auto w-full p-6 space-y-12 animate-slide-up">
        <div className="glass-card p-6 rounded-xl text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Gestão de Pedidos</h2>
          <p className="text-muted-foreground mb-4">
            A edição de pedidos é realizada pelo Supervisor.
          </p>
          <Button onClick={() => router.push("/supervisor")} className="gap-2">
            <Shield className="h-4 w-4" />
            Ir para Gestão de Pedidos
          </Button>
        </div>

        <StatsGallery stats={[
          {
            label: "Lojas Ativas",
            value: allStores.length.toString(),
            icon: Clock,
            color: "text-yellow-500",
          },
          {
            label: "Total Usuários",
            value: users.length.toString(),
            icon: Users,
            color: "text-purple-500",
          },
          {
            label: "Itens Catálogo",
            value: consolidated.products.length.toString(),
            icon: Package,
            color: "text-orange-500",
          },
        ]} />

        <PivotTable consolidated={consolidated} />

        <TeamManagement
          users={users}
          allStores={allStores}
          form={form}
          setForm={setForm}
          handleUserSubmit={handleUserSubmit}
          handleDelete={handleDelete}
          editUserId={editUserId}
          setEditUserId={setEditUserId}
        />
      </main>
    </div>
  );
}
