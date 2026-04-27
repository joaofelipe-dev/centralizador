import React from "react";
import { ShoppingBag, User, Calendar, Edit3, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/Button/Button";
import type { Order } from "@/types/order";

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
}

export function OrderList({ orders, onEdit }: OrderListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'APPROVED': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="text-primary h-5 w-5" />
          Pedidos Recentes
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="glass-card rounded-xl p-5 space-y-4 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase">{order.store?.name || 'Loja Excluída'}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                {getStatusIcon(order.status)}
                <span className="text-[9px] font-bold text-white">{order.status}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Solicitado por: <strong>{order.user?.name || 'Sistema'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Itens: <strong>{order.items?.length || 0} produtos</strong></span>
              </div>
            </div>

            <Button
              onClick={() => onEdit(order)}
              variant="glass"
              className="w-full gap-2 h-10 text-xs font-bold"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Ajustar Mercadoria
            </Button>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full py-12 text-center glass-card">
            <p className="text-muted-foreground">Nenhum pedido encontrado hoje.</p>
          </div>
        )}
      </div>
    </div>
  );
}