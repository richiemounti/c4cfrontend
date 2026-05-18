// lib/api/sdg.ts
import { apiClient } from './client';
import { SDG } from '@/types/taxonomy';

export const fetchSDGs = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const { data } = await apiClient.get('/sdgs', { params });
  return data;
};

export const fetchSDG = async (id: string) => {
  const { data } = await apiClient.get(`/sdgs/${id}`);
  return data;
};

export const createSDG = async (sdgData: Partial<SDG>) => {
  const { data } = await apiClient.post('/sdgs', sdgData);
  return data;
};

export const updateSDG = async (id: string, sdgData: Partial<SDG>) => {
  const { data } = await apiClient.put(`/sdgs/${id}`, sdgData);
  return data;
};

export const archiveSDG = async (id: string) => {
  const { data } = await apiClient.delete(`/sdgs/${id}`);
  return data;
};

export const restoreSDG = async (id: string) => {
  const { data } = await apiClient.post(`/sdgs/${id}/restore`);
  return data;
};

export const deleteSDG = async (id: string) => {
  const { data } = await apiClient.delete(`/sdgs/${id}/permanent`);
  return data;
};