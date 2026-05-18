// lib/utils/token.ts - Updated with proper TypeScript types
import { User } from '../api/auth';

/**
 * Set token in both localStorage (for client-side access) and cookies (for server-side access)
 * @param token JWT token
 * @param user User data
 */
export const setTokens = (token: string, user: User): void => {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage for client-side access
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Also set in cookies using JavaScript
  // Note: HttpOnly cookies can't be set via JavaScript, but we can set regular cookies
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // 7 days from now
  
  document.cookie = `token=${token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax;`;
  document.cookie = `user=${JSON.stringify(user)}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax;`;
};

/**
 * Remove tokens from both localStorage and cookies
 */
export const removeTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  // Clear from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear from cookies
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

/**
 * Get token from localStorage
 * @returns The token or null if not found
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Get user from localStorage
 * @returns The user object or null if not found
 */
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns true if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Parse cookies string and get a specific cookie value
 * @param cookies Cookies string
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
export const getCookieValue = (cookies: string, name: string): string | null => {
  const match = cookies.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
};