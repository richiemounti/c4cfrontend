// lib/api/client.ts - Enhanced with comprehensive 401 handling
import axios from 'axios';

// Get the base API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500/api/v1';

// Create the axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Track if we're currently logging out to prevent multiple redirects
let isLoggingOut = false;

// Add a request interceptor to add the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage (assuming it's stored there upon login)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401 && !isLoggingOut) {
      console.log('🔒 Token expired or invalid - logging out...');
      
      isLoggingOut = true;

      try {
        // Clear local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Clear cookies
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

          // Dispatch a custom event that AuthContext and StreamChatContext can listen to
          window.dispatchEvent(new CustomEvent('auth:logout', { 
            detail: { reason: 'token_expired' } 
          }));

          // Don't redirect if already on login page or on a public survey page
          const currentPath = window.location.pathname;
          const isPublicPath = currentPath.includes('/account/login') || currentPath.startsWith('/survey/');
          if (!isPublicPath) {
            window.location.href = '/account/login?expired=true';
          }
        }
      } finally {
        // Reset the flag after a short delay to allow redirect to complete
        setTimeout(() => {
          isLoggingOut = false;
        }, 1000);
      }
    }
    
    // Extract the error message from the response if available
    let errorMessage = 'An unexpected error occurred';
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || 
                    error.response.data.error || 
                    errorMessage;
    }
    
    // Create a new error with the extracted message
    const customError = new Error(errorMessage);
    
    // Add the original error response for debugging
    (customError as any).response = error.response;
    
    return Promise.reject(customError);
  }
);

// Function to reset logout state (useful for testing)
export const resetLogoutState = () => {
  isLoggingOut = false;
};