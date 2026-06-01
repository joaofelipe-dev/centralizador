import { getPendingOrders, markSynced, markFailed } from './queue'

const SYNC_INTERVAL_MS = 30_000
const MAX_RETRIES = 10
const API_HEALTH_CHECK = '/'

let syncTimer: ReturnType<typeof setInterval> | null = null
let isSyncing = false
let listeners: Array<(event: SyncEvent) => void> = []

export type SyncEventType = 'sync-start' | 'sync-complete' | 'sync-error' | 'order-synced' | 'online' | 'offline'

export interface SyncEvent {
  type: SyncEventType
  pendingCount?: number
  syncedCount?: number
  error?: string
}

export function onSyncEvent(callback: (event: SyncEvent) => void): () => void {
  listeners.push(callback)
  return () => {
    listeners = listeners.filter(l => l !== callback)
  }
}

function notify(event: SyncEvent): void {
  listeners.forEach(l => l(event))
}

export function isOnline(): boolean {
  return navigator.onLine
}

let lastOnlineState = isOnline()

export function setupConnectivityMonitor(): void {
  window.addEventListener('online', () => {
    if (!lastOnlineState) {
      lastOnlineState = true
      notify({ type: 'online' })
      void processQueue()
    }
  })

  window.addEventListener('offline', () => {
    lastOnlineState = false
    notify({ type: 'offline' })
  })
}

async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5_000)

    const response = await fetch(`${getApiBaseUrl()}${API_HEALTH_CHECK}`, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:3333'
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  return isLocalhost ? 'http://localhost:3333' : 'http://192.168.0.245:3333'
}

export async function processQueue(): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 }
  isSyncing = true

  try {
    notify({ type: 'sync-start' })

    const pending = await getPendingOrders()
    if (pending.length === 0) {
      notify({ type: 'sync-complete', syncedCount: 0, pendingCount: 0 })
      return { synced: 0, failed: 0 }
    }

    const apiOnline = await checkApiHealth()
    if (!apiOnline) {
      notify({ type: 'sync-error', error: 'API indisponível' })
      return { synced: 0, failed: 0 }
    }

    let synced = 0
    let failed = 0

    for (const order of pending) {
      if (order.retryCount >= MAX_RETRIES) {
        await markFailed(order.clientId, 'Máximo de tentativas excedido')
        failed++
        continue
      }

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${getApiBaseUrl()}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(order.data),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.message || `Erro ${response.status}`)
        }

        await markSynced(order.clientId)
        synced++
        notify({ type: 'order-synced', syncedCount: synced })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        await markFailed(order.clientId, message)
        failed++
        notify({ type: 'sync-error', error: message })
      }
    }

    const remaining = await getPendingOrders().then(o => o.length)
    notify({ type: 'sync-complete', syncedCount: synced, pendingCount: remaining })

    return { synced, failed }
  } finally {
    isSyncing = false
  }
}

export function startSyncEngine(): void {
  if (syncTimer) return

  setupConnectivityMonitor()

  void processQueue()

  syncTimer = setInterval(() => {
    if (isOnline()) {
      void processQueue()
    }
  }, SYNC_INTERVAL_MS)
}

export function stopSyncEngine(): void {
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
  }
}
