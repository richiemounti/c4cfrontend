// lib/api/surveySection.ts - UPDATED FOR NESTED ROUTES
import { apiClient } from './client';
import {
  SurveySection,
  CreateSurveySectionRequest,
  ReorderItemsRequest
} from '@/types';

/**
 * Create a new survey section
 */
export const createSurveySection = async (
  surveyId: string,
  data: CreateSurveySectionRequest
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/sections`, data);
    return response.data;
  } catch (error) {
    console.error(`Error creating survey section for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get all sections for a survey
 */
export const getSurveySections = async (surveyId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/sections`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey sections for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get a single survey section by ID
 * UPDATED: Now uses nested route structure
 */
export const getSurveySection = async (surveyId: string, sectionId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/sections/${sectionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Update a survey section
 * UPDATED: Now uses nested route structure
 */
export const updateSurveySection = async (
  surveyId: string,
  sectionId: string,
  data: Partial<CreateSurveySectionRequest>
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/sections/${sectionId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating survey section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Delete a survey section
 * UPDATED: Now uses nested route structure
 */
export const deleteSurveySection = async (surveyId: string, sectionId: string) => {
  try {
    const response = await apiClient.delete(`/surveys/${surveyId}/sections/${sectionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting survey section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Reorder survey sections — pass section IDs in the desired new order
 */
export const reorderSurveySections = async (
  surveyId: string,
  sectionIds: string[]
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/sections/reorder`, {
      sections: sectionIds.map(id => ({ id }))
    });
    return response.data;
  } catch (error) {
    console.error(`Error reordering survey sections for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Duplicate a survey section
 * UPDATED: Now uses nested route structure
 */
export const duplicateSurveySection = async (
  surveyId: string, 
  sectionId: string, 
  newTitle?: string
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/sections/${sectionId}/duplicate`, {
      newTitle
    });
    return response.data;
  } catch (error) {
    console.error(`Error duplicating survey section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Move section to different position
 * UPDATED: Now uses nested route structure
 */
export const moveSurveySection = async (
  surveyId: string,
  sectionId: string,
  newOrder: number
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/sections/${sectionId}/move`, {
      order: newOrder
    });
    return response.data;
  } catch (error) {
    console.error(`Error moving survey section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Get section with questions
 * UPDATED: Now uses nested route structure
 */
export const getSurveySectionWithQuestions = async (surveyId: string, sectionId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/sections/${sectionId}/questions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey section with questions ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Bulk create sections from template
 */
export const createSectionsFromTemplate = async (
  surveyId: string,
  templateType: 'basic' | 'demographic' | 'stakeholder' | 'impact'
) => {
  try {
    const templates = {
      basic: [
        { title: 'Introduction', description: 'Basic information and consent' },
        { title: 'Main Questions', description: 'Core survey questions' },
        { title: 'Additional Comments', description: 'Open feedback section' }
      ],
      demographic: [
        { title: 'Personal Information', description: 'Basic demographic data' },
        { title: 'Professional Background', description: 'Work and education details' },
        { title: 'Community Involvement', description: 'Local engagement and participation' }
      ],
      stakeholder: [
        { title: 'Stakeholder Identification', description: 'Role and relationship to project' },
        { title: 'Expectations and Concerns', description: 'Project-related expectations' },
        { title: 'Engagement Preferences', description: 'Communication and participation preferences' }
      ],
      impact: [
        { title: 'Baseline Conditions', description: 'Current situation assessment' },
        { title: 'Expected Outcomes', description: 'Anticipated project impacts' },
        { title: 'Monitoring Indicators', description: 'Measurable impact indicators' }
      ]
    };

    const sectionsToCreate = templates[templateType] || templates.basic;
    const createdSections = [];

    for (let i = 0; i < sectionsToCreate.length; i++) {
      const sectionData = {
        ...sectionsToCreate[i],
        order: i + 1
      };
      const response = await createSurveySection(surveyId, sectionData);
      createdSections.push(response.data);
    }

    return {
      success: true,
      data: createdSections,
      message: `${sectionsToCreate.length} sections created from ${templateType} template`
    };
  } catch (error) {
    console.error(`Error creating sections from template:`, error);
    throw error;
  }
};

/**
 * Get section statistics
 * UPDATED: Now uses nested route structure
 */
export const getSurveySectionStats = async (surveyId: string, sectionId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/sections/${sectionId}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey section stats ${sectionId}:`, error);
    throw error;
  }
};