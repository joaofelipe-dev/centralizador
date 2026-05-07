"use client";

import { useEffect, useState, useCallback } from "react";
import type { ChangeEvent } from "react";
import {
  Loader2,
  ShoppingBag,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Pencil,
  ChevronDown,
  Shield,
} from "lucide-react";
import { Button } from "@/components/Button/Button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DateInput } from "@/components/DateInput/DateInput";
import type { Order, OrderItem } from "@/types/order";
import { PageNav } from "@/components/PageNav";
import { Modal } from "@/components/ui/Modal";

const STATUS_CONFIG: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}> = {
  PENDING: { label: "Pendente", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  APPROVED: { label: "Aprovado", icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" },
  CONFIRMED: { label: "Confirmado", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  CANCELLED: { label: "Cancelado", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

export default function SupervisorOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [filterStatus, setFilterStatus] = useState<import("@/types/order").OrderStatus | "">("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [savingOrder, setSavingOrder] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getOrders(filterDate, filterStatus || undefined);
      setOrders(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterDate, filterStatus]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user && user.role !== "SUPERVISOR" && user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    if (user) {
      loadOrders();
    }
  }, [user, loading, router, loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: import("@/types/order").OrderStatus) => {
    setSavingOrder(true);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status: " + (error as Error).message);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleOrderUpdate = async (orderId: string, items: OrderItem[]) => {
    setSavingOrder(true);
    try {
      await api.updateOrder(orderId, { items });
      setEditingOrder(null);
      await loadOrders();
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast.error("Erro ao atualizar pedido: " + (error as Error).message);
    } finally {
      setSavingOrder(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getNextStatus = (currentStatus: string): import("@/types/order").OrderStatus | null => {
    switch (currentStatus) {
      case "PENDING":
        return "APPROVED";
      case "APPROVED":
        return "CONFIRMED";
      default:
        return null;
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse text-sm font-medium">
            Carregando pedidos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <PageNav
        title="Gestão de Pedidos"
        description="Aprovação e edição de pedidos"
        backHref="/pedidos"
        icon={<Shield className="h-5 w-5 text-primary" />}
        actions={
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-white/10 md:hidden"
          >
            <Filter className="h-5 w-5" />
          </Button>
        }
      >
        <div className={`px-4 pb-3 space-y-3 md:hidden ${showFilters ? 'block' : 'hidden'}`}>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <DateInput
              value={filterDate || ''}
              onChange={setFilterDate}
              className="flex-1"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as import("@/types/order").OrderStatus | "")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="APPROVED">Aprovado</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>

        <div className="hidden md:flex items-center justify-between px-6 py-3 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <DateInput
                value={filterDate || ''}
                onChange={setFilterDate}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as import("@/types/order").OrderStatus | "")}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos os status</option>
              <option value="PENDING">Pendente</option>
              <option value="APPROVED">Aprovado</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {orders.length} pedido{orders.length !== 1 ? 's' : ''}
          </h2>
        </div>
      </PageNav>

      <main className="flex-1 w-full p-4 md:p-6 space-y-4">
        <div className="md:hidden">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {orders.length} pedido{orders.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="glass-card rounded-xl p-8 md:p-12 text-center">
            <Package className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = statusConfig.icon;
              const nextStatus = getNextStatus(order.status);
              const isExpanded = expandedOrders[order.id];

              return (
                <div
                  key={order.id}
                  className="glass-card rounded-xl overflow-hidden"
                >
                  <div
                    className="p-4 md:p-6 cursor-pointer"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-white truncate">{order.store?.name}</p>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">
                            {order.user?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                          {order.orderDate && (
                            <p className="text-xs text-primary mt-1">
                              Pedido: {formatDate(order.orderDate)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${statusConfig.bg}`}>
                          <StatusIcon className={`h-3 w-3 md:h-4 md:w-4 ${statusConfig.color}`} />
                          <span className={`text-xs font-bold ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>

                  <div className={`px-4 pb-4 md:px-6 md:pb-6 space-y-4 ${isExpanded ? 'block' : 'hidden'} md:block`}>
                    <div className="border-t border-white/5 pt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                        Itens ({order.items?.length || 0})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-white truncate">
                                {item.product?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Estoque: {item.currentStock}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <p className="text-lg font-black text-primary">
                                {item.quantity}
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase">
                                unid
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingOrder(order);
                        }}
                        className="gap-1.5 text-xs md:text-sm flex-1 sm:flex-none"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>

                      {nextStatus && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, nextStatus);
                          }}
                          disabled={savingOrder}
                          className="gap-1.5 text-xs md:text-sm flex-1 sm:flex-none"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {nextStatus === "APPROVED" ? "Aprovar" : "Confirmar"}
                        </Button>
                      )}

                      {order.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, "CANCELLED");
                          }}
                          disabled={savingOrder}
                          className="gap-1.5 text-xs md:text-sm flex-1 sm:flex-none"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {editingOrder && (
        <OrderEditPanel
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleOrderUpdate}
          isSaving={savingOrder}
        />
      )}
    </div>
  );
}

function OrderEditPanel({ order, onClose, onSave, isSaving }: {
  order: Order;
  onClose: () => void;
  onSave: (orderId: string, items: OrderItem[]) => void;
  isSaving: boolean;
}) {
  const [items, setItems] = useState<Array<{
    productId: string;
    name: string;
    quantity: number;
    currentStock: number;
  }>>(
    order.items.map((item) => ({
      productId: String(item.productId),
      name: item.product?.name || "Produto",
      quantity: item.quantity,
      currentStock: item.currentStock || 0,
    }))
  );

  const updateItem = (productId: string, field: 'quantity' | 'currentStock', delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const nextValue = Math.max(0, (item[field] || 0) + delta);
          return { ...item, [field]: nextValue };
        }
        return item;
      })
    );
  };

  const handleSave = () => {
    onSave(
      order.id,
      items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        currentStock: item.currentStock,
      }))
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      variant="default"
      overlayClassName="flex items-end md:items-center justify-center p-0 md:p-4 bg-black/95"
      className="glass-card w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 rounded-t-2xl md:rounded-2xl"
    >
      <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between shrink-0">
        <h3 className="text-lg md:text-xl font-bold text-white">Editar Pedido</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-white p-2 -m-2">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white/5 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-white text-sm md:text-base truncate pr-2">{item.name}</p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] uppercase text-muted-foreground">Estoque</span>
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
                  <button
                    onClick={() => updateItem(item.productId, "currentStock", -1)}
                    className="h-9 w-9 flex items-center justify-center rounded hover:bg-white/10 text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-white text-base">
                    {item.currentStock}
                  </span>
                  <button
                    onClick={() => updateItem(item.productId, "currentStock", 1)}
                    className="h-9 w-9 flex items-center justify-center rounded hover:bg-white/10 text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] uppercase text-primary">Quantidade</span>
                <div className="flex items-center gap-1 bg-primary/10 p-1 rounded-lg border border-primary/20">
                  <button
                    onClick={() => updateItem(item.productId, "quantity", -1)}
                    className="h-9 w-9 flex items-center justify-center rounded text-primary hover:bg-white/10 text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-white text-base">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateItem(item.productId, "quantity", 1)}
                    className="h-9 w-9 flex items-center justify-center rounded bg-primary text-white text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 md:p-6 border-t border-white/5 flex gap-3 shrink-0">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </Modal>
  );
}
