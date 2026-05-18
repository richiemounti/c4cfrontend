// lib/api/riskAnalytics.ts
import { RiskChangeLog, RiskTrendData, RiskAnalytics } from '@/types';
import { apiClient } from './client';

/**
 * Get change log for a specific risk
 */
export const getRiskChangelog = async (
  riskId: string,
  limit: number = 50
): Promise<{
  count: number;
  changeLogs: RiskChangeLog[];
}> => {
  const response = await apiClient.get(
    `/admin/dashboard/risks/${riskId}/changelog?limit=${limit}`
  );
  return response.data.data;
};

/**
 * Get risk trends over time for visualizations
 */
export const getRiskTrends = async (filters: {
  projectId: string;
  startDate?: string;
  endDate?: string;
  interval?: 'day' | 'week';
}): Promise<{
  interval: string;
  startDate: string;
  endDate: string;
  trends: RiskTrendData[];
}> => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const response = await apiClient.get(
    `/admin/dashboard/risks/analytics/trends?${queryParams}`
  );
  return response.data.data;
};

/**
 * Get status change analysis
 */
export const getStatusChanges = async (filters: {
  projectId: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  startDate: string;
  endDate: string;
  statusChanges: Array<{
    fromStatus: string;
    toStatus: string;
    count: number;
    riskCount: number;
  }>;
}> => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const response = await apiClient.get(
    `/admin/dashboard/risks/analytics/status-changes?${queryParams}`
  );
  return response.data.data;
};

/**
 * Get mitigation effectiveness metrics
 */
export const getMitigationEffectiveness = async (
  projectId: string
): Promise<{
  effectiveness: Array<{
    riskId: string;
    riskName: string;
    initialScore: string;
    currentScore: string;
    daysTracked: number;
    actionsCompleted: number;
    totalActions: number;
    completionRate: number;
    effectiveness: number;
  }>;
  averageEffectiveness: number;
}> => {
  const response = await apiClient.get(
    `/admin/dashboard/risks/analytics/mitigation-effectiveness?projectId=${projectId}`
  );
  return response.data.data;
};

/**
 * Get change statistics for a project
 */
export const getChangeStats = async (filters: {
  projectId: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  startDate: string;
  endDate: string;
  changesByType: Array<{
    _id: string;
    count: number;
    highImpact: number;
  }>;
  mostActiveUsers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    changeCount: number;
  }>;
}> => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const response = await apiClient.get(
    `/admin/dashboard/risks/analytics/change-stats?${queryParams}`
  );
  return response.data.data;
};

/**
 * Format change type for display
 */
export const getChangeTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    status: 'Status Change',
    assessment: 'Risk Assessment',
    mitigation: 'Mitigation Update',
    review: 'Review Date',
    ownership: 'Ownership Change',
    source: 'Source Update',
    general: 'General Update'
  };
  
  return labels[type] || type;
};

/**
 * Get change type icon
 */
export const getChangeTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    status: '📊',
    assessment: '⚠️',
    mitigation: '🛡️',
    review: '📅',
    ownership: '👤',
    source: '📍',
    general: '📝'
  };
  
  return icons[type] || '📝';
};

/**
 * Get impact level color
 */
export const getImpactColor = (impact: string): string => {
  switch (impact) {
    case 'high':
      return 'text-sand-600 bg-sand-100 border-sand-300';
    case 'medium':
      return 'text-ochre-600 bg-ochre-100 border-ochre-300';
    case 'low':
      return 'text-grass-600 bg-grass-100 border-grass-300';
    default:
      return 'text-sky-600 bg-sky-100 border-sky-300';
  }
};

/**
 * Format time ago for changelog
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
};

export default {
  getRiskChangelog,
  getRiskTrends,
  getStatusChanges,
  getMitigationEffectiveness,
  getChangeStats,
  getChangeTypeLabel,
  getChangeTypeIcon,
  getImpactColor,
  formatTimeAgo
};