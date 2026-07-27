// lib/api/subscription.ts
import { apiClient } from './client';
import type { ApiResponse } from '@/types';
import type {
  CatalogueProduct,
  Subscription,
  ProjectCreationGate,
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  PortalSessionResponse,
} from '@/types/subscription';

export const getPricingCatalogue = async (): Promise<ApiResponse<CatalogueProduct[]>> => {
  try {
    const response = await apiClient.get('/subscriptions/catalogue');
    return response.data;
  } catch (error) {
    console.error('Error fetching pricing catalogue:', error);
    throw error;
  }
};

export const getOrganizationSubscription = async (
  organizationId: string
): Promise<ApiResponse<Subscription | null>> => {
  try {
    const response = await apiClient.get(`/organizations/${organizationId}/subscription`);
    return response.data;
  } catch (error) {
    console.error('Error fetching organization subscription:', error);
    throw error;
  }
};

export const getProjectCreationGate = async (
  organizationId: string
): Promise<ApiResponse<ProjectCreationGate>> => {
  try {
    const response = await apiClient.get(`/organizations/${organizationId}/subscription/project-gate`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project creation gate:', error);
    throw error;
  }
};

export const createCheckoutSession = async (
  organizationId: string,
  payload: CreateCheckoutSessionRequest
): Promise<ApiResponse<CheckoutSessionResponse>> => {
  try {
    const response = await apiClient.post(
      `/organizations/${organizationId}/subscription/checkout-session`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createPortalSession = async (
  organizationId: string
): Promise<ApiResponse<PortalSessionResponse>> => {
  try {
    const response = await apiClient.post(`/organizations/${organizationId}/subscription/portal-session`);
    return response.data;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};
