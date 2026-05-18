// lib/api/projectSiteSetup.ts
import { SetupResponse } from '@/types';
import { apiClient } from './client';


// Project site setup functions
export const initializeProjectSiteSetup = async (siteId: string) => {
  const response = await apiClient.post(`/setup/project-sites/${siteId}/setup/initialize`);
  return response.data;
};

export const getProjectSiteSetup = async (siteId: string) => {
  const response = await apiClient.get(`/setup/project-sites/${siteId}/setup`);
  return response.data.data as SetupResponse;
};

export const getProjectSiteSetupProgress = async (siteId: string) => {
  const response = await apiClient.get(`/setup/project-sites/${siteId}/setup/progress`);
  return response.data.data;
};

// lib/api/projectSiteSetup.ts

export const completeProjectSiteSetupTask = async (
  setupId: string,
  taskId: string,
  responseData: any,
  files?: File[] // ✅ Changed from File to File[]
) => {
  if (files && files.length > 0) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    
    formData.append('responseData', JSON.stringify(responseData));
    
    const response = await apiClient.put(
      `/setup/project-site-setup/${setupId}/tasks/${taskId}/complete`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }
  
  const response = await apiClient.put(
    `/setup/project-site-setup/${setupId}/tasks/${taskId}/complete`,
    { responseData }
  );
  return response.data.data;
};

export const updateProjectSiteSetupTaskData = async (
  setupId: string,
  taskId: string,
  responseData: any,
  files?: File[] // ✅ Changed from File to File[]
) => {
  if (files && files.length > 0) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    
    formData.append('responseData', JSON.stringify(responseData));
    
    const response = await apiClient.patch(
      `/setup/project-site-setup/${setupId}/tasks/${taskId}/data`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }
  
  const response = await apiClient.patch(
    `/setup/project-site-setup/${setupId}/tasks/${taskId}/data`,
    { responseData }
  );
  return response.data.data;
};

/**
 * Remove a specific file from a project site setup task
 * @param setupId - The project site setup ID
 * @param taskId - The task ID
 * @param filename - The Cloudinary filename/public_id to remove
 * @returns Promise with updated task data
 */
export const removeProjectSiteSetupTaskFile = async (
  setupId: string,
  taskId: string,
  filename: string
) => {
  // ✅ Encode the filename for URL safety
  const encodedFilename = encodeURIComponent(filename);
  
  const response = await apiClient.delete(
    `/setup/project-site-setup/${setupId}/tasks/${taskId}/files/${encodedFilename}`
  );
  return response.data.data;
};