import { putRecord, getByIndex, deleteItem, countStore, getItem, getAllRecords } from './db'
import type { CreateOrderRequest } from '@/types/order'

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

export async function getAllQueuedOrders(): Promise<QueuedOrder[]> {
  const records = await getAllRecords<QueuedOrder>('queue')
  return records.map(r => r.value)
}

export async function markSyncing(clientId: string): Promise<QueuedOrder | null> {
  const item = await getItem<QueuedOrder>('queue', clientId)
  if (!item) return null
  item.status = 'SYNCING'
  await putRecord('queue', { key: clientId, value: item })
  return item
}

export async function markSynced(clientId: string): Promise<void> {
  await deleteItem('queue', clientId)
}

export async function markFailed(clientId: string, error: string): Promise<void> {
  const item = await getItem<QueuedOrder>('queue', clientId)
  if (item) {
    item.status = 'FAILED'
    item.error = error
    item.retryCount++
    await putRecord('queue', { key: clientId, value: item })
  }
}

export async function getQueueSize(): Promise<number> {
  return countStore('queue')
}

export async function clearQueue(): Promise<void> {
  const { clearStore } = await import('./db')
  await clearStore('queue')
}
