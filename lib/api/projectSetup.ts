// lib/api/projectSetup.ts
import { SetupResponse } from '@/types';
import { apiClient } from './client';



// Project setup functions
export const initializeProjectSetup = async (projectId: string) => {
  const response = await apiClient.post(`/setup/projects/${projectId}/setup/initialize`);
  return response.data;
};

export const getProjectSetup = async (projectId: string) => {
  const response = await apiClient.get(`/setup/projects/${projectId}/setup`);
  return response.data.data as SetupResponse;
};

export const getProjectSetupProgress = async (projectId: string) => {
  const response = await apiClient.get(`/setup/projects/${projectId}/setup/progress`);
  return response.data.data;
};

export const completeProjectSetupTask = async (
  setupId: string,
  taskId: string,
  responseData: any,
  files?: File[] // ✅ Changed from File to File[]
) => {
  // If there are files, use FormData
  if (files && files.length > 0) {
    const formData = new FormData();
    
    // ✅ Append multiple files
    files.forEach((file, index) => {
      formData.append('files', file); // Use 'files' as field name for all
    });
    
    formData.append('responseData', JSON.stringify(responseData));
    
    const response = await apiClient.put(
      `/setup/project-setup/${setupId}/tasks/${taskId}/complete`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }
  
  // Otherwise, send JSON
  const response = await apiClient.put(
    `/setup/project-setup/${setupId}/tasks/${taskId}/complete`,
    { responseData }
  );
  return response.data.data;
};

export const updateProjectSetupTaskData = async (
  setupId: string,
  taskId: string,
  responseData: any,
  files?: File[] // ✅ Changed from File to File[]
) => {
  // If there are files, use FormData
  if (files && files.length > 0) {
    const formData = new FormData();
    
    // ✅ Append multiple files
    files.forEach((file, index) => {
      formData.append('files', file); // Use 'files' as field name for all
    });
    
    formData.append('responseData', JSON.stringify(responseData));
    
    const response = await apiClient.patch(
      `/setup/project-setup/${setupId}/tasks/${taskId}/data`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }
  
  
  // Otherwise, send JSON
  const response = await apiClient.patch(
    `/setup/project-setup/${setupId}/tasks/${taskId}/data`,
    { responseData }
  );
  return response.data.data;
};

// lib/api/projectSetup.ts

export const removeProjectSetupTaskFile = async (
  setupId: string,
  taskId: string,
  filename: string
) => {
  // ✅ Encode the filename for URL safety
  const encodedFilename = encodeURIComponent(filename);
  
  const response = await apiClient.delete(
    `/setup/project-setup/${setupId}/tasks/${taskId}/files/${encodedFilename}`
  );
  return response.data.data;
};

