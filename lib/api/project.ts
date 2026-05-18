// lib/api/project.ts - Updated to use shared client
import { apiClient } from './client'; // Use shared client with interceptors
import { Project, ProjectSite, ApiResponse, PaginatedApiResponse } from '@/types';

// Interface for project contact
export interface ProjectContact {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

// Interface for project creation
export interface CreateProjectData {
  name: string;
  description?: string;
  logo?: string;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  contacts?: ProjectContact[];
  startDate: Date;
  endDate?: Date;
  status: string;
  organization: string;
}

// Interface for project site creation
export interface CreateProjectSiteData {
  name: string;
  description?: string;
  address?: string;
  region?: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  size?: number;
  sizeUnit?: 'hectares' | 'sqkm' | 'acres' | 'sqmi';
  siteType?: 'forest' | 'wetland' | 'grassland' | 'coastal' | 'agricultural' | 'urban' | 'other';
  status?: 'active' | 'inactive' | 'planned';
  contacts?: ProjectContact[];
  notes?: string;
  startDate?: Date;
}

/**
 * Get all projects with pagination and filtering
 */
export const getProjects = async (
  page = 1,
  limit = 10,
  filters = {}
): Promise<PaginatedApiResponse<Project>> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await apiClient.get(`/projects?${queryParams}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch projects');
  }
};

/**
 * Get projects for a specific organization
 */
export const getOrganizationProjects = async (
  organizationId: string,
  page = 1,
  limit = 10
): Promise<PaginatedApiResponse<Project>> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get(`/organizations/${organizationId}/projects?${queryParams}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch organization projects');
  }
};

/**
 * Get a single project by ID
 */
export const getProject = async (id: string): Promise<ApiResponse<Project>> => {
  try {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch project');
  }
};

/**
 * Create a new project
 */
export const createProject = async (
  data: CreateProjectData
): Promise<ApiResponse<Project>> => {
  try {
    const response = await apiClient.post('/projects', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create project');
  }
};

/**
 * Update a project
 */
export const updateProject = async (
  id: string,
  data: Partial<CreateProjectData>
): Promise<ApiResponse<Project>> => {
  try {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update project');
  }
};

/**
 * Archive a project (soft delete)
 */
export const archiveProject = async (id: string): Promise<ApiResponse<Project>> => {
  try {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to archive project');
  }
};

/**
 * Restore an archived project
 */
export const restoreProject = async (id: string): Promise<ApiResponse<Project>> => {
  try {
    const response = await apiClient.post(`/projects/${id}/restore`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to restore project');
  }
};

/**
 * Permanently delete a project (admin only)
 */
export const deleteProject = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await apiClient.delete(`/projects/${id}/permanent`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete project');
  }
};

// Project Sites API functions

/**
 * Get all sites for a project
 */
export const getProjectSites = async (
  projectId: string,
  page = 1,
  limit = 10
): Promise<PaginatedApiResponse<ProjectSite>> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get(`/projects/${projectId}/sites?${queryParams}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch project sites');
  }
};

/**
 * Get a single project site by ID
 */
export const getProjectSite = async (id: string): Promise<ApiResponse<ProjectSite>> => {
  try {
    const response = await apiClient.get(`/project-sites/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch project site');
  }
};

/**
 * Create a new project site
 */
export const createProjectSite = async (
  projectId: string,
  data: CreateProjectSiteData
): Promise<ApiResponse<ProjectSite>> => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/sites`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create project site');
  }
};

/**
 * Update a project site
 */
export const updateProjectSite = async (
  id: string,
  data: Partial<CreateProjectSiteData>
): Promise<ApiResponse<ProjectSite>> => {
  try {
    const response = await apiClient.put(`/project-sites/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update project site');
  }
};

/**
 * Archive a project site (soft delete)
 */
export const archiveProjectSite = async (id: string): Promise<ApiResponse<ProjectSite>> => {
  try {
    const response = await apiClient.delete(`/project-sites/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to archive project site');
  }
};

/**
 * Restore an archived project site
 */
export const restoreProjectSite = async (id: string): Promise<ApiResponse<ProjectSite>> => {
  try {
    const response = await apiClient.post(`/project-sites/${id}/restore`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to restore project site');
  }
};