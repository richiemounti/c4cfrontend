// lib/api/theme.ts
import { apiClient } from '@/lib/api/client';
import { Theme, TaxonomyStatus } from '@/types/taxonomy';

export interface ThemeListParams {
  page?: number;
  limit?: number;
  status?: TaxonomyStatus;
  theoryOfChangeStage?: 'Stage 1 - Output' | 'Stage 2 - Outcome' | 'Both' | 'all';
  search?: string;
  sort?: string;
}

export interface ThemeResponse {
  success: boolean;
  message?: string;
  data: Theme;
}

export interface ThemesResponse {
  success: boolean;
  message?: string;
  data: Theme[];
  total: number;
  count: number;
}

export const fetchThemes = async (params?: ThemeListParams): Promise<ThemesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params?.theoryOfChangeStage && params.theoryOfChangeStage !== 'all') {
    queryParams.append('theoryOfChangeStage', params.theoryOfChangeStage);
  }
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sort) queryParams.append('sort', params.sort);
  
  const response = await apiClient.get(`/themes?${queryParams.toString()}`);
  return response.data;
};

const PAGE_SIZE = 100;

export const fetchAllThemes = async (
  params?: Omit<ThemeListParams, 'page' | 'limit'>
): Promise<Theme[]> => {
  const first = await fetchThemes({ ...params, page: 1, limit: PAGE_SIZE });
  const all: Theme[] = [...(first.data || [])];

  const total = first.total ?? 0;
  if (total > PAGE_SIZE) {
    const extraPages = Math.ceil((total - PAGE_SIZE) / PAGE_SIZE);
    const rest = await Promise.all(
      Array.from({ length: extraPages }, (_, i) =>
        fetchThemes({ ...params, page: i + 2, limit: PAGE_SIZE })
      )
    );
    rest.forEach(r => all.push(...(r.data || [])));
  }

  return all;
};

export const fetchTheme = async (id: string): Promise<ThemeResponse> => {
  const response = await apiClient.get(`/themes/${id}`);
  return response.data;
};

export const createTheme = async (data: Partial<Theme>): Promise<ThemeResponse> => {
  const themeData = {
    ...data,
  };
  
  const response = await apiClient.post('/themes', themeData);
  return response.data;
};

export const updateTheme = async (id: string, data: Partial<Theme>): Promise<ThemeResponse> => {
  const themeData = { ...data };
  
  const response = await apiClient.put(`/themes/${id}`, themeData);
  return response.data;
};

export const archiveTheme = async (id: string): Promise<ThemeResponse> => {
  const response = await apiClient.delete(`/themes/${id}`);
  return response.data;
};

export const restoreTheme = async (id: string): Promise<ThemeResponse> => {
  const response = await apiClient.post(`/themes/${id}/restore`);
  return response.data;
};

export const deleteTheme = async (id: string): Promise<ThemeResponse> => {
  const response = await apiClient.delete(`/themes/${id}/permanent`);
  return response.data;
};

export const getThemeSubThemes = async (themeId: string): Promise<any> => {
  const response = await apiClient.get(`/themes/${themeId}/subthemes`);
  return response.data;
};