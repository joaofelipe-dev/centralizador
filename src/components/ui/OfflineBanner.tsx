"use client";

import { useOffline } from "@/context/OfflineContext";
import { Wifi, WifiOff, RefreshCw, CloudOff } from "lucide-react";

export function OfflineBanner() {
  const { isOnline, pendingOrders, isSyncing, forceSync } = useOffline();

  const isVisible = !isOnline || pendingOrders > 0;
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] animate-in slide-in-from-bottom-4 duration-300">
      <div className={`mx-auto max-w-2xl px-4 pb-4 ${isOnline ? "" : "pb-20 md:pb-4"}`}>
        <div
          className={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
            isOnline
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-warning/30 bg-warning/10 text-warning"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {isOnline ? (
                <Wifi className="h-5 w-5 shrink-0" />
              ) : (
                <WifiOff className="h-5 w-5 shrink-0 animate-pulse" />
              )}

              <div className="min-w-0">
                {isOnline ? (
                  <p className="text-sm font-medium text-foreground">
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
                    <p className="text-sm font-medium">
                      Você está offline
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Pedidos serão salvos e enviados automaticamente quando a conexão voltar
                    </p>
                  </>
                )}
              </div>
            </div>

            {isOnline && pendingOrders > 0 && !isSyncing && (
              <button
                onClick={forceSync}
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sincronizar
              </button>
            )}

            {!isOnline && (
              <CloudOff className="h-5 w-5 shrink-0 text-warning/50" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
