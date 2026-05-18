// lib/api/tocConsultationPlan.ts

import { apiClient } from './client';

// Consultation Plan CRUD operations
export const createOrUpdateConsultationPlan = async (data: {
  projectId: string;
  projectSiteId: string;
  stakeholderGroups?: Array<{
    stakeholderGroup: string;
    isSelected: boolean;
    notes?: string;
  }>;
  consultationQuestions?: {
    howManyPeople?: string;
    whoInvitedHow?: string;
    whereHow?: string;
    underRepresentedGroups?: string;
    costsPlanning?: string;
    permissions?: string;
  };
  plannedConsultationDates?: {
    startDate?: string;
    endDate?: string;
    dateDescription?: string;
  };
}) => {
  return apiClient.post('/consultation', data);
};

export const getConsultationPlanBySite = async (siteId: string) => {
  return apiClient.get(`/consultation/site/${siteId}`);
};

export const getStakeholderGroupsForSite = async (siteId: string) => {
  return apiClient.get(`/consultation/site/${siteId}/stakeholder-groups`);
};

export const checkConsultationPlanStatus = async (siteId: string) => {
  return apiClient.get(`/consultation/site/${siteId}/status`);
};

export const getConsultationPlansByProject = async (projectId: string) => {
  return apiClient.get(`/consultation/project/${projectId}`);
};

export const completeConsultationPlan = async (planId: string) => {
  return apiClient.put(`/consultation/${planId}/complete`);
};

export const deleteConsultationPlan = async (planId: string) => {
  return apiClient.delete(`/consultation/${planId}`);
};

// Helper function to check if all sites in a project have completed consultation plans
export const checkProjectConsultationStatus = async (projectId: string) => {
  const response = await getConsultationPlansByProject(projectId);
  const plans = response.data.data;
  
  return {
    allCompleted: plans.every((plan: any) => plan.isCompleted),
    totalPlans: plans.length,
    completedPlans: plans.filter((plan: any) => plan.isCompleted).length,
    incompletePlans: plans.filter((plan: any) => !plan.isCompleted),
  };
};