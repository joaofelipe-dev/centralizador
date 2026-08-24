import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'

import type { CreateOrderRequest } from '@/types/order'

const orderData: CreateOrderRequest = {
  storeId: 'store-1',
  orderDate: '2026-08-22',
  items: [{ productId: 'product-1', quantity: 3, currentStock: 1 }],
}

// Cada teste começa com um IndexedDB limpo, e os módulos são reimportados para
// zerar o cache de conexão de db.ts.
async function loadQueue() {
  return import('@/lib/offline/queue')
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  vi.resetModules()
})

describe('offline/queue', () => {
  it('persiste um pedido enfileirado e o devolve como PENDING', async () => {
    const { enqueueOrder, getPendingOrders } = await loadQueue()

    const queued = await enqueueOrder(orderData)

    const pending = await getPendingOrders()
    expect(pending).toHaveLength(1)
    expect(pending[0]?.clientId).toBe(queued.clientId)
    expect(pending[0]?.data).toEqual(orderData)
    expect(pending[0]?.status).toBe('PENDING')
  })

  it('remove o pedido da fila ao sincronizar', async () => {
    const { enqueueOrder, markSynced, getPendingOrders, getQueueSize } = await loadQueue()

    const queued = await enqueueOrder(orderData)
    await markSynced(queued.clientId)

    expect(await getPendingOrders()).toHaveLength(0)
    expect(await getQueueSize()).toBe(0)
  })

  it('mantém o pedido reprocessável após uma falha transitória', async () => {
    const { enqueueOrder, markFailed, getPendingOrders } = await loadQueue()

    const queued = await enqueueOrder(orderData)
    await markFailed(queued.clientId, 'Erro 500')

    const pending = await getPendingOrders()
    expect(pending).toHaveLength(1)
    expect(pending[0]?.status).toBe('PENDING')
    expect(pending[0]?.retryCount).toBe(1)
    expect(pending[0]?.error).toBe('Erro 500')
  })

  it('marca como FAILED apenas ao esgotar MAX_RETRIES', async () => {
    const { enqueueOrder, markFailed, getPendingOrders, getFailedOrders, getQueueSize, MAX_RETRIES } =
      await loadQueue()

    const queued = await enqueueOrder(orderData)

    for (let i = 0; i < MAX_RETRIES - 1; i++) {
      await markFailed(queued.clientId, 'Erro 500')
    }
    expect(await getPendingOrders()).toHaveLength(1)

    await markFailed(queued.clientId, 'Erro 500')

    expect(await getPendingOrders()).toHaveLength(0)
    expect(await getFailedOrders()).toHaveLength(1)
    // FAILED é terminal: não conta como pendente de sincronização.
    expect(await getQueueSize()).toBe(0)
  })
})
