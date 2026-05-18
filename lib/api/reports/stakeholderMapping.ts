import { apiClient } from '../client';
import { 
  ApiResponse, 
  StakeholderMappingReportData, 
  ReportGenerationResponse,
  ReportFilters 
} from '@/types/reports';

// Generate stakeholder mapping report (full project)
export const generateStakeholderMappingReport = async (
  projectId: string,
  options?: {
    saveReport?: boolean;
    filters?: ReportFilters;
  }
) => {
  const response = await apiClient.post(`/reports/stakeholder-mapping/${projectId}`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};

// Generate site-specific stakeholder mapping report
export const generateSiteSpecificStakeholderReport = async (
  projectId: string,
  siteId: string,
  options?: {
    saveReport?: boolean;
    filters?: ReportFilters;
  }
) => {
  const response = await apiClient.post(`/reports/stakeholder-mapping/${projectId}/site/${siteId}`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};

// Generate project-only stakeholder mapping report
export const generateProjectOnlyStakeholderReport = async (
  projectId: string,
  options?: {
    saveReport?: boolean;
    filters?: ReportFilters;
  }
) => {
  const response = await apiClient.post(`/reports/stakeholder-mapping/${projectId}/project-only`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};