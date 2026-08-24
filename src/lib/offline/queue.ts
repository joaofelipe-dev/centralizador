import { putRecord, getByIndex, deleteItem, getItem } from './db'
import type { CreateOrderRequest } from '@/types/order'

export const MAX_RETRIES = 10

export interface QueuedOrder {
  clientId: string
  data: CreateOrderRequest
  status: 'PENDING' | 'SYNCING' | 'FAILED'
  error?: string
  createdAt: number
  retryCount: number
}

function generateClientId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export async function enqueueOrder(orderData: CreateOrderRequest): Promise<QueuedOrder> {
  const queueItem: QueuedOrder = {
    clientId: generateClientId(),
    data: orderData,
    status: 'PENDING',
    createdAt: Date.now(),
    retryCount: 0,
  }

  await putRecord('queue', {
    key: queueItem.clientId,
    value: queueItem,
  })

  return queueItem
}

export async function getPendingOrders(): Promise<QueuedOrder[]> {
  return getByIndex<QueuedOrder>('queue', 'status', 'PENDING')
}

export async function markSynced(clientId: string): Promise<void> {
  await deleteItem('queue', clientId)
}

/**
 * Registra uma tentativa malsucedida. O pedido volta para PENDING até esgotar
 * MAX_RETRIES — só então vira FAILED, que é terminal e não é mais reprocessado.
 */
export async function markFailed(clientId: string, error: string): Promise<void> {
  const item = await getItem<QueuedOrder>('queue', clientId)
  if (!item) return

  item.error = error
  item.retryCount++
  item.status = item.retryCount >= MAX_RETRIES ? 'FAILED' : 'PENDING'

  await putRecord('queue', { key: clientId, value: item })
}

export async function getFailedOrders(): Promise<QueuedOrder[]> {
  return getByIndex<QueuedOrder>('queue', 'status', 'FAILED')
}

/** Conta apenas o que ainda pode ser sincronizado — FAILED é terminal. */
export async function getQueueSize(): Promise<number> {
  const pending = await getPendingOrders()
  return pending.length
}


