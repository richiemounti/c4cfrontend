// lib/api/auth.ts - Updated to preserve error properties
import { AxiosResponse } from 'axios';
import { apiClient } from './client';
import { setTokens, removeTokens, getToken, getUser, isAuthenticated as isAuthTokenPresent } from '@/lib/utils/token';

// Types
export interface Role {
  _id?: string;
  role: string;
  organization?: string;
  projects?: string[];
}

export interface User {
  _id: string;
  userName: string;
  name: string;
  email: string;
  photo: string;
  primaryRole?: string;
  roles?: Role[];
  isConnectGoStaff?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  userName: string;
  name: string;
  email: string;
  password: string;
  role?: string;
  organizationId?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// Helper function to preserve error properties
const createEnhancedError = (error: any, defaultMessage: string): Error => {
  const enhancedError = new Error(error.message || defaultMessage);
  (enhancedError as any).status = error.status || error.response?.status;
  (enhancedError as any).response = error.response;
  return enhancedError;
};

/**
 * Login a user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/sign-in', credentials);
    const data = response.data;
    
    // Store authentication data securely
    setTokens(data.data.token, data.data.user);
    
    return data;
  } catch (error: any) {
    throw createEnhancedError(error, 'Login failed');
  }
};

/**
 * Register a new user
 */
export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/sign-up', credentials);
    const data = response.data;
    
    // Store authentication data securely
    setTokens(data.data.token, data.data.user);
    
    return data;
  } catch (error: any) {
    throw createEnhancedError(error, 'Signup failed');
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response: AxiosResponse<{ success: boolean; message: string }> = await apiClient.post('/auth/sign-out');
    
    // Always clear tokens on logout
    removeTokens();
    
    return response.data;
  } catch (error) {
    // Even if the API call fails, we should clear local state
    removeTokens();
    
    console.error('Logout error:', error);
    
    // Return success true because we've cleared local storage
    return { success: true, message: 'Logged out locally' };
  }
};

/**
 * Store authentication data in localStorage and cookies
 */
export const storeAuthData = (data: AuthResponse['data']): void => {
  setTokens(data.token, data.user);
};

/**
 * Get the current authenticated user from localStorage (sync - for initial load)
 */
export const getCurrentUserFromStorage = (): User | null => {
  return getUser();
};


/**
 * Get and VALIDATE the current authenticated user from the API (async - for token validation)
 * This makes an API call to verify the token is still valid
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    console.log('📡 Fetching current user from API...');
    const response: AxiosResponse<{ success: boolean; data: { user: User } }> = await apiClient.get('/auth/me');
    console.log('✅ Current user fetched successfully');
    return response.data.data.user;
  } catch (error: any) {
    console.error('❌ Error fetching current user:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    
    // Preserve status code and other error properties
    throw createEnhancedError(error, 'Failed to get current user');
  }
};

/**
 * Check if a user is authenticated (checks if token exists, not if it's valid)
 */
export const isAuthenticated = (): boolean => {
  return isAuthTokenPresent();
};

/**
 * Request a password reset
 */
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response: AxiosResponse<{ success: boolean; message: string }> = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    throw createEnhancedError(error, 'Failed to send reset email');
  }
};

/**
 * Reset password using a token
 */
export const resetPassword = async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response: AxiosResponse<{ success: boolean; message: string }> = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  } catch (error: any) {
    throw createEnhancedError(error, 'Failed to reset password');
  }
};

/**
 * Verify a reset password token
 */
export const verifyResetToken = async (token: string): Promise<{ valid: boolean }> => {
  try {
    const response: AxiosResponse<{ valid: boolean }> = await apiClient.get(`/auth/verify-reset-token/${token}`);
    return { valid: true };
  } catch (error) {
    return { valid: false };
  }
};