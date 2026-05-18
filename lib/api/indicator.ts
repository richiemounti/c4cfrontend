// lib/api/indicator.ts
import { apiClient } from '@/lib/api/client';
import { Indicator, TaxonomyStatus } from "@/types/taxonomy";
import { validateEvidence, validateURLArray } from '@/lib/utils/validation';


export interface IndicatorListParams {
    page?: number;
    limit?: number;
    status?: TaxonomyStatus;
    search?: string;
    sort?: string;
}

export interface IndicatorResponse {
    success: boolean;
    message?: string;
    data: Indicator;
}

export interface IndicatorsResponse {
    success: boolean;
    message?: string;
    data: Indicator[];
    total: number;
    count: number;
}

export const fetchIndicators = async (params?: IndicatorListParams): Promise<IndicatorsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sort) queryParams.append('sort', params.sort);
  
  const response = await apiClient.get(`/indicators?${queryParams.toString()}`);
  return response.data;
};


export const fetchIndicator = async (id: string): Promise<IndicatorResponse> => {
  const response = await apiClient.get(`/indicators/${id}`);
  return response.data;
};


export const createIndicator = async (data: Partial<Indicator>): Promise<IndicatorResponse> => {
  // Validate before sending to backend
  if (data.evidence) {
    const evidenceValidation = validateEvidence(data.evidence);
    
    if (!evidenceValidation.isValid) {
      throw new Error(`Validation failed: ${evidenceValidation.errors.join(', ')}`);
    }

    // Sanitize URLs
    if (data.evidence.url && data.evidence.url.length > 0) {
      const urlValidation = validateURLArray(data.evidence.url);
      if (!urlValidation.isValid) {
        throw new Error(`URL validation failed: ${urlValidation.errors.join(', ')}`);
      }
      data.evidence.url = urlValidation.sanitized;
    }
  }

  const response = await apiClient.post('/indicators', data);
  return response.data;
};

export const updateIndicator = async (id: string, data: Partial<Indicator>): Promise<IndicatorResponse> => {
  // Validate before sending to backend
  if (data.evidence) {
    const evidenceValidation = validateEvidence(data.evidence);
    
    if (!evidenceValidation.isValid) {
      throw new Error(`Validation failed: ${evidenceValidation.errors.join(', ')}`);
    }

    // Sanitize URLs
    if (data.evidence.url && data.evidence.url.length > 0) {
      const urlValidation = validateURLArray(data.evidence.url);
      if (!urlValidation.isValid) {
        throw new Error(`URL validation failed: ${urlValidation.errors.join(', ')}`);
      }
      data.evidence.url = urlValidation.sanitized;
    }
  }

  const response = await apiClient.put(`/indicators/${id}`, data);
  return response.data;
};

export const archiveIndicator = async (id: string): Promise<IndicatorResponse> => {
  const response = await apiClient.delete(`/indicators/${id}`);
  return response.data;
};

export const restoreIndicator = async (id: string): Promise<IndicatorResponse> => {
  const response = await apiClient.post(`/indicators/${id}/restore`);
  return response.data;
};

export const deleteIndicator = async (id: string): Promise<IndicatorResponse> => {
  const response = await apiClient.delete(`/indicators/${id}/permanent`);
  return response.data;
};