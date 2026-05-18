// lib/api/stakeholderReport.ts
import { ApiResponse } from '@/types';
import { apiClient } from './client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const stakeholderReportApi = {
  // Generate a new stakeholder report
  generateReport: async (data: {
    projectId: string;
    projectSiteId?: string;
    title: string;
    description?: string;
    filters?: {
      categories?: string[];
      connectionStrength?: {
        min?: number;
        max?: number;
      };
      risks?: string[];
      includeArchived?: boolean;
    };
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/stakeholderReports', data);
    return response.data;
  },

  // Get all stakeholder stakeholderReports
  getstakeholderReports: async (
    filters?: {
      projectId?: string;
      projectSiteId?: string;
      status?: string;
    }
  ): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    
    if (filters?.projectId) {
      params.append('projectId', filters.projectId);
    }
    
    if (filters?.projectSiteId) {
      params.append('projectSiteId', filters.projectSiteId);
    }
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    
    const url = `/stakeholderReports/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get a single stakeholder report
  getReport: async (reportId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/stakeholderReports/${reportId}`);
    return response.data;
  },

  // Approve a stakeholder report
  approveReport: async (reportId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/stakeholderReports/${reportId}/approve`);
    return response.data;
  },

  // Archive a stakeholder report
  archiveReport: async (reportId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/stakeholderReports/${reportId}/archive`);
    return response.data;
  },

  // Delete a stakeholder report
  deleteReport: async (reportId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/stakeholderReports/${reportId}`);
    return response.data;
  },

  // Generate PDF report directly in the frontend
  generatePDF: async (reportId: string): Promise<Blob> => {
    // First get the full report data
    const response = await apiClient.get(`/stakeholderReports/${reportId}`);
    const report = response.data.data;
    
    return generatePDFFromReport(report);
  },

  // Generate CSV report directly in the frontend
  generateCSV: async (reportId: string): Promise<Blob> => {
    // First get the full report data
    const response = await apiClient.get(`/stakeholderReports/${reportId}`);
    const report = response.data.data;
    
    return generateCSVFromReport(report);
  }
};


// Helper function to generate PDF
function generatePDFFromReport(report: any): Promise<Blob> {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(report.title, 14, 22);
    
    // Add report metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Status: ${report.status}`, 14, 35);
    if (report.description) {
      doc.text(`Description: ${report.description}`, 14, 40);
    }
    
    // Add stakeholder table
    const stakeholders = report.stakeholderData || [];
    
    if (stakeholders.length > 0) {
      doc.setFontSize(14);
      doc.text('Stakeholders', 14, 50);
      
      const tableData = stakeholders.map((stakeholder: any) => {
        // Helper functions to extract data
        const getConnectionStrength = (s: any) => {
          const task = s.tasks.find((t: any) => t.taskType === 'connections');
          return task?.rating || 0;
        };
        
        const getTaskResponses = (s: any, taskType: string) => {
          const task = s.tasks.find((t: any) => t.taskType === taskType);
          if (task?.responses) {
            return task.responses.map((r: any) => r.option).join(', ');
          }
          return 'None';
        };
        
        return [
          stakeholder.name,
          stakeholder.category,
          getConnectionStrength(stakeholder),
          getTaskResponses(stakeholder, 'connections'),
          getTaskResponses(stakeholder, 'power'),
          getTaskResponses(stakeholder, 'roles'),
          getTaskResponses(stakeholder, 'risks'),
          getTaskResponses(stakeholder, 'benefits')
        ];
      });
      
      // @ts-ignore - jspdf-autotable extension
      doc.autoTable({
        startY: 55,
        head: [['Name', 'Category', 'Connection', 'Connections', 'Power', 'Roles', 'Risks', 'Benefits']],
        body: tableData,
        headStyles: { fillColor: [66, 139, 202] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 15 },
        },
        margin: { top: 15 },
        styles: { overflow: 'linebreak', cellPadding: 3 },
      });
    }
    
    // Convert to blob
    const blob = doc.output('blob');
    resolve(blob);
  });
}

// Helper function to generate CSV
function generateCSVFromReport(report: any): Promise<Blob> {
  return new Promise((resolve) => {
    const stakeholders = report.stakeholderData || [];
    
    // Prepare data for CSV
    const rows = [];
    
    // Header row
    rows.push([
      'Stakeholder Name',
      'Category',
      'Connection Strength',
      'Connections',
      'Power Rating',
      'Power Dynamics',
      'Roles/Responsibilities',
      'Risks',
      'Benefits'
    ]);
    
    // Helper functions to extract data
    const getTaskRating = (s: any, taskType: string) => {
      const task = s.tasks.find((t: any) => t.taskType === taskType);
      return task?.rating || 0;
    };
    
    const getTaskResponses = (s: any, taskType: string) => {
      const task = s.tasks.find((t: any) => t.taskType === taskType);
      if (task?.responses) {
        return task.responses.map((r: any) => r.option).join(', ');
      }
      return 'None';
    };
    
    // Data rows
    stakeholders.forEach((stakeholder: any) => {
      rows.push([
        stakeholder.name,
        stakeholder.category,
        getTaskRating(stakeholder, 'connections'),
        getTaskResponses(stakeholder, 'connections'),
        getTaskRating(stakeholder, 'power'),
        getTaskResponses(stakeholder, 'power'),
        getTaskResponses(stakeholder, 'roles'),
        getTaskResponses(stakeholder, 'risks'),
        getTaskResponses(stakeholder, 'benefits')
      ]);
    });
    
    // Convert to CSV
    const csv = Papa.unparse(rows);
    
    // Convert to blob
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    resolve(blob);
  });
}


export default stakeholderReportApi;