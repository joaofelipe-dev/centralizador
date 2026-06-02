import type { OrderItem } from './order';

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  stockCD?: number;
}

export interface Category {
  id: string;
  name: string;
  products?: Product[];
}

export interface Store {
  id: string;
  name: string;
  address?: string;
}

export interface CartItem extends OrderItem {
  quantityRaw?: string;
  currentStockRaw?: string;
  confirmed?: boolean;
  productName?: string;
}

export interface Cart {
  [productId: string]: CartItem;
}

