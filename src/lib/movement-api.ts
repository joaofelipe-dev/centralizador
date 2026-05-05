import { apiRequest } from './api';
import type { StockMovement, MovementFilters, CreateAdjustmentData } from '@/types/movement';

export async function listMovements(filters?: MovementFilters): Promise<StockMovement[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.productId) params.append('productId', filters.productId);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  const query = params.toString();
  return apiRequest<StockMovement[]>(`/movements${query ? `?${query}` : ''}`);
}

export async function createAdjustment(data: CreateAdjustmentData): Promise<StockMovement> {
  return apiRequest<StockMovement>('/movements/adjust', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
