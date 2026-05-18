// lib/api/questionLibrary.ts
// API functions for question library operations

import { QuestionLibrary } from '@/types';
import { apiClient } from './client';

// Define types
export interface CreateLibraryData {
  name: string;
  description?: string;
}

export interface UpdateLibraryData {
  name?: string;
  description?: string;
}

/**
 * Fetch all question libraries
 * @returns Promise with library data
 */
export const fetchQuestionLibraries = async () => {
  try {
    const response = await apiClient.get('/questionlibrary');
    return response.data;
  } catch (error) {
    console.error('Error fetching question libraries:', error);
    throw error;
  }
};

/**
 * Fetch a specific question library by ID
 * @param id Library ID
 * @returns Promise with library data
 */
export const fetchQuestionLibrary = async (id: string) => {
  try {
    const response = await apiClient.get(`/questionlibrary/${id}?populate=questions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching question library ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new question library
 * @param data Library data to create
 * @returns Promise with created library data
 */
export const createQuestionLibrary = async (data: CreateLibraryData) => {
  try {
    const response = await apiClient.post('/questionlibrary', data);
    return response.data;
  } catch (error) {
    console.error('Error creating question library:', error);
    throw error;
  }
};

/**
 * Update an existing question library
 * @param id Library ID to update
 * @param data Updated library data
 * @returns Promise with updated library data
 */
export const updateQuestionLibrary = async (id: string, data: UpdateLibraryData) => {
  try {
    const response = await apiClient.put(`/questionlibrary/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating question library ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a question library
 * @param id Library ID to delete
 * @returns Promise with delete confirmation
 */
export const deleteQuestionLibrary = async (id: string) => {
  try {
    const response = await apiClient.delete(`/questionlibrary/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting question library ${id}:`, error);
    throw error;
  }
};

/**
 * Add questions to a library
 * @param libraryId Library ID to add questions to
 * @param questionIds Array of question IDs to add
 * @returns Promise with updated library data
 */
export const addQuestionsToLibrary = async (libraryId: string, questionIds: string[]) => {
  try {
    const response = await apiClient.post(`/questionlibrary/${libraryId}/questions`, {
      questions: questionIds
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding questions to library ${libraryId}:`, error);
    throw error;
  }
};

/**
 * Remove questions from a library
 * @param libraryId Library ID to remove questions from
 * @param questionIds Array of question IDs to remove
 * @returns Promise with updated library data
 */
export const removeQuestionsFromLibrary = async (libraryId: string, questionIds: string[]) => {
  try {
    const response = await apiClient.delete(`/questionlibrary/${libraryId}/questions`, {
      data: { questions: questionIds }
    });
    return response.data;
  } catch (error) {
    console.error(`Error removing questions from library ${libraryId}:`, error);
    throw error;
  }
};