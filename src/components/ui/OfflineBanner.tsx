"use client";

import { useOffline } from "@/context/OfflineContext";
import { Wifi, WifiOff, RefreshCw, CloudOff } from "lucide-react";

export function OfflineBanner() {
  const { isOnline, pendingOrders, isSyncing, forceSync } = useOffline();

  const isVisible = !isOnline || pendingOrders > 0;
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] animate-slide-up">
      <div className={`mx-auto max-w-2xl px-4 pb-4 ${isOnline ? "" : "pb-20 md:pb-4"}`}>
        <div
          className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg ${
            isOnline
              ? "border-primary bg-primary text-primary-foreground"
              : "border-warning bg-warning text-warning-foreground"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {isOnline ? (
              <Wifi className="h-5 w-5 shrink-0" />
            ) : (
              <WifiOff className="h-5 w-5 shrink-0 animate-pulse" />
            )}

            <div className="min-w-0">
              {isOnline ? (
                <p className="text-sm font-semibold">
                  {isSyncing ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Sincronizando pedidos...
                    </span>
                  ) : (
                    `${pendingOrders} pedido${pendingOrders > 1 ? "s" : ""} aguardando sincronização`
                  )}
                </p>
              ) : (
                <>
                  <p className="text-sm font-semibold">Você está offline</p>
                  <p className="text-xs opacity-90 mt-0.5">
                    Pedidos serão salvos e enviados automaticamente quando a conexão voltar
                  </p>
                </>
              )}
            </div>
          </div>

          {isOnline && pendingOrders > 0 && !isSyncing && (
            <button
              onClick={forceSync}
              className="shrink-0 flex h-10 items-center gap-1.5 rounded-md bg-primary-foreground/15 px-3 text-xs font-bold hover:bg-primary-foreground/25 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sincronizar
            </button>
          )}

          {!isOnline && <CloudOff className="h-5 w-5 shrink-0 opacity-80" />}
        </div>
      </div>
    </div>
  );
}
