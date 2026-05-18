// lib/api/theoryOfChange.ts

import { CreateActionData, CreateImpactData, UpdateRisksData } from '@/types';
import { apiClient } from './client';


// Stage functions
export const initializeStage = async (data: {
  projectId: string;
  projectSiteId?: string;
  stageNumber: number;
}) => {
  return apiClient.post('/theoryOfChange/stages/initialize', data);
};

export const getStagesByProject = async (projectId: string, siteId?: string) => {
  const url = siteId 
    ? `/theoryOfChange/stages/project/${projectId}/site/${siteId}`
    : `/theoryOfChange/stages/project/${projectId}`;
  return apiClient.get(url);
};

export const getStageProgress = async (stageId: string) => {
  return apiClient.get(`/theoryOfChange/stages/${stageId}`);
};

export const completeStage = async (stageId: string) => {
  return apiClient.put(`/theoryOfChange/stages/${stageId}/complete`);
};

export const getStageStatusWithConsultation = async (projectId: string, projectSiteId?: string) => {
  const url = projectSiteId 
    ? `/theoryOfChange/status/${projectId}/${projectSiteId}`
    : `/theoryOfChange/status/${projectId}`;
  // Add cache-busting parameter
  const timestamp = new Date().getTime();
  return apiClient.get(`${url}?_t=${timestamp}`);
};

// Stage 1 - Stakeholder Actions
export const createAction = async (data: CreateActionData) => {
  return apiClient.post('/theoryOfChange/actions', data);
};

export const getActionsByStage = async (stageId: string) => {
  return apiClient.get(`/theoryOfChange/actions/stage/${stageId}`);
};

export const getActionsByStakeholder = async (stageId: string, stakeholderId: string) => {
  return apiClient.get(`/theoryOfChange/actions/stage/${stageId}/stakeholder/${stakeholderId}`);
};

// NEW: Get single action by ID
export const getActionById = async (actionId: string) => {
  return apiClient.get(`/theoryOfChange/actions/${actionId}`);
};

// NEW: Get all actions for a project
export const getActionsByProject = async (projectId: string, projectSiteId?: string) => {
  const params = projectSiteId ? { projectSiteId } : {};
  return apiClient.get(`/theoryOfChange/actions/project/${projectId}`, { params });
};

// NEW: Get available subthemes for selected themes (for actions)
export const getAvailableSubThemesForActions = async (themeIds: string[]) => {
  return apiClient.post('/theoryOfChange/actions/available-subthemes', { themeIds });
};

export const updateAction = async (actionId: string, data: Partial<CreateActionData>) => {
  return apiClient.put(`/theoryOfChange/actions/${actionId}`, data);
};

export const deleteAction = async (actionId: string) => {
  return apiClient.delete(`/theoryOfChange/actions/${actionId}`);
};

// Stage 2 - Social Impacts
export const defineOutcome = async (data: CreateImpactData) => {
  return apiClient.post('/theoryOfChange/impacts', data);
};

// CHANGED: Was addRisk, now updateRisks (handles both adding and updating)
export const updateRisks = async (impactId: string, data: UpdateRisksData) => {
  return apiClient.put(`/theoryOfChange/impacts/${impactId}/risks`, data);
};

// DEPRECATED: Keep for backward compatibility, but redirect to updateRisks
export const addRisk = async (impactId: string, data: UpdateRisksData) => {
  console.warn('addRisk is deprecated. Use updateRisks instead.');
  return updateRisks(impactId, data);
};

export const getImpactsByStage = async (stageId: string) => {
  return apiClient.get(`/theoryOfChange/impacts/stage/${stageId}`);
};

export const getImpactsByStakeholder = async (stageId: string, stakeholderId: string) => {
  return apiClient.get(`/theoryOfChange/impacts/stage/${stageId}/stakeholder/${stakeholderId}`);
};

// NEW: Get single impact by ID
export const getImpactById = async (impactId: string) => {
  return apiClient.get(`/theoryOfChange/impacts/${impactId}`);
};

// Get RiskRegister entries linked to a social impact via sourceReference
export const getImpactRisks = async (impactId: string) => {
  return apiClient.get(`/theoryOfChange/impacts/${impactId}/risks`);
};

// NEW: Get available subthemes for selected themes (for impacts)
export const getAvailableSubThemesForImpacts = async (themeIds: string[]) => {
  return apiClient.post('/theoryOfChange/impacts/available-subthemes', { themeIds });
};

export const updateImpact = async (impactId: string, data: Partial<CreateImpactData>) => {
  return apiClient.put(`/theoryOfChange/impacts/${impactId}`, data);
};

export const deleteImpact = async (impactId: string) => {
  return apiClient.delete(`/theoryOfChange/impacts/${impactId}`);
};

// Output documents
export const getWorkplan = async (stageId: string) => {
  return apiClient.get(`/theoryOfChange/outputs/workplan/${stageId}`);
};

export const getLogicModel = async (stageId: string) => {
  return apiClient.get(`/theoryOfChange/outputs/logic-model/${stageId}`);
};

// Helper functions for working with multiple themes/subthemes

/**
 * Validate that selected subthemes belong to selected themes
 * This is a client-side helper that you can use before making API calls
 */
export const validateThemeSubthemeSelection = (
  selectedThemes: string[],
  selectedSubthemes: string[],
  availableSubthemes: Array<{
    _id: string;
    name: string;
    theme: { _id: string; name: string };
  }>
): { isValid: boolean; invalidSubthemes: string[] } => {
  const selectedThemeSet = new Set(selectedThemes);
  
  const invalidSubthemes = selectedSubthemes.filter(subthemeId => {
    const subtheme = availableSubthemes.find(st => st._id === subthemeId);
    return subtheme && !selectedThemeSet.has(subtheme.theme._id);
  });

  return {
    isValid: invalidSubthemes.length === 0,
    invalidSubthemes
  };
};

/**
 * Get unique theme IDs from a list of subthemes
 */
export const getThemeIdsFromSubthemes = (
  subthemeIds: string[],
  availableSubthemes: Array<{
    _id: string;
    theme: { _id: string };
  }>
): string[] => {
  const themeIds = new Set<string>();
  
  subthemeIds.forEach(subthemeId => {
    const subtheme = availableSubthemes.find(st => st._id === subthemeId);
    if (subtheme) {
      themeIds.add(subtheme.theme._id);
    }
  });

  return Array.from(themeIds);
};

// Export all functions as default for easier importing
export default {
  // Stage management
  initializeStage,
  getStagesByProject,
  getStageProgress,
  completeStage,
  getStageStatusWithConsultation,
  
  // Actions (Stage 1)
  createAction,
  getActionsByStage,
  getActionsByStakeholder,
  getActionById,
  getActionsByProject,
  getAvailableSubThemesForActions,
  updateAction,
  deleteAction,
  
  // Impacts (Stage 2)
  defineOutcome,
  updateRisks,
  addRisk, // deprecated
  getImpactsByStage,
  getImpactsByStakeholder,
  getImpactById,
  getAvailableSubThemesForImpacts,
  updateImpact,
  deleteImpact,
  
  // Outputs
  getWorkplan,
  getLogicModel,
  
  // Helpers
  validateThemeSubthemeSelection,
  getThemeIdsFromSubthemes
};