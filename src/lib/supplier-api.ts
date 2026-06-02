import { apiRequest } from './api';

import type { Supplier as PurchaseSupplier } from '@/types/purchase'

export type Supplier = PurchaseSupplier & {
  email?: string
  phone?: string
  address?: string
}

export async function listSuppliers(type?: string): Promise<Supplier[]> {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  const query = params.toString();
  return apiRequest<Supplier[]>(`/suppliers${query ? `?${query}` : ''}`);
}
