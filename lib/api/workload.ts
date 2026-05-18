// lib/api/workload.ts
import {apiClient} from './client';
import { WorkloadSummary, SupportEscalationStats, IncidentStats } from '@/types/adminDashboard';

/**
 * Get workload management summary for admin dashboard
 */
export const getWorkloadSummary = async () => {
  try {
    const response = await apiClient.get('/admin/workload/summary');
    return response.data.data as WorkloadSummary;
  } catch (error) {
    console.error('Error fetching workload summary:', error);
    // Return placeholder data if endpoint doesn't exist yet
    return {
      totalItems: 0,
      activeProjects: 0,
      activeSites: 0,
      completedItems: 0,
      capacityStatus: 'green' as const,
      capacityPercentage: 0,
      itemsByStage: {
        onboarding: 0,
        design: 0,
        measure: 0,
        learn: 0,
        tell: 0,
      },
      items: [],
    } as WorkloadSummary;
  }
};

/**
 * Mark a project or site as completed
 */
export const markItemCompleted = async (itemId: string, itemType: 'project' | 'site') => {
  try {
    const response = await apiClient.post(`/admin/workload/${itemType}/${itemId}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error marking item as completed:', error);
    throw error;
  }
};

/**
 * Get support and escalation statistics
 */
export const getSupportEscalationStats = async () => {
  try {
    const response = await apiClient.get('/admin/support/stats');
    return response.data.data as SupportEscalationStats;
  } catch (error) {
    console.error('Error fetching support stats:', error);
    // Return placeholder data if endpoint doesn't exist yet
    return {
      chatbotQuestions: 0,
      clientIncidents: 0,
      satisfactionSurveys: 0,
      overallSatisfaction: 0,
      categorizedSupport: [],
    } as SupportEscalationStats;
  }
};

/**
 * Get incident statistics
 */
export const getIncidentStats = async () => {
  try {
    const response = await apiClient.get('/admin/incidents/stats');
    return response.data.data as IncidentStats;
  } catch (error) {
    console.error('Error fetching incident stats:', error);
    // Return placeholder data if endpoint doesn't exist yet
    return {
      totalIncidents: 0,
      openIncidents: 0,
      resolvedIncidents: 0,
      criticalIncidents: 0,
      recentIncidents: 0,
    } as IncidentStats;
  }
};