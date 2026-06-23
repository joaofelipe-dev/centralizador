"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import {
  startSyncEngine,
  stopSyncEngine,
  isOnline,
  onSyncEvent,
  processQueue,
  getQueueSize,
  prefetchCatalog,
  hasCache,
  isCacheStale,
  getCachedProducts,
} from "@/lib/offline";

export interface OfflineContextType {
  isOnline: boolean
  pendingOrders: number
  isSyncing: boolean
  lastSyncAt: Date | null
  refreshCache: () => Promise<void>
  forceSync: () => Promise<void>
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const refreshCache = useCallback(async () => {
    try {
      await prefetchCatalog();
    } catch (err) {
      console.warn("Offline: falha ao atualizar cache", err);
    }
  }, []);

  const forceSync = useCallback(async () => {
    if (isOnline()) {
      setIsSyncing(true);
      try {
        await processQueue();
        const size = await getQueueSize();
        setPendingOrders(size);
      } finally {
        setIsSyncing(false);
      }
    }
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    startSyncEngine();

    const unsubscribe = onSyncEvent((event) => {
      switch (event.type) {
        case "sync-start":
          setIsSyncing(true);
          break;
        case "sync-complete":
          setIsSyncing(false);
          setLastSyncAt(new Date());
          if (event.pendingCount !== undefined) setPendingOrders(event.pendingCount);
          break;
        case "sync-error":
          setIsSyncing(false);
          break;
        case "order-synced":
          setPendingOrders((prev) => Math.max(0, prev - 1));
          break;
        case "online":
          setOnline(true);
          break;
        case "offline":
          setOnline(false);
          break;
      }
    });

    getQueueSize().then(setPendingOrders);

    hasCache().then((cached) => {
      if (cached) {
        isCacheStale().then((stale) => {
          if (stale && navigator.onLine) {
            refreshCache();
          }
        });
      } else if (navigator.onLine) {
        refreshCache();
      }
    });

    return () => {
      unsubscribe();
      stopSyncEngine();
    };
  }, [refreshCache]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline: online,
        pendingOrders,
        isSyncing,
        lastSyncAt,
        refreshCache,
        forceSync,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
}
