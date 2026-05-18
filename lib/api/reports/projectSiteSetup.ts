// lib/api/reports/projectSiteSetup.ts
import { apiClient } from '../client';
import { 
  ApiResponse, 
  ProjectSiteSetupReportData, 
  ReportGenerationResponse 
} from '@/types/reports';

// Generate project site setup report
export const generateProjectSiteSetupReport = async (
  siteId: string,
  options?: {
    saveReport?: boolean;
  }
) => {
  const response = await apiClient.post(`/reports/project-site-setup/${siteId}`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};