// lib/api/organization.ts
import axios from 'axios';
import { Organization, ApiResponse, PaginatedApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500/api/v1';

// Create an axios instance with authorization header
const apiClient = axios.create({
  baseURL: `${API_URL}/organizations`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interface for organization creation
export interface CreateOrganizationData {
  name: string;
  country: string;
  city: string;
}

/**
 * Get all organizations with pagination and filtering
 */
export const getOrganizations = async (
  page = 1,
  limit = 10,
  filters = {}
): Promise<PaginatedApiResponse<Organization>> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await apiClient.get(`?${queryParams}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch organizations');
    }
    throw new Error('Failed to fetch organizations. Please check your connection.');
  }
};

/**
 * Get a single organization by ID
 */
export const getOrganization = async (id: string): Promise<ApiResponse<Organization>> => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch organization');
    }
    throw new Error('Failed to fetch organization. Please check your connection.');
  }
};

/**
 * Create a new organization
 */
export const createOrganization = async (
  data: CreateOrganizationData
): Promise<ApiResponse<Organization>> => {
  try {
    const response = await apiClient.post('/', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to create organization');
    }
    throw new Error('Failed to create organization. Please check your connection.');
  }
};

/**
 * Update an organization
 */
export const updateOrganization = async (
  id: string,
  data: Partial<CreateOrganizationData>
): Promise<ApiResponse<Organization>> => {
  try {
    const response = await apiClient.put(`/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to update organization');
    }
    throw new Error('Failed to update organization. Please check your connection.');
  }
};

/**
 * Archive an organization (soft delete)
 */
export const archiveOrganization = async (id: string): Promise<ApiResponse<Organization>> => {
  try {
    const response = await apiClient.delete(`/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to archive organization');
    }
    throw new Error('Failed to archive organization. Please check your connection.');
  }
};

/**
 * Restore an archived organization
 */
export const restoreOrganization = async (id: string): Promise<ApiResponse<Organization>> => {
  try {
    const response = await apiClient.post(`/${id}/restore`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to restore organization');
    }
    throw new Error('Failed to restore organization. Please check your connection.');
  }
};

/**
 * Permanently delete an organization (admin only)
 */
export const deleteOrganization = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await apiClient.delete(`/${id}/permanent`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to delete organization');
    }
    throw new Error('Failed to delete organization. Please check your connection.');
  }
};


// In lib/api/organization.ts, add this function if it doesn't exist yet:

/**
 * Get organizations the current user has access to
 */
export const getMyOrganizations = async (): Promise<ApiResponse<Organization[]>> => {
  try {
    const response = await apiClient.get('/my-organizations');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch your organizations');
    }
    throw new Error('Failed to fetch your organizations. Please check your connection.');
  }
};