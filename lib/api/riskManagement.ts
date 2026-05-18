// lib/api/riskManagement.ts (Updated with Review Frequency)
import { RiskItem, CreateRiskData, UpdateRiskData, RiskRegisterSummary, RiskComment } from '@/types';
import { apiClient } from './client';

/**
 * Get risk register summary with filtering options
 */
export const getRiskRegisterSummary = async (filters: {
  projectId?: string;
  projectSiteId?: string;
  organizationId?: string;
  riskScore?: string;
  riskSource?: string;
  status?: string;
  owner?: string;
  reviewDateFrom?: string;
  reviewDateTo?: string;
} = {}): Promise<RiskRegisterSummary> => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const response = await apiClient.get(`/admin/dashboard/risks?${queryParams}`);
  return response.data.data;
};

/**
 * Get detailed risk information
 */
export const getRiskDetails = async (riskId: string): Promise<RiskItem> => {
  const response = await apiClient.get(`/admin/dashboard/risks/${riskId}`);
  return response.data.data;
};

/**
 * Create new risk item
 */
export const createRiskItem = async (data: CreateRiskData): Promise<RiskItem> => {
  const response = await apiClient.post('/admin/dashboard/risks', data);
  return response.data.data;
};

/**
 * Update risk item
 */
export const updateRiskItem = async (riskId: string, data: UpdateRiskData): Promise<RiskItem> => {
  const response = await apiClient.put(`/admin/dashboard/risks/${riskId}`, data);
  return response.data.data;
};

/**
 * Delete a risk item
 */
export const deleteRiskItem = async (riskId: string): Promise<void> => {
  await apiClient.delete(`/admin/dashboard/risks/${riskId}`);
};

/**
 * Add comment to risk
 */
export const addRiskComment = async (riskId: string, text: string): Promise<RiskComment> => {
  const response = await apiClient.post(`/admin/dashboard/risks/${riskId}/comments`, { text });
  return response.data.data;
};

/**
 * Toggle comment as key insight (star/unstar)
 */
export const toggleCommentKeyInsight = async (riskId: string, commentId: string): Promise<{
  comment: RiskComment;
  isKeyInsight: boolean;
}> => {
  const response = await apiClient.put(`/admin/dashboard/risks/${riskId}/comments/${commentId}/star`);
  return response.data.data;
};

/**
 * Add mitigation action to risk
 */
export const addMitigationAction = async (riskId: string, data: {
  action: string;
  responsible?: string;
  dueDate?: string;
  notes?: string;
}) => {
  const response = await apiClient.post(`/admin/dashboard/risks/${riskId}/mitigation-actions`, data);
  return response.data.data;
};

/**
 * Update mitigation action status
 */
export const updateMitigationAction = async (riskId: string, actionId: string, data: {
  status?: string;
  notes?: string;
}) => {
  const response = await apiClient.put(`/admin/dashboard/risks/${riskId}/mitigation-actions/${actionId}`, data);
  return response.data.data;
};

/**
 * Add review comment to risk (for reviewers)
 * @deprecated Use addRiskComment instead
 */
export const addReviewComment = async (riskId: string, data: {
  comment: string;
}) => {
  const response = await apiClient.post(`/admin/dashboard/risks/${riskId}/review-comments`, data);
  return response.data.data;
};

/**
 * Get risks assigned to current user
 */
export const getMyRisks = async (): Promise<{
  stats: {
    total: number;
    asOwner: number;
    byScore: {
      high: number;
      medium: number;
      low: number;
    };
    byStatus: {
      open: number;
      monitoring: number;
      closed: number;
    };
    bySource: Record<string, number>;
    overdue: number;
  };
  risks: RiskItem[];
}> => {
  const response = await apiClient.get('/admin/my-risks');
  return response.data.data;
};

/**
 * Archive/Delete risk (soft delete)
 */
export const archiveRisk = async (riskId: string) => {
  const response = await apiClient.delete(`/admin/dashboard/risks/${riskId}`);
  return response.data;
};

/**
 * Get users in organization (for owner filter)
 */
export const getOrganizationUsers = async (organizationId: string) => {
  const response = await apiClient.get(`/admin/organizations/${organizationId}/users`);
  return response.data.data;
};

/**
 * Get risk type options based on user role
 */
export const getRiskTypeOptions = (): Record<string, string[]> => {
  return {
    // ConnectGo staff roles - full access
    admin: [
      'operational', 'financial', 'strategic', 'compliance', 
      'environmental', 'social', 'technical', 'reputational', 
      'political', 'market', 'legal'
    ],
    owner: [
      'operational', 'financial', 'strategic', 'compliance', 
      'environmental', 'social', 'technical', 'reputational', 
      'political', 'market', 'legal'
    ],
    accountManager: [
      'operational', 'financial', 'strategic', 'compliance', 
      'environmental', 'social', 'technical', 'reputational', 
      'political', 'market', 'legal'
    ],
    // Client roles
    manager: [
      'operational', 'financial', 'strategic', 'compliance', 
      'environmental', 'social', 'technical', 'reputational', 
      'political', 'market', 'legal'
    ],
    projectCreator: [
      'operational', 'environmental', 'social', 'technical', 
      'financial', 'market', 'reputational'
    ],
    organiser: [
      'operational', 'environmental', 'social', 'technical'
    ],
    reviewer: [], // Can view all but cannot create
    fieldAgent: [
      'operational', 'environmental', 'social', 'technical'
    ]
  };
};

