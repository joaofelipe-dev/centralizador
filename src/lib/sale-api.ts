import { apiRequest } from './api';

export type SaleItem = {
  productId: string
  quantity: number
  product?: { id: string, name: string, stockCD: number }
}

export type CreateSaleData = {
  supplierId: string
  items: { productId: string, quantity: number }[]
}

export type Sale = {
  id: string
  supplierId: string
  supplier?: { id: string, name: string }
  items: SaleItem[]
  totalItems: number
  totalValue?: number
  createdAt: string
  user?: { id: string, name: string }
}

export async function createSale(data: CreateSaleData): Promise<Sale> {
  return apiRequest<Sale>('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listSales(): Promise<Sale[]> {
  return apiRequest<Sale[]>('/sales');
}

export async function getSale(id: string): Promise<Sale> {
  return apiRequest<Sale>(`/sales/${id}`);
}
