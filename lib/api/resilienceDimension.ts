// lib/api/resilienceDimension.ts
import { apiClient } from './client';
import { ResilienceDimension } from '@/types/taxonomy';

// Fetch all resilience dimensions with optional filters
export const fetchResilienceDimensions = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  capacityType?: string;
  category?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.capacityType) queryParams.append('capacityType', params.capacityType);
  if (params?.category) queryParams.append('category', params.category);
  
  const response = await apiClient.get(`/resilience-dimensions?${queryParams.toString()}`);
  return response.data;
};

// Fetch a single resilience dimension by ID
export const fetchResilienceDimension = async (id: string) => {
  const response = await apiClient.get(`/resilience-dimensions/${id}`);
  return response.data;
};

// Create a new resilience dimension
export const createResilienceDimension = async (data: Partial<ResilienceDimension>) => {
  const response = await apiClient.post('/resilience-dimensions', data);
  return response.data;
};

// Update an existing resilience dimension
export const updateResilienceDimension = async (id: string, data: Partial<ResilienceDimension>) => {
  const response = await apiClient.put(`/resilience-dimensions/${id}`, data);
  return response.data;
};

// Archive a resilience dimension (soft delete)
export const archiveResilienceDimension = async (id: string) => {
  const response = await apiClient.delete(`/resilience-dimensions/${id}`);
  return response.data;
};

// Restore an archived resilience dimension
export const restoreResilienceDimension = async (id: string) => {
  const response = await apiClient.post(`/resilience-dimensions/${id}/restore`);
  return response.data;
};

// Permanently delete a resilience dimension
export const deleteResilienceDimension = async (id: string) => {
  const response = await apiClient.delete(`/resilience-dimensions/${id}/permanent`);
  return response.data;
};

// Fetch available categories (new endpoint)
export const fetchResilienceCategories = async () => {
  const response = await apiClient.get('/resilience-dimensions/categories');
  return response.data;
};