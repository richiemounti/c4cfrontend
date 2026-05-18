// lib/api/category.ts
import { apiClient } from '@/lib/api/client';
import { Category, TaxonomyStatus } from '@/types/taxonomy';

export interface CategoryListParams {
  page?: number;
  limit?: number;
  status?: TaxonomyStatus;
  search?: string;
  sort?: string;
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data: Category;
}

export interface CategoriesResponse {
  success: boolean;
  message?: string;
  data: Category[];
  total: number;
  count: number;
}

export const fetchCategories = async (params?: CategoryListParams): Promise<CategoriesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sort) queryParams.append('sort', params.sort);
  
  const response = await apiClient.get(`/categories?${queryParams.toString()}`);
  return response.data;
};

export const fetchCategory = async (id: string): Promise<CategoryResponse> => {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (data: Partial<Category>): Promise<CategoryResponse> => {
  const response = await apiClient.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<CategoryResponse> => {
  const response = await apiClient.put(`/categories/${id}`, data);
  return response.data;
};

export const archiveCategory = async (id: string): Promise<CategoryResponse> => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
};

export const restoreCategory = async (id: string): Promise<CategoryResponse> => {
  const response = await apiClient.post(`/categories/${id}/restore`);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<CategoryResponse> => {
  const response = await apiClient.delete(`/categories/${id}/permanent`);
  return response.data;
};

export const getCategoryThemes = async (categoryId: string): Promise<any> => {
  const response = await apiClient.get(`/categories/${categoryId}/themes`);
  return response.data;
};