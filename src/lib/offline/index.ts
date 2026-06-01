export {
  prefetchCatalog,
  getCachedProducts,
  getCachedStores,
  getCachedCategories,
  isCacheStale,
  clearCache,
  hasCache,
  getLastSyncTimestamp,
} from './cache'

export {
  enqueueOrder,
  getPendingOrders,
  getAllQueuedOrders,
  getQueueSize,
  clearQueue,
} from './queue'

export type { QueuedOrder } from './queue'

export {
  startSyncEngine,
  stopSyncEngine,
  processQueue,
  isOnline,
  onSyncEvent,
} from './sync-engine'

export type { SyncEvent, SyncEventType } from './sync-engine'
