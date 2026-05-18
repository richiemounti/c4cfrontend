// lib/api/reports/riskRegister.ts
import { apiClient } from '../client';
import { 
  ApiResponse, 
  RiskRegisterReportData, 
  ReportGenerationResponse,
  ReportFilters 
} from '@/types/reports';

// Generate risk register report (full project)
export const generateRiskRegisterReport = async (
  projectId: string,
  options?: {
    saveReport?: boolean;
    filters?: ReportFilters;
  }
) => {
  const response = await apiClient.post(`/reports/risk-register/${projectId}`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};

// Generate site-specific risk register report
export const generateSiteSpecificRiskReport = async (
  projectId: string,
  siteId: string,
  options?: {
    saveReport?: boolean;
    filters?: ReportFilters;
  }
) => {
  const response = await apiClient.post(`/reports/risk-register/${projectId}/site/${siteId}`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};

// Generate project-only risk register report
export const generateProjectOnlyRiskReport = async (
  projectId: string,
  options?: {
    saveReport?: boolean;
    filters?: ReportFilters;
  }
) => {
  const response = await apiClient.post(`/reports/risk-register/${projectId}/project-only`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};

// Generate overdue risks report
export const generateOverdueRisksReport = async (
  projectId: string,
  options?: {
    saveReport?: boolean;
    filters?: ReportFilters;
  }
) => {
  const response = await apiClient.post(`/reports/risk-register/${projectId}/overdue`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};
