const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = isLocalhost ? 'http://localhost:3333' : 'http://192.168.0.245:3333';

export async function apiRequest(endpoint, options = {}) {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn('Falha ao processar JSON da resposta:', jsonError);
      }
    }

    if (!response.ok) {
      const errorMessage = (data && data.message) || `Erro ${response.status}: ${response.statusText}`;
      
      // Log detalhado para depuração
      console.group(`API Error: ${options.method || 'GET'} ${endpoint}`);
      console.error('Status:', response.status);
      console.error('Message:', errorMessage);
      console.error('Body:', data);
      console.groupEnd();

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error('Erro de conexão com a API. Verifique se o backend está rodando em:', API_URL);
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
    throw error;
  }
}

export const api = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  getMe: () => apiRequest('/auth/me'),
  getProducts: () => apiRequest('/products'),
  createProduct: (data) => apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProduct: (id, data) => apiRequest(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, {
    method: 'DELETE',
  }),
  getUsers: () => apiRequest('/users'),
  createUser: (userData) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  updateUser: (id, userData) => apiRequest(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  }),
  deleteUser: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
  getStores: () => apiRequest('/stores'),
  getCategories: () => apiRequest('/categories'),
  getOrders: (date, status) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    const query = params.toString();
    return apiRequest(`/orders${query ? `?${query}` : ''}`);
  },
  createOrder: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  getConsolidatedOrders: (date) => apiRequest(`/orders/consolidated${date ? `?date=${date}` : ''}`),
  updateOrder: (id, data) => apiRequest(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updateOrderStatus: (id, status) => apiRequest(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  apiRequest: apiRequest,
};
