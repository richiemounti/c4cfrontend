// lib/api/standard.ts
import { apiClient } from './client';
import { Standard } from '@/types/taxonomy';

export const fetchStandards = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  issuingBody?: string;
}) => {
  const { data } = await apiClient.get('/standards', { params });
  return data;
};

export const fetchStandard = async (id: string) => {
  const { data } = await apiClient.get(`/standards/${id}`);
  return data;
};

export const createStandard = async (standardData: Partial<Standard>) => {
  const { data } = await apiClient.post('/standards', standardData);
  return data;
};

export const updateStandard = async (id: string, standardData: Partial<Standard>) => {
  const { data } = await apiClient.put(`/standards/${id}`, standardData);
  return data;
};

export const archiveStandard = async (id: string) => {
  const { data } = await apiClient.delete(`/standards/${id}`);
  return data;
};

export const restoreStandard = async (id: string) => {
  const { data } = await apiClient.post(`/standards/${id}/restore`);
  return data;
};

export const deleteStandard = async (id: string) => {
  const { data } = await apiClient.delete(`/standards/${id}/permanent`);
  return data;
};