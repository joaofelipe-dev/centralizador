import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { Order } from '@/types/order';
import type { OrderListResponse } from '@/types/api';

export interface DashboardFilters {
  storeId?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface UseDashboardDataResult {
  data: Order[] | null;
  loading: boolean;
  error: string | null;
  refetch: (filterParams?: DashboardFilters) => Promise<void>;
}

export const useDashboardData = (filters: DashboardFilters = {}): UseDashboardDataResult => {
  const [data, setData] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (filterParams: DashboardFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      if (filterParams.storeId) params.append('storeId', filterParams.storeId);
      if (filterParams.userId) params.append('userId', filterParams.userId);
      if (filterParams.status) params.append('status', filterParams.status);
      if (filterParams.startDate) params.append('startDate', filterParams.startDate);
      if (filterParams.endDate) params.append('endDate', filterParams.endDate);
      if (filterParams.sort) {
        params.append('sort', filterParams.sort);
        params.append('order', filterParams.order || 'desc');
      }
      
      const queryString = params.toString();
      const endpoint = queryString 
        ? `/orders/dashboard?${queryString}` 
        : '/orders/dashboard';
      
      const result = await api.getOrdersDashboard(endpoint) as OrderListResponse;
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  return { data, loading, error, refetch: fetchData };
};