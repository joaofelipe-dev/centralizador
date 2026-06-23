export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'DEFAULT';
  storeId?: string;
  storeName?: string;
  stores?: import('./product').Store[];
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
}