// lib/api/esgCategory.ts
import { apiClient } from './client';
import { ESGCategory } from '@/types/taxonomy';

export const fetchESGCategories = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}) => {
  const { data } = await apiClient.get('/esg-categories', { params });
  return data;
};

export const fetchESGCategory = async (id: string) => {
  const { data } = await apiClient.get(`/esg-categories/${id}`);
  return data;
};

export const createESGCategory = async (categoryData: Partial<ESGCategory>) => {
  const { data } = await apiClient.post('/esg-categories', categoryData);
  return data;
};

export const updateESGCategory = async (id: string, categoryData: Partial<ESGCategory>) => {
  const { data } = await apiClient.put(`/esg-categories/${id}`, categoryData);
  return data;
};

export const archiveESGCategory = async (id: string) => {
  const { data } = await apiClient.delete(`/esg-categories/${id}`);
  return data;
};

export const restoreESGCategory = async (id: string) => {
  const { data } = await apiClient.post(`/esg-categories/${id}/restore`);
  return data;
};

export const deleteESGCategory = async (id: string) => {
  const { data } = await apiClient.delete(`/esg-categories/${id}/permanent`);
  return data;
};