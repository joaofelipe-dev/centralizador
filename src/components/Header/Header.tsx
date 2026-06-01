"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOffline } from "@/context/OfflineContext";
import { LogOut, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter, usePathname } from "next/navigation";
import { HeaderLogo } from "./HeaderLogo";
import { HeaderNav } from "./HeaderNav";
import { ConfirmDialog } from "@/components/Admin/ConfirmDialog";

import { Navbar } from "@/components/Navbar";

function ConnectionBadge() {
  const { isOnline, pendingOrders, isSyncing } = useOffline();

  if (isOnline && pendingOrders === 0) return null;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
        isOnline
          ? "bg-primary/10 text-primary"
          : "bg-yellow-500/10 text-yellow-500 animate-pulse"
      }`}
      title={
        isOnline
          ? `${pendingOrders} pedido(s) pendente(s)`
          : "Você está offline"
      }
    >
      {isSyncing ? (
        <RefreshCw className="h-3 w-3 animate-spin" />
      ) : isOnline ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      <span className="hidden sm:inline">
        {isSyncing
          ? "Sincronizando..."
          : isOnline
            ? `${pendingOrders} pendente${pendingOrders > 1 ? "s" : ""}`
            : "Offline"}
      </span>
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  if (!user) return null;

  return (
    <Navbar position="top" sticky>
      <div className="flex items-center gap-4">
        <HeaderLogo />
      </div>

      <div className="flex items-center gap-2">
        <ConnectionBadge />
        <HeaderNav onRequestLogout={() => setConfirmingLogout(true)} />
        <Button
          size="icon"
          variant="ghost"
          className="text-red-500 hover:bg-red-500/10"
          onClick={() => setConfirmingLogout(true)}
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <ConfirmDialog
        open={confirmingLogout}
        onOpenChange={(open) => { if (!open) setConfirmingLogout(false); }}
        onConfirm={() => {
          setConfirmingLogout(false);
          logout();
        }}
        title="Sair do Sistema"
        description="Tem certeza que deseja sair? Pedidos offline não enviados serão perdidos."
        confirmText="Sair"
        cancelText="Voltar"
      />
    </Navbar>
  );
}
