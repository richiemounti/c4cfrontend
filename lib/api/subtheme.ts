// lib/api/subtheme.ts
import { apiClient } from '@/lib/api/client';
import { ESGCategory, Indicator, ResilienceDimension, SDG, Standard, SubTheme, TaxonomyStatus } from '@/types/taxonomy';

export interface SubThemeListParams {
  page?: number;
  limit?: number;
  status?: TaxonomyStatus;
  theme?: string;
  theoryOfChangeStage?: 'Stage 1 - Output' | 'Stage 2 - Outcome';  // Add this line
  indicatorTags?: string[];
  sdgTags?: string[];     // Add these filter options
  resilienceTags?: string[];
  esgTags?: string[];
  standardTags?: string[];
  search?: string;
  sort?: string;
  populate?: string;      // Add this for population control
}

export interface SubThemeResponse {
  success: boolean;
  message?: string;
  data: SubTheme;
}

export interface SubThemesResponse {
  success: boolean;
  message?: string;
  data: SubTheme[];
  total: number;
  count: number;
}

// Add interface for available tags response
export interface AvailableTagsResponse {
  success: boolean;
  data: {
    indicators: Indicator[];
    sdgs: SDG[];
    resilienceDimensions: ResilienceDimension[];
    esgCategories: ESGCategory[];
    standards: Standard[];
  };
}

export const fetchSubThemes = async (params?: SubThemeListParams): Promise<SubThemesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params?.theme) queryParams.append('theme', params.theme);
  if (params?.theoryOfChangeStage) queryParams.append('theoryOfChangeStage', params.theoryOfChangeStage);  // Add this
  
  // Add tag filters
  if (params?.indicatorTags?.length) queryParams.append('indicatorTags', params.indicatorTags.join(','));
  if (params?.sdgTags?.length) queryParams.append('sdgTags', params.sdgTags.join(','));
  if (params?.resilienceTags?.length) queryParams.append('resilienceTags', params.resilienceTags.join(','));
  if (params?.esgTags?.length) queryParams.append('esgTags', params.esgTags.join(','));
  if (params?.standardTags?.length) queryParams.append('standardTags', params.standardTags.join(','));
  
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.populate) queryParams.append('populate', params.populate);  // Add this
  
  const response = await apiClient.get(`/subthemes?${queryParams.toString()}`);
  return response.data;
};

export const fetchSubTheme = async (id: string, populate?: string): Promise<SubThemeResponse> => {
  const queryParams = populate ? `?populate=${populate}` : '';
  const response = await apiClient.get(`/subthemes/${id}${queryParams}`);
  return response.data;
};

export const createSubTheme = async (data: Partial<SubTheme>): Promise<SubThemeResponse> => {
  const response = await apiClient.post('/subthemes', data);
  return response.data;
};

export const updateSubTheme = async (id: string, data: Partial<SubTheme>): Promise<SubThemeResponse> => {
  const response = await apiClient.put(`/subthemes/${id}`, data);
  return response.data;
};

export const archiveSubTheme = async (id: string): Promise<SubThemeResponse> => {
  const response = await apiClient.delete(`/subthemes/${id}`);
  return response.data;
};

export const restoreSubTheme = async (id: string): Promise<SubThemeResponse> => {
  const response = await apiClient.post(`/subthemes/${id}/restore`);
  return response.data;
};

export const deleteSubTheme = async (id: string): Promise<SubThemeResponse> => {
  const response = await apiClient.delete(`/subthemes/${id}/permanent`);
  return response.data;
};

export const getSubThemeQuestions = async (subThemeId: string): Promise<any> => {
  const response = await apiClient.get(`/subthemes/${subThemeId}/questions`);
  return response.data;
};

// Add this new function for getting available tags
export const getAvailableTags = async (): Promise<AvailableTagsResponse> => {
  const response = await apiClient.get('/subthemes/available-tags');
  return response.data;
};