// lib/api/reports/export.ts
import { apiClient } from '../client';
import { ApiResponse } from '@/types/reports';

/**
 * Export report as PDF
 * The PDF will look exactly like the on-screen report
 */
export const exportReportAsPDF = async (
  reportId: string,
  options?: {
    includeCharts?: boolean;
    includeImages?: boolean;
  }
): Promise<Blob> => {
  const response = await apiClient.post(
    `/reports/${reportId}/export/pdf`,
    options,
    {
      responseType: 'blob'
    }
  );
  return response.data;
};

/**
 * Export report as Word document (DOCX)
 * Provides text format for users who need to copy content into other reports
 */
export const exportReportAsDOCX = async (
  reportId: string,
  options?: {
    includeMetadata?: boolean;
    includeTables?: boolean;
  }
): Promise<Blob> => {
  const response = await apiClient.post(
    `/reports/${reportId}/export/docx`,
    options,
    {
      responseType: 'blob'
    }
  );
  return response.data;
};

/**
 * Get export history for a report
 */
export const getReportExportHistory = async (reportId: string) => {
  const response = await apiClient.get(`/reports/${reportId}/exports`);
  return response.data as ApiResponse<{
    exports: Array<{
      _id: string;
      format: 'pdf' | 'docx';
      exportedAt: string;
      exportedBy: {
        _id: string;
        name: string;
      };
      fileSize: number;
      downloadCount: number;
    }>;
  }>;
};

/**
 * Download a specific exported file
 */
export const downloadExportedFile = async (reportId: string, exportId: string): Promise<Blob> => {
  const response = await apiClient.get(
    `/reports/${reportId}/exports/${exportId}/download`,
    {
      responseType: 'blob'
    }
  );
  return response.data;
};

/**
 * Helper function to trigger browser download
 */
export const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};