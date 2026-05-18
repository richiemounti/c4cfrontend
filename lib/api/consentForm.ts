// lib/api/consentForm.ts - COMPLETE VERSION
import { apiClient } from './client';
import {
  ConsentForm,
  CreateConsentFormRequest,
  UpdateConsentFormRequest,
  ConsentFormFilters,
  CloneConsentFormRequest
} from '@/types';

/**
 * Create a new consent form
 */
export const createConsentForm = async (data: CreateConsentFormRequest) => {
  try {
    const response = await apiClient.post('/consent-forms', data);
    return response.data;
  } catch (error) {
    console.error('Error creating consent form:', error);
    throw error;
  }
};

/**
 * Get all consent forms with filtering
 */
export const getConsentForms = async (params?: ConsentFormFilters) => {
  try {
    const response = await apiClient.get('/consent-forms', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching consent forms:', error);
    throw error;
  }
};

/**
 * Get a single consent form by ID
 */
export const getConsentForm = async (id: string) => {
  try {
    const response = await apiClient.get(`/consent-forms/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching consent form ${id}:`, error);
    throw error;
  }
};

/**
 * Update a consent form
 */
export const updateConsentForm = async (id: string, data: UpdateConsentFormRequest) => {
  try {
    const response = await apiClient.put(`/consent-forms/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating consent form ${id}:`, error);
    throw error;
  }
};

/**
 * Archive a consent form
 */
export const archiveConsentForm = async (id: string) => {
  try {
    const response = await apiClient.delete(`/consent-forms/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error archiving consent form ${id}:`, error);
    throw error;
  }
};

/**
 * Get available consent forms for a project
 */
export const getAvailableConsentFormsForProject = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/consent-forms/available/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching available consent forms for project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Clone a consent form
 */
export const cloneConsentForm = async (id: string, options?: CloneConsentFormRequest) => {
  try {
    const response = await apiClient.post(`/consent-forms/${id}/clone`, options);
    return response.data;
  } catch (error) {
    console.error(`Error cloning consent form ${id}:`, error);
    throw error;
  }
};

// ===============================
// NEW FUNCTIONS TO ADD
// ===============================

/**
 * Get public consent form (no authentication required)
 * Used by survey respondents to view consent before starting
 */
export const getPublicConsentForm = async (consentFormId: string) => {
  try {
    const response = await apiClient.get(`/consent-forms/public/${consentFormId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public consent form ${consentFormId}:`, error);
    throw error;
  }
};

/**
 * Get consent form usage statistics
 */
export const getConsentFormUsage = async (id: string) => {
  try {
    const response = await apiClient.get(`/consent-forms/${id}/usage`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching consent form usage for ${id}:`, error);
    throw error;
  }
};

/**
 * Get consent form templates
 */
export const getConsentFormTemplates = async (params?: {
  templateCategory?: string;
  language?: string;
}) => {
  try {
    const response = await apiClient.get('/consent-forms', {
      params: {
        ...params,
        isTemplate: true,
        isActive: true
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching consent form templates:', error);
    throw error;
  }
};

/**
 * Search consent forms
 */
export const searchConsentForms = async (searchTerm: string, filters?: {
  organization?: string;
  project?: string;
  isTemplate?: boolean;
  isActive?: boolean;
}) => {
  try {
    const response = await apiClient.get('/consent-forms', {
      params: {
        search: searchTerm,
        ...filters
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching consent forms:', error);
    throw error;
  }
};