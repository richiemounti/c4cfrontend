// lib/api/reports/main.ts
import { apiClient } from '../client';
import { 
  BaseReportData, 
  ApiResponse, 
  SearchFilters, 
  SearchOptions, 
  SearchResult,
  QuickSearchResult,
  SearchFacets,
  ReportAnalytics
} from '@/types/reports';

// Get all reports for a project with filtering and pagination
export const getProjectReports = async (
  projectId: string,
  params?: {
    reportType?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) => {
  const response = await apiClient.get(`/reports/project/${projectId}`, { params });
  return response.data as ApiResponse<{
    reports: BaseReportData[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>;
};

// Get specific report by ID
export const getReportById = async (reportId: string) => {
  const response = await apiClient.get(`/reports/${reportId}`);
  return response.data as ApiResponse<BaseReportData>;
};

// Get cached report with fallback to database
export const getCachedReport = async (reportId: string) => {
  const response = await apiClient.get(`/reports/${reportId}/cached`);
  return response.data as ApiResponse<BaseReportData & {
    metadata: {
      source: 'cache' | 'database';
      cachedAt?: string;
    };
  }>;
};

// Delete/Archive report
export const deleteReport = async (reportId: string) => {
  const response = await apiClient.delete(`/reports/${reportId}`);
  return response.data as ApiResponse<{ message: string }>;
};

// Approve report (Manager/Admin only)
export const approveReport = async (reportId: string, notes?: string) => {
  const response = await apiClient.put(`/reports/${reportId}/approve`, { notes });
  return response.data as ApiResponse<{ message: string; data: BaseReportData }>;
};

// Advanced search for reports
export const searchReports = async (
  filters: SearchFilters,
  options?: SearchOptions
) => {
  const response = await apiClient.post('/reports/search', {
    filters,
    options
  });
  return response.data as ApiResponse<SearchResult>;
};

// Quick search with autocomplete
export const quickSearchReports = async (
  searchTerm: string,
  limit: number = 10
) => {
  const response = await apiClient.get('/reports/quick-search', {
    params: { q: searchTerm, limit }
  });
  return response.data as ApiResponse<QuickSearchResult>;
};

// Get search facets for building advanced search UI
export const getSearchFacets = async () => {
  const response = await apiClient.get('/reports/search/facets');
  return response.data as ApiResponse<SearchFacets>;
};

// Export search results
export const exportSearchResults = async (
  filters: SearchFilters,
  format: 'csv' | 'excel' | 'json'
): Promise<Blob> => {
  const response = await apiClient.post('/reports/search/export', {
    filters,
    format
  }, {
    responseType: 'blob'
  });
  return response.data;
};

// Get report analytics
export const getReportAnalytics = async (params?: {
  organizationId?: string;
  projectId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}) => {
  const response = await apiClient.get('/reports/analytics', { params });
  return response.data as ApiResponse<ReportAnalytics>;
};