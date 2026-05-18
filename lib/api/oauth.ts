// lib/api/oauth.ts
import axios, { AxiosResponse } from 'axios';
import { AuthResponse, User } from './auth';
import { setTokens } from '@/lib/utils/token';

// Environment variable with type safety
const API_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500/api/v1';
const FRONTEND_URL: string = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

// Type for OAuth provider
type OAuthProvider = 'google' | 'microsoft';

// Interface for OAuth callback response
interface OAuthCallbackResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

/**
 * Initiates Google OAuth flow
 */
export const initiateGoogleLogin = (): void => {
  const callbackUrl = `${FRONTEND_URL}/api/auth/callback`;
  
  // Redirect to backend OAuth endpoint with frontend callback encoded in state
  const googleAuthUrl = new URL(`${API_URL}/auth/google`);
  googleAuthUrl.searchParams.append('redirect_uri', `${API_URL}/auth/google/callback`);
  googleAuthUrl.searchParams.append('state', btoa(callbackUrl));
  
  // Redirect to Google authorization
  window.location.href = googleAuthUrl.toString();
};

/**
 * Initiates Microsoft OAuth flow
 */
export const initiateMicrosoftLogin = (): void => {
  const callbackUrl = `${FRONTEND_URL}/api/auth/callback`;
  
  // Redirect to backend OAuth endpoint with frontend callback encoded in state
  const microsoftAuthUrl = new URL(`${API_URL}/auth/microsoft`);
  microsoftAuthUrl.searchParams.append('redirect_uri', `${API_URL}/auth/microsoft/callback`);
  microsoftAuthUrl.searchParams.append('state', btoa(callbackUrl));
  
  // Redirect to Microsoft authorization
  window.location.href = microsoftAuthUrl.toString();
};

/**
 * Process OAuth callback with token and user data from URL
 * @param token The JWT token
 * @param userData The user data as a string
 * @returns Promise resolving to authentication data
 */
export const processOAuthCallback = (
  token: string,
  userData: string
): AuthResponse => {
  try {
    // Parse user data
    const user = JSON.parse(userData);
    
    // Store authentication data securely
    setTokens(token, user);
    
    return {
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user
      }
    };
  } catch (error) {
    throw new Error('Failed to process authentication data');
  }
};