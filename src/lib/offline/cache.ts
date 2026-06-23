import { setItem, getItem } from './db'
import { apiRequest } from '@/lib/api'
import type { Product, Category, Store } from '@/types/product'

const CACHE_KEYS = {
  PRODUCTS: 'products',
  STORES: 'stores',
  CATEGORIES: 'categories',
  LAST_SYNC: 'last_sync_timestamp',
} as const

const CACHE_TTL_MS = 5 * 60 * 1000

export async function prefetchCatalog(): Promise<void> {
  const [products, stores, categories] = await Promise.all([
    apiRequest<Product[]>('/products'),
    apiRequest<Store[]>('/stores'),
    apiRequest<Category[]>('/categories'),
  ])

  await Promise.all([
    setItem('cache', CACHE_KEYS.PRODUCTS, products),
    setItem('cache', CACHE_KEYS.STORES, stores),
    setItem('cache', CACHE_KEYS.CATEGORIES, categories),
    setItem('cache', CACHE_KEYS.LAST_SYNC, Date.now()),
  ])
}

export async function getCachedProducts(): Promise<Product[]> {
  return (await getItem<Product[]>('cache', CACHE_KEYS.PRODUCTS)) ?? []
}

export async function getCachedStores(): Promise<Store[]> {
  return (await getItem<Store[]>('cache', CACHE_KEYS.STORES)) ?? []
}

export async function getCachedCategories(): Promise<Category[]> {
  return (await getItem<Category[]>('cache', CACHE_KEYS.CATEGORIES)) ?? []
}

export async function getLastSyncTimestamp(): Promise<number | undefined> {
  return getItem<number>('cache', CACHE_KEYS.LAST_SYNC)
}

export async function isCacheStale(): Promise<boolean> {
  const lastSync = await getLastSyncTimestamp()
  if (!lastSync) return true
  return Date.now() - lastSync > CACHE_TTL_MS
}

export async function hasCache(): Promise<boolean> {
  const products = await getCachedProducts()
  return products.length > 0
}
