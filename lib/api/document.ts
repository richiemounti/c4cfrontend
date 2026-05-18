// lib/api/document.ts
import { apiClient } from '@/lib/api/client';

/**
 * Get documents with filtering options
 */
export const getDocuments = async (filters = {}) => {
  try {
    // Convert filters to query string parameters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    const response = await apiClient.get(`/documents?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

/**
 * Get a single document by ID
 */
export const getDocument = async (documentId: string) => {
  try {
    const response = await apiClient.get(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};

/**
 * Upload a document
 * @param formData FormData containing file and metadata
 */
export const uploadDocument = async (formData: FormData) => {
  try {
    // Use multipart/form-data for file uploads
    const response = await apiClient.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

/**
 * Download a document
 * @param documentId ID of the document to download
 */
export const downloadDocument = async (documentId: string) => {
  try {
    // Use responseType blob for file downloads
    const response = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    
    // Get the filename from the Content-Disposition header if available
    let filename = 'document';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
};

/**
 * Delete a document
 * @param documentId ID of the document to delete
 */
export const deleteDocument = async (documentId: string) => {
  try {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

/**
 * Get project documents
 * @param projectId ID of the project
 */
export const getProjectDocuments = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/documents/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project documents:', error);
    throw error;
  }
};

/**
 * Get site documents
 * @param siteId ID of the site
 */
export const getSiteDocuments = async (siteId: string) => {
  try {
    const response = await apiClient.get(`/documents/site/${siteId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching site documents:', error);
    throw error;
  }
};

/**
 * Upload document for a specific project
 * @param projectId ID of the project
 * @param formData FormData containing file and metadata
 */
export const uploadProjectDocument = async (projectId: string, formData: FormData) => {
  try {
    const response = await apiClient.post(`/documents/project/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading project document:', error);
    throw error;
  }
};

/**
 * Upload document for a specific site
 * @param siteId ID of the site
 * @param formData FormData containing file and metadata
 */
export const uploadSiteDocument = async (siteId: string, formData: FormData) => {
  try {
    const response = await apiClient.post(`/documents/site/${siteId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading site document:', error);
    throw error;
  }
};