/**
 * Get risk source options
 */
export const getRiskSourceOptions = () => [
  { value: 'manual', label: 'Manual Entry' },
  { value: 'project_setup', label: 'Project Setup' },
  { value: 'site_setup', label: 'Site Setup' },
  { value: 'stakeholder_mapping', label: 'Stakeholder Mapping' },
  { value: 'toc_stage1', label: 'Theory of Change - Stage 1' },
  { value: 'toc_stage2', label: 'Theory of Change - Stage 2' }
];

/**
 * ✅ NEW: Get review frequency options
 */
export const getReviewFrequencyOptions = () => [
  { 
    value: 'quarterly', 
    label: 'Quarterly',
    description: 'Review every 3 months',
    months: 3
  },
  { 
    value: 'half_yearly', 
    label: 'Half-Yearly',
    description: 'Review every 6 months',
    months: 6
  },
  { 
    value: 'yearly', 
    label: 'Yearly',
    description: 'Review every 12 months',
    months: 12
  }
];

/**
 * ✅ NEW: Calculate next review date based on frequency
 */
export const calculateNextReviewDate = (currentDate: Date, frequency: 'quarterly' | 'half_yearly' | 'yearly'): Date => {
  const nextDate = new Date(currentDate);
  
  const monthsToAdd = {
    'quarterly': 3,
    'half_yearly': 6,
    'yearly': 12
  };
  
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd[frequency]);
  return nextDate;
};

/**
 * ✅ NEW: Get review frequency display name
 */
export const getReviewFrequencyDisplayName = (frequency: string): string => {
  const displayNames: Record<string, string> = {
    'quarterly': 'Quarterly (Every 3 months)',
    'half_yearly': 'Half-Yearly (Every 6 months)',
    'yearly': 'Yearly (Every 12 months)'
  };
  
  return displayNames[frequency] || frequency;
};

/**
 * Get probability options
 */
export const getProbabilityOptions = () => [
  { value: 'very_low', label: 'Very Low' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very High' }
];

/**
 * Get consequences options
 */
export const getConsequencesOptions = () => [
  { value: 'negligible', label: 'Negligible' },
  { value: 'minor', label: 'Minor' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'major', label: 'Major' },
  { value: 'catastrophic', label: 'Catastrophic' }
];

/**
 * Get risk status options
 */
export const getRiskStatusOptions = () => [
  { value: 'open', label: 'Open' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'closed', label: 'Closed' },
  { value: 'transferred', label: 'Transferred' }
];

/**
 * Get impact area options
 */
export const getImpactAreaOptions = () => [
  { value: 'timeline', label: 'Timeline' },
  { value: 'budget', label: 'Budget' },
  { value: 'scope', label: 'Scope' },
  { value: 'quality', label: 'Quality' },
  { value: 'stakeholders', label: 'Stakeholders' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'reputation', label: 'Reputation' }
];

/**
 * Get mitigation action status options
 */
export const getMitigationStatusOptions = () => [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

/**
 * Get risk score color for UI styling
 */
export const getRiskScoreColor = (score: string): string => {
  switch (score) {
    case 'high':
      return 'text-red-600 bg-red-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Get risk type display name
 */
export const getRiskTypeDisplayName = (type: string): string => {
  const displayNames: Record<string, string> = {
    operational: 'Operational',
    financial: 'Financial',
    strategic: 'Strategic',
    compliance: 'Compliance',
    environmental: 'Environmental',
    social: 'Social',
    technical: 'Technical',
    reputational: 'Reputational',
    political: 'Political',
    market: 'Market',
    legal: 'Legal'
  };
  
  return displayNames[type] || type;
};

/**
 * Get risk source display name
 */
export const getRiskSourceDisplayName = (source: string): string => {
  const displayNames: Record<string, string> = {
    manual: 'Manual Entry',
    project_setup: 'Project Setup',
    site_setup: 'Site Setup',
    stakeholder_mapping: 'Stakeholder Mapping',
    toc_stage1: 'Theory of Change - Stage 1',
    toc_stage2: 'Theory of Change - Stage 2'
  };
  
  return displayNames[source] || source;
};

export default {
  getRiskRegisterSummary,
  getRiskDetails,
  createRiskItem,
  updateRiskItem,
  addRiskComment,
  toggleCommentKeyInsight,
  addMitigationAction,
  updateMitigationAction,
  addReviewComment,
  getMyRisks,
  archiveRisk,
  getOrganizationUsers,
  getRiskTypeOptions,
  getRiskSourceOptions,
  getReviewFrequencyOptions, // ✅ NEW
  calculateNextReviewDate, // ✅ NEW
  getReviewFrequencyDisplayName, // ✅ NEW
  getProbabilityOptions,
  getConsequencesOptions,
  getRiskStatusOptions,
  getImpactAreaOptions,
  getMitigationStatusOptions,
  getRiskScoreColor,
  getRiskTypeDisplayName,
  getRiskSourceDisplayName
};