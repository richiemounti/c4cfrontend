// lib/api/eula.ts
import axios from 'axios';
import { getToken } from '@/lib/utils/token';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500/api/v1';

// Types
export interface EulaSignatureData {
  fullName: string;
  email: string;
  position?: string;
  organization?: string;
  acceptedTerms: boolean;
}

export interface EulaStatus {
  hasSignedCurrent: boolean;
  currentVersion: string;
  latestSignature?: {
    version: string;
    signedAt: string;
    isActive: boolean;
  } | null;
  requiresSignature: boolean;
}

export interface EulaContent {
  version: string;
  title: string;
  lastUpdated: string;
  contentUrl: string;
  summary: string;
}

export interface SignatureHistory {
  _id: string;
  eulaVersion: string;
  signedAt: string;
  signatureData: {
    fullName: string;
    email: string;
    position?: string;
    organization?: string;
  };
  isActive: boolean;
  revokedAt?: string;
  revokedReason?: string;
}

// Create axios instance with defaults
const eulaApi = axios.create({
  baseURL: `${API_URL}/eula`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
eulaApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

/**
 * Check user's EULA status
 */
export const checkEulaStatus = async (): Promise<EulaStatus> => {
  try {
    const response = await eulaApi.get('/check');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to check EULA status');
    }
    throw new Error('Failed to check EULA status. Please check your connection.');
  }
};

/**
 * Sign the EULA
 */
export const signEula = async (signatureData: EulaSignatureData): Promise<any> => {
  try {
    const response = await eulaApi.post('/sign', signatureData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to sign EULA');
    }
    throw new Error('Failed to sign EULA. Please check your connection.');
  }
};

/**
 * Get EULA content and information
 */
export const getEulaContent = async (): Promise<EulaContent> => {
  try {
    const response = await eulaApi.get('/content');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch EULA content');
    }
    throw new Error('Failed to fetch EULA content. Please check your connection.');
  }
};

/**
 * Get user's signature history
 */
export const getSignatureHistory = async (): Promise<SignatureHistory[]> => {
  try {
    const response = await eulaApi.get('/history');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch signature history');
    }
    throw new Error('Failed to fetch signature history. Please check your connection.');
  }
};

/**
 * Admin: Get all signatures with pagination
 */
export const getAllSignatures = async (params?: {
  page?: number;
  limit?: number;
  version?: string;
  isActive?: boolean;
}) => {
  try {
    const response = await eulaApi.get('/admin/signatures', { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch signatures');
    }
    throw new Error('Failed to fetch signatures. Please check your connection.');
  }
};

/**
 * Admin: Revoke a signature
 */
export const revokeSignature = async (signatureId: string, reason?: string) => {
  try {
    const response = await eulaApi.put(`/admin/signatures/${signatureId}/revoke`, { reason });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to revoke signature');
    }
    throw new Error('Failed to revoke signature. Please check your connection.');
  }
};

/**
 * Admin: Get signature statistics
 */
export const getSignatureStatistics = async () => {
  try {
    const response = await eulaApi.get('/admin/statistics');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch statistics');
    }
    throw new Error('Failed to fetch statistics. Please check your connection.');
  }
};  