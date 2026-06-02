import { apiRequest } from './api';
import type { PurchaseOrder, Supplier } from '@/types/purchase';

export async function createPurchase(data: { supplierId: string; items: { productId: string; quantity: number; unitCost?: number }[] }) {
  return apiRequest<PurchaseOrder>('/purchases', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listPurchases(params?: { status?: string; supplierId?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.supplierId) searchParams.append('supplierId', params.supplierId);
  const query = searchParams.toString();
  const data = await apiRequest<PurchaseOrder[]>(`/purchases${query ? `?${query}` : ''}`);
  return Array.isArray(data) ? data : [];
}

export async function receivePurchase(id: string) {
  return apiRequest<PurchaseOrder>(`/purchases/${id}/receive`, {
    method: 'PATCH',
  });
}

export async function listSuppliers(type?: string) {
  const searchParams = new URLSearchParams();
  if (type) searchParams.append('type', type);
  const query = searchParams.toString();
  return apiRequest<Supplier[]>(`/suppliers${query ? `?${query}` : ''}`);
}
