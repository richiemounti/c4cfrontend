// lib/utils/reports.ts
import { 
  ReportType, 
  ReportStatus, 
  BaseReportData,
  SearchFilters,
  ReportFilters 
} from '@/types/reports';

// Report type display utilities
export const getReportTypeLabel = (reportType: ReportType): string => {
  const labels: Record<ReportType, string> = {
    'project_setup': 'Project Setup',
    'project_site_setup': 'Site Setup',
    'stakeholder_mapping': 'Stakeholder Mapping',
    'theory_of_change': 'Theory of Change',
    'risk_register': 'Risk Register'
  };
  return labels[reportType] || reportType;
};

export const getReportTypeDescription = (reportType: ReportType): string => {
  const descriptions: Record<ReportType, string> = {
    'project_setup': 'Comprehensive project setup and configuration details',
    'project_site_setup': 'Site-specific setup and demographic information',
    'stakeholder_mapping': 'Stakeholder analysis and engagement mapping',
    'theory_of_change': 'Theory of change framework and impact pathways',
    'risk_register': 'Risk assessment and mitigation strategies'
  };
  return descriptions[reportType] || 'Report details';
};

export const getReportTypeIcon = (reportType: ReportType): string => {
  const icons: Record<ReportType, string> = {
    'project_setup': '🏗️',
    'project_site_setup': '📍',
    'stakeholder_mapping': '👥',
    'theory_of_change': '🎯',
    'risk_register': '⚠️'
  };
  return icons[reportType] || '📊';
};

// Report status utilities
export const getReportStatusLabel = (status: ReportStatus): string => {
  const labels: Record<ReportStatus, string> = {
    'draft': 'Draft',
    'generated': 'Generated',
    'approved': 'Approved',
    'published': 'Published',
    'archived': 'Archived'
  };
  return labels[status] || status;
};

export const getReportStatusColor = (status: ReportStatus): string => {
  const colors: Record<ReportStatus, string> = {
    'draft': 'gray',
    'generated': 'blue',
    'approved': 'green',
    'published': 'purple',
    'archived': 'red'
  };
  return colors[status] || 'gray';
};

export const getReportStatusBadgeClass = (status: ReportStatus): string => {
  const classes: Record<ReportStatus, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'generated': 'bg-blue-100 text-blue-800',
    'approved': 'bg-green-100 text-green-800',
    'published': 'bg-purple-100 text-purple-800',
    'archived': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

// Report validation utilities
export const isReportEditable = (report: BaseReportData): boolean => {
  return ['draft', 'generated'].includes(report.status);
};

export const isReportApprovable = (report: BaseReportData): boolean => {
  return report.status === 'generated';
};

export const isReportPublishable = (report: BaseReportData): boolean => {
  return report.status === 'approved';
};

export const canTransitionToStatus = (
  currentStatus: ReportStatus, 
  targetStatus: ReportStatus
): boolean => {
  const allowedTransitions: Record<ReportStatus, ReportStatus[]> = {
    'draft': ['generated', 'archived'],
    'generated': ['draft', 'approved', 'archived'],
    'approved': ['generated', 'published', 'archived'],
    'published': ['archived'],
    'archived': []
  };
  
  return allowedTransitions[currentStatus]?.includes(targetStatus) || false;
};

// Date and time utilities
export const formatReportDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatReportDate(dateString);
};

export const isReportExpired = (report: BaseReportData, maxAgeInDays: number = 90): boolean => {
  const reportAge = Math.floor(
    (Date.now() - new Date(report.createdAt).getTime()) / (24 * 60 * 60 * 1000)
  );
  return reportAge > maxAgeInDays;
};

export const getReportAge = (report: BaseReportData): number => {
  return Math.floor(
    (Date.now() - new Date(report.createdAt).getTime()) / (24 * 60 * 60 * 1000)
  );
};

// Report completion utilities
export const calculateCompletionPercentage = (report: BaseReportData): number => {
  return report.metadata?.summary?.completionPercentage || 0;
};

export const getCompletionStatusColor = (percentage: number): string => {
  if (percentage >= 90) return 'green';
  if (percentage >= 70) return 'yellow';
  if (percentage >= 50) return 'orange';
  return 'red';
};

export const getCompletionStatusText = (percentage: number): string => {
  if (percentage >= 90) return 'Complete';
  if (percentage >= 70) return 'Nearly Complete';
  if (percentage >= 50) return 'In Progress';
  if (percentage > 0) return 'Started';
  return 'Not Started';
};

// Search and filter utilities
export const buildSearchQuery = (filters: Partial<SearchFilters>): SearchFilters => {
  // Remove empty values and build clean search query
  const cleanFilters: SearchFilters = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        (cleanFilters as any)[key] = value;
      } else if (!Array.isArray(value)) {
        (cleanFilters as any)[key] = value;
      }
    }
  });
  
  return cleanFilters;
};

