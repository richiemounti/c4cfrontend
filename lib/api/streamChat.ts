// lib/api/streamChat.ts
import { apiClient } from './client';
import { ApiResponse } from '@/types';

/**
 * Stream Chat API Client
 * Handles all Stream Chat related API calls
 */

// ==========================================
// TYPES
// ==========================================

export interface StreamChatToken {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface StreamChatChannel {
  channelId: string;
  channelType: string;
  members: string[];
  createdAt: string;
}

export interface StreamChatUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

export interface CreateChannelRequest {
  channelId: string;
  channelType?: string;
  members: string[];
  channelData?: {
    name?: string;
    image?: string;
    reviewId?: string;
    [key: string]: any;
  };
}

export interface AddMembersRequest {
  members: string[];
}

export interface SendMessageRequest {
  text: string;
  attachments?: any[];
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Get Stream Chat token for current user
 */
export const getStreamChatToken = async () => {
  try {
    const response = await apiClient.get('/stream-chat/token');
    return response.data as ApiResponse<{
      token: string;
      apiKey: string;
      userId: string;
    }>;
  } catch (error) {
    console.error('Error getting Stream Chat token:', error);
    throw error;
  }
};

/**
 * Create a Stream Chat channel for a review (on-demand)
 * This matches your backend route: POST /stream-chat/reviews/:reviewId/channel
 */
export const createReviewChannelOnDemand = async (reviewId: string) => {
  try {
    const response = await apiClient.post(`/stream-chat/reviews/${reviewId}/channel`);
    return response.data as ApiResponse<{
      channelId: string;
      channelType: string;
      alreadyExisted: boolean;
    }>;
  } catch (error) {
    console.error('Error creating review channel:', error);
    throw error;
  }
};

/**
 * Get user's channels
 */
export const getMyStreamChannels = async (limit: number = 20) => {
  try {
    const response = await apiClient.get('/stream-chat/channels', {
      params: { limit }
    });
    return response.data as ApiResponse<{
      channels: any[];
    }>;
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
};

/**
 * Add member to review channel
 */
export const addMemberToReviewChannel = async (
  reviewId: string,
  userId: string
) => {
  try {
    const response = await apiClient.post(
      `/stream-chat/reviews/${reviewId}/members`,
      { userId }
    );
    return response.data as ApiResponse<{ message: string }>;
  } catch (error) {
    console.error('Error adding member to channel:', error);
    throw error;
  }
};

/**
 * Get Stream Chat status
 */
export const getStreamChatStatus = async () => {
  try {
    const response = await apiClient.get('/stream-chat/status');
    return response.data as ApiResponse<{
      configured: boolean;
      message: string;
    }>;
  } catch (error) {
    console.error('Error getting Stream Chat status:', error);
    throw error;
  }
};

// ==========================================
// HELPER FUNCTIONS (Updated)
// ==========================================

/**
 * Helper: Create review channel
 * Convenience function for creating a channel for a review
 */
export const createReviewChannel = async (
  reviewId: string,
  reviewTitle: string,
  members: string[]
) => {
  // This now calls the correct backend endpoint
  return createReviewChannelOnDemand(reviewId);
};

export default {
  getStreamChatToken,
  createReviewChannelOnDemand,
  getMyStreamChannels,
  addMemberToReviewChannel,
  getStreamChatStatus,
  // Helpers
  createReviewChannel,
};