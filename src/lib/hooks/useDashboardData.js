import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

// Dashboard Data Query Hook
export const useDashboardData = (filters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Build query params
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
      
      // Note: api.getOrdersDashboard might need to be defined in src/lib/api.js
      // or we can use the generic apiRequest
      const result = await api.getOrdersDashboard ? await api.getOrdersDashboard(endpoint) : await api.apiRequest(endpoint);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  return { data, loading, error, refetch: fetchData };
};