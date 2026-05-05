import { apiRequest } from './api'
import type { StockCount, StockCountItem } from '@/types/stock-count'

export interface CreateStockCountResponse {
  id: string
  userId: string
  status: string
  createdAt: string
}

export interface StockCountListParams {
  status?: string
  limit?: number
  offset?: number
}

export interface StockCountListResponse {
  data: StockCount[]
  total: number
  limit: number
  offset: number
}

export interface UpdateCountItemsPayload {
  items: { productId: string; physicalQty: number }[]
}

export const stockCountApi = {
  createStockCount: async (): Promise<CreateStockCountResponse> => {
    return apiRequest<CreateStockCountResponse>('/stock-counts', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  listStockCounts: async (params?: StockCountListParams): Promise<StockCountListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    const query = searchParams.toString()
    const data = await apiRequest<StockCountListResponse>(`/stock-counts${query ? `?${query}` : ''}`)
    return data && typeof data === 'object' && 'data' in data ? data : { data: [], total: 0, limit: 0, offset: 0 }
  },

  getStockCount: async (id: string): Promise<StockCount> => {
    return apiRequest<StockCount>(`/stock-counts/${id}`)
  },

  updateCountItems: async (id: string, items: { productId: string; physicalQty: number }[]): Promise<StockCount> => {
    return apiRequest<StockCount>(`/stock-counts/${id}/items`, {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    })
  },

  closeStockCount: async (id: string): Promise<StockCount> => {
    return apiRequest<StockCount>(`/stock-counts/${id}/close`, {
      method: 'POST',
    })
  },
}