export const combineFilters = (
  currentFilters: Partial<SearchFilters>,
  newFilters: Partial<SearchFilters>
): SearchFilters => {
  return buildSearchQuery({
    ...currentFilters,
    ...newFilters
  });
};

export const clearFilter = (
  filters: SearchFilters,
  filterKey: keyof SearchFilters
): SearchFilters => {
  const { [filterKey]: removed, ...remaining } = filters;
  return remaining;
};

// URL utilities for report management
export const getReportUrl = (report: BaseReportData): string => {
  return `/reports/${report.id}`;
};

export const getReportEditUrl = (report: BaseReportData): string => {
  return `/reports/${report.id}/edit`;
};

export const getReportPreviewUrl = (report: BaseReportData): string => {
  return `/reports/${report.id}/preview`;
};

export const getReportExportUrl = (reportId: string, format: 'pdf' | 'excel' | 'csv'): string => {
  return `/api/v1/reports/${reportId}/export?format=${format}`;
};

// Report generation utilities
export const getReportGenerationUrl = (reportType: ReportType, entityId: string): string => {
  const baseUrls: Record<ReportType, string> = {
    'project_setup': `/reports/project-setup/${entityId}`,
    'project_site_setup': `/reports/project-site-setup/${entityId}`,
    'stakeholder_mapping': `/reports/stakeholder-mapping/${entityId}`,
    'theory_of_change': `/reports/theory-of-change/${entityId}`,
    'risk_register': `/reports/risk-register/${entityId}`
  };
  
  return baseUrls[reportType] || `/reports/${reportType}/${entityId}`;
};

export const getReportMaxAge = (reportType: ReportType): number => {
  const maxAges: Record<ReportType, number> = {
    'project_setup': 90,
    'project_site_setup': 90,
    'stakeholder_mapping': 180,
    'theory_of_change': 365,
    'risk_register': 60
  };
  
  return maxAges[reportType] || 90;
};

export const getReportWarningPeriod = (reportType: ReportType): number => {
  const warningPeriods: Record<ReportType, number> = {
    'project_setup': 14,
    'project_site_setup': 14,
    'stakeholder_mapping': 30,
    'theory_of_change': 60,
    'risk_register': 7
  };
  
  return warningPeriods[reportType] || 14;
};

// Report priority and urgency calculation
export const calculateReportUrgency = (report: BaseReportData): 'low' | 'medium' | 'high' | 'critical' => {
  const age = getReportAge(report);
  const maxAge = getReportMaxAge(report.reportType);
  const warningPeriod = getReportWarningPeriod(report.reportType);
  
  if (age > maxAge) return 'critical';
  if (age > (maxAge - warningPeriod)) return 'high';
  if (report.status === 'generated' && age > 3) return 'medium';
  
  return 'low';
};

export const getUrgencyColor = (urgency: 'low' | 'medium' | 'high' | 'critical'): string => {
  const colors = {
    'low': 'green',
    'medium': 'yellow',
    'high': 'orange',
    'critical': 'red'
  };
  
  return colors[urgency];
};

export const getUrgencyBadgeClass = (urgency: 'low' | 'medium' | 'high' | 'critical'): string => {
  const classes = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800'
  };
  
  return classes[urgency];
};

// Permission utilities
export const canUserEditReport = (report: BaseReportData, user: any): boolean => {
  if (!user) return false;
  
  // Creator can always edit drafts and generated reports
  if (report.creator === user._id && isReportEditable(report)) {
    return true;
  }
  
  // ConnectGo staff can edit any report
  if (user.isConnectGoStaff) {
    return true;
  }
  
  // Admins and managers can edit
  if (['admin', 'manager'].includes(user.primaryRole)) {
    return true;
  }
  
  return false;
};

export const canUserApproveReport = (report: BaseReportData, user: any): boolean => {
  if (!user) return false;
  
  // Only generated reports can be approved
  if (!isReportApprovable(report)) return false;
  
  // ConnectGo staff can approve
  if (user.isConnectGoStaff) return true;
  
  // Admins and managers can approve
  if (['admin', 'manager'].includes(user.primaryRole)) return true;
  
  return false;
};

export const canUserPublishReport = (report: BaseReportData, user: any): boolean => {
  if (!user) return false;
  
  // Only approved reports can be published
  if (!isReportPublishable(report)) return false;
  
  // ConnectGo staff can publish
  if (user.isConnectGoStaff) return true;
  
  // Admins and managers can publish
  if (['admin', 'manager'].includes(user.primaryRole)) return true;
  
  return false;
};

export const canUserArchiveReport = (report: BaseReportData, user: any): boolean => {
  if (!user) return false;
  
  // Creator can always archive their reports
  if (report.creator === user._id) return true;
  
  // ConnectGo staff can archive
  if (user.isConnectGoStaff) return true;
  
  // Admins can archive
  if (user.primaryRole === 'admin') return true;
  
  return false;
};

// File and export utilities
export const getExportFileName = (report: BaseReportData, format: 'pdf' | 'excel' | 'csv'): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const reportLabel = getReportTypeLabel(report.reportType).replace(/\s+/g, '_');
  const title = report.title?.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30) || 'report';
  
  return `${reportLabel}_${title}_${timestamp}.${format}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Error handling utilities
export const getReportErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred while processing the report';
};

export const isRetryableError = (error: any): boolean => {
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  return retryableStatusCodes.includes(error?.response?.status);
};

// Report comparison utilities
export const compareReportsByDate = (a: BaseReportData, b: BaseReportData): number => {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};

export const compareReportsByStatus = (a: BaseReportData, b: BaseReportData): number => {
  const statusOrder: Record<ReportStatus, number> = {
    'draft': 0,
    'generated': 1,
    'approved': 2,
    'published': 3,
    'archived': 4
  };
  
  return statusOrder[a.status] - statusOrder[b.status];
};

export const compareReportsByUrgency = (a: BaseReportData, b: BaseReportData): number => {
  const urgencyA = calculateReportUrgency(a);
  const urgencyB = calculateReportUrgency(b);
  
  const urgencyOrder = {
    'critical': 0,
    'high': 1,
    'medium': 2,
    'low': 3
  };
  
  return urgencyOrder[urgencyA] - urgencyOrder[urgencyB];
};

// Report analytics utilities
export const calculateReportMetrics = (reports: BaseReportData[]) => {
  const total = reports.length;
  const byStatus = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {} as Record<ReportStatus, number>);
  
  const byType = reports.reduce((acc, report) => {
    acc[report.reportType] = (acc[report.reportType] || 0) + 1;
    return acc;
  }, {} as Record<ReportType, number>);
  
  const expired = reports.filter(report => isReportExpired(report)).length;
  const nearingExpiration = reports.filter(report => {
    const age = getReportAge(report);
    const maxAge = getReportMaxAge(report.reportType);
    const warningPeriod = getReportWarningPeriod(report.reportType);
    return age > (maxAge - warningPeriod) && !isReportExpired(report);
  }).length;
  
  const avgCompletionPercentage = reports.reduce((sum, report) => 
    sum + calculateCompletionPercentage(report), 0) / total || 0;
  
  return {
    total,
    byStatus,
    byType,
    expired,
    nearingExpiration,
    avgCompletionPercentage: Math.round(avgCompletionPercentage * 100) / 100,
    needsAttention: expired + nearingExpiration + (byStatus.generated || 0)
  };
};

// Validation utilities
export const validateReportFilters = (filters: Partial<ReportFilters>): string[] => {
  const errors: string[] = [];
  
  if (filters.dateRange) {
    const { startDate, endDate } = filters.dateRange;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.push('Start date must be before end date');
    }
  }
  
  // Check for status filters (available in filters.status array)
  if (filters.status && filters.status.length === 0) {
    errors.push('At least one status filter must be selected');
  }
  
  // Validate scope-specific filters
  if (filters.scope === 'site' && (!filters.siteIds || filters.siteIds.length === 0)) {
    errors.push('Site IDs are required when scope is set to site');
  }
  
  // Validate stage numbers for theory of change reports
  if (filters.stageNumbers && filters.stageNumbers.some(stage => ![1, 2].includes(stage))) {
    errors.push('Stage numbers must be 1 or 2');
  }
  
  // Validate connection strength range
  if (filters.connectionStrength) {
    const { min, max } = filters.connectionStrength;
    if (min > max) {
      errors.push('Minimum connection strength cannot be greater than maximum');
    }
  }
  
  return errors;
};

export const validateSearchTerm = (searchTerm: string): string[] => {
  const errors: string[] = [];
  
  if (searchTerm.length < 2) {
    errors.push('Search term must be at least 2 characters long');
  }
  
  if (searchTerm.length > 100) {
    errors.push('Search term cannot exceed 100 characters');
  }
  
  return errors;
};

// Cache utilities
export const getCacheKey = (prefix: string, ...args: (string | number)[]): string => {
  return `${prefix}:${args.join(':')}`;
};

export const shouldRefreshCache = (cachedAt: string, maxAgeMinutes: number = 30): boolean => {
  const cacheTime = new Date(cachedAt).getTime();
  const now = Date.now();
  const maxAge = maxAgeMinutes * 60 * 1000;
  
  return (now - cacheTime) > maxAge;
};

// Default export with commonly used functions
export default {
  getReportTypeLabel,
  getReportStatusLabel,
  getReportStatusBadgeClass,
  isReportEditable,
  formatReportDate,
  getRelativeTime,
  calculateCompletionPercentage,
  calculateReportUrgency,
  canUserEditReport,
  canUserApproveReport
};