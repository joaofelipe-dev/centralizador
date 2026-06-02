import type { User } from './auth';

export type OrderStatus = 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED';

export interface OrderItem {
  productId: string;
  quantity: number;
  currentStock?: number;
  needsReview?: boolean;
}

export interface Order {
  id: string;
  storeId: string;
  userId?: string;
  orderDate: string;
  status: OrderStatus;
  items: { id: string; productId: string; quantity: number; currentStock: number; product: { name: string } }[];
  user?: { id?: string; name?: string };
  store?: { id: string; name: string };
  createdAt: string;
}

export interface CreateOrderRequest {
  storeId: string;
  items: OrderItem[];
  orderDate: string;
}