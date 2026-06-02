export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserResponse {
  user: import('./auth').User;
  token: string;
}

export interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export interface CreateUserData {
  username: string;
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'SUPERVISOR' | 'DEFAULT';
  storeIds?: string[];
}

export interface UpdateUserData {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'SUPERVISOR' | 'DEFAULT';
  storeIds?: string[];
}

export interface CreateProductData {
  name: string;
  categoryId: string;
  price: number;
  stock?: number;
  stockCD?: number;
}

export interface UpdateProductData {
  name?: string;
  categoryId?: string;
  price?: number;
  stock?: number;
  stockCD?: number;
}

export interface UpdateOrderData {
  storeId?: number;
  items?: import('./order').OrderItem[];
  orderDate?: string;
  status?: import('./order').OrderStatus;
}
export interface OrderListResponse {
  total: number;
  limit: number;
  offset: number;
  data: import('./order').Order[];
}

export interface ConsolidatedOrder {
  productId: string;
  productName: string;
  categoryName: string;
  totalQuantity: number;
  stores: {
    storeId: string;
    storeName: string;
    quantity: number;
  }[];
}