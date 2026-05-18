// lib/api/user.ts - Improved version with consistent error handling
import axios, { AxiosResponse } from 'axios';

import { apiClient } from './client';
import { User, ApiResponse, PaginatedApiResponse, Role, RoleType } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500/api/v1';

// Interface for user creation/update
export interface UserData {
  name: string;
  userName: string;
  email: string;
  password?: string;
  role?: string;
  organizationId?: string;
}

// Interface for role assignment
export interface RoleData {
  role: string;          // role name
  organizationId?: string; // backend expects organizationId, not organization
  projectIds?: string[];   // backend expects projectIds, not projects
}

// Interface for user invitation
export interface InvitationData {
  email: string;
  role: string;
  organizationId: string;
  projectIds?: string[];
}

// Interface for accepting invitation
export interface AcceptInvitationData {
  token: string;
  userName: string;
  name: string;
  password: string;
}

// Interface for invitation verification response
export interface InvitationVerificationResponse {
  success: boolean;
  message: string;
  valid: boolean;
  data?: {
    email: string;
    role: string;
    organization: any;
    projects: any[];
    invitedBy: any;
    expiresAt: string;
  };
}

/**
 * Get all users with pagination and filtering
 */
export const getUsers = async (
  page = 1,
  limit = 10,
  filters = {}
): Promise<PaginatedApiResponse<User>> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await apiClient.get(`/users?${queryParams}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch users');
  }
};

/**
 * Get a single user by ID
 */
export const getUser = async (id: string): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch user');
  }
};

/**
 * Create a new user
 */
export const createUser = async (
  data: UserData
): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.post('/users', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create user');
  }
};

/**
 * Update a user
 */
export const updateUser = async (
  id: string,
  data: Partial<UserData>
): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update user');
  }
};

/**
 * Delete (archive) a user
 */
export const archiveUser = async (id: string): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to archive user');
  }
};

/**
 * Get a user's roles
 */
export const getUserRoles = async (userId: string): Promise<ApiResponse<{
  roles: Role[];
  primaryRole: string;
  isConnectGoStaff: boolean;
}>> => {
  try {
    const response = await apiClient.get(`/users/${userId}/roles`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch user roles');
  }
};

/**
 * Assign a role to a user
 */
export const assignRole = async (
  userId: string, 
  data: RoleData
): Promise<ApiResponse<{
  userId: string;
  roles: any[];
  primaryRole: string;
}>> => {
  try {
    const response = await apiClient.post(`/users/${userId}/roles`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to assign role');
  }
};

/**
 * Remove a role from a user
 */
export const removeRole = async (userId: string, roleId: string): Promise<ApiResponse<{
  userId: string;
  roles: any[];
  primaryRole: string;
}>> => {
  try {
    const response = await apiClient.delete(`/users/${userId}/roles/${roleId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to remove role');
  }
};

/**
 * Set a user's primary role
 */
export const setPrimaryRole = async (
  userId: string, 
  roleId: string
): Promise<ApiResponse<{
  userId: string;
  primaryRole: string;
}>> => {
  try {
    const response = await apiClient.put(`/users/${userId}/roles/primary`, { roleId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to set primary role');
  }
};

/**
 * Invite user to organization (Manager only)
 */
export const inviteUser = async (data: InvitationData): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.post('/users/invite', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send invitation');
  }
};

/**
 * Verify invitation token (Public - no auth required)
 * Uses raw axios intentionally to bypass auth interceptor
 */
export const verifyInvitation = async (token: string): Promise<InvitationVerificationResponse> => {
  try {
    const response = await axios.get(`${API_URL}/users/verify-invitation/${token}`);
    return response.data;
  } catch (error: any) {
    // Extract error message consistently
    const message = error.response?.data?.error || 
                   error.response?.data?.message || 
                   'Invalid invitation token';
    throw new Error(message);
  }
};

/**
 * Accept invitation and set up account (Public - no auth required)
 * Uses raw axios intentionally to bypass auth interceptor
 */
export const acceptInvitation = async (data: AcceptInvitationData): Promise<ApiResponse<User>> => {
  try {
    const response = await axios.post(`${API_URL}/users/accept-invitation`, data);
    return response.data;
  } catch (error: any) {
    // Extract error message consistently
    const message = error.response?.data?.error || 
                   error.response?.data?.message || 
                   'Failed to accept invitation';
    throw new Error(message);
  }
};

/**
 * Get organization users (Manager only)
 */
export const getOrganizationUsers = async (organizationId: string): Promise<ApiResponse<User[]>> => {
  try {
    const response = await apiClient.get(`/users/organization/${organizationId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get organization users');
  }
};

/**
 * Revoke invitation (Manager only)
 */
export const revokeInvitation = async (userId: string): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.delete(`/users/invitation/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to revoke invitation');
  }
};

/**
 * Resend invitation (Manager only)
 */
export const resendInvitation = async (userId: string): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.post(`/users/resend-invitation/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to resend invitation');
  }
};

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  archiveUser,
  getUserRoles,
  assignRole,
  removeRole,
  setPrimaryRole,
  inviteUser,
  verifyInvitation,
  acceptInvitation,
  getOrganizationUsers,
  revokeInvitation,
  resendInvitation
};