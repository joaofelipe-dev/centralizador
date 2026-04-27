import type { 
  LoginCredentials, 
  UserResponse, 
  CreateUserData, 
  UpdateUserData, 
  CreateProductData, 
  UpdateProductData,
  UpdateOrderData,
  ApiRequestOptions,
  ConsolidatedOrder,
  OrderListResponse
} from '@/types/api';
import type { Product, Category, Store } from '@/types/product';
import type { Order, CreateOrderRequest, OrderStatus } from '@/types/order';
import type { User } from '@/types/auth';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = isLocalhost ? 'http://localhost:3333' : 'http://192.168.0.245:3333';

export async function apiRequest<T = unknown>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data: unknown = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn('Falha ao processar JSON da resposta:', jsonError);
      }
    }

    if (!response.ok) {
      const errorMessage = (data && typeof data === 'object' && 'message' in data) 
        ? (data as { message: string }).message 
        : `Erro ${response.status}: ${response.statusText}`;
      
      console.group(`API Error: ${options.method || 'GET'} ${endpoint}`);
      console.error('Status:', response.status);
      console.error('Message:', errorMessage);
      console.error('Body:', data);
      console.groupEnd();

      const error = new Error(errorMessage) as Error & { status?: number; data?: unknown };
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Erro de conexão com a API. Verifique se o backend está rodando em:', API_URL);
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
    throw error;
  }
}

interface ApiInterface {
  login: (credentials: LoginCredentials) => Promise<UserResponse>;
  register: (userData: CreateUserData) => Promise<UserResponse>;
  getMe: () => Promise<{ user: User }>;
  getProducts: () => Promise<Product[]>;
  createProduct: (data: CreateProductData) => Promise<Product>;
  updateProduct: (id: string, data: UpdateProductData) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  getUsers: () => Promise<User[]>;
  createUser: (userData: CreateUserData) => Promise<User>;
  updateUser: (id: string, userData: UpdateUserData) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  getStores: () => Promise<Store[]>;
  getCategories: () => Promise<Category[]>;
  getOrders: (date?: string, status?: OrderStatus) => Promise<OrderListResponse>;
  createOrder: (orderData: CreateOrderRequest) => Promise<Order>;
  getConsolidatedOrders: (date?: string) => Promise<ConsolidatedOrder[]>;
  updateOrder: (id: string, data: UpdateOrderData) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order>;
  getOrdersDashboard: (endpoint: string) => Promise<unknown>;
  apiRequest: typeof apiRequest;
}

export const api: ApiInterface = {
  login: (credentials) => apiRequest<UserResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData) => apiRequest<UserResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  getMe: () => apiRequest<{ user: User }>('/auth/me'),
  getProducts: () => apiRequest<Product[]>('/products'),
  createProduct: (data) => apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProduct: (id, data) => apiRequest<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteProduct: (id) => apiRequest<void>(`/products/${id}`, {
    method: 'DELETE',
  }),
  getUsers: () => apiRequest<User[]>('/users'),
  createUser: (userData) => apiRequest<User>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  updateUser: (id, userData) => apiRequest<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  }),
  deleteUser: (id) => apiRequest<void>(`/users/${id}`, {
    method: 'DELETE',
  }),
  getStores: () => apiRequest<Store[]>('/stores'),
  getCategories: () => apiRequest<Category[]>('/categories'),
  getOrders: (date?: string, status?: OrderStatus) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    const query = params.toString();
    return apiRequest<OrderListResponse>(`/orders${query ? `?${query}` : ''}`);
  },
  createOrder: (orderData) => apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  getConsolidatedOrders: (date?: string) => apiRequest<ConsolidatedOrder[]>(`/orders/consolidated${date ? `?date=${date}` : ''}`),
  updateOrder: (id, data) => apiRequest<Order>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updateOrderStatus: (id, status) => apiRequest<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  getOrdersDashboard: (endpoint) => apiRequest(endpoint),
  apiRequest,
};