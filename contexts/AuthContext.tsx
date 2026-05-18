// contexts/AuthContext.tsx - Enhanced version with EULA check
'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  login as loginApi, 
  signup as signupApi, 
  logout as logoutApi, 
  isAuthenticated as checkAuth,
  getCurrentUser,
  LoginCredentials,
  SignupCredentials,
  User
} from '@/lib/api/auth';
import { checkEulaStatus } from '@/lib/api/eula';
import { useRouter } from 'next/navigation';
import { getUser, removeTokens } from '@/lib/utils/token';

// Define Auth Context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  eulaStatus: any | null;
  eulaLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  refreshEulaStatus: () => Promise<void>;
  checkEulaAndRedirect: () => Promise<boolean>;
}

// Create Auth Context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  eulaStatus: null,
  eulaLoading: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  setUser: () => {},
  clearError: () => {},
  refreshEulaStatus: async () => {},
  checkEulaAndRedirect: async () => false
});

// Custom hook for using Auth Context
export const useAuth = () => useContext(AuthContext);

// Auth Context Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [eulaStatus, setEulaStatus] = useState<any | null>(null);
  const [eulaLoading, setEulaLoading] = useState<boolean>(false);
  const router = useRouter();

  // Function to check EULA status
  const refreshEulaStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      setEulaLoading(true);
      const status = await checkEulaStatus();
      setEulaStatus(status);
    } catch (err) {
      console.error('Error checking EULA status:', err);
      setEulaStatus(null);
    } finally {
      setEulaLoading(false);
    }
  };

  // Function to check EULA and redirect if needed
  const checkEulaAndRedirect = async (): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

    try {
      setEulaLoading(true);
      const status = await checkEulaStatus();
      setEulaStatus(status);

      if (status.requiresSignature) {
        router.push('/terms');
        return false; // Indicate that redirect happened
      }
      
      return true; // User has signed EULA, can proceed
    } catch (err) {
      console.error('Error checking EULA status:', err);
      return true; // Allow access if check fails
    } finally {
      setEulaLoading(false);
    }
  };

  // Check authentication status on initial load
  // contexts/AuthContext.tsx - UPDATED checkAuthStatus

  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const isLoggedIn = checkAuth();
        
        if (isLoggedIn) {
          try {
            // Try to validate the token with the server
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
            console.log('✅ User authenticated successfully');
          } catch (userError: any) {
            console.error('❌ Token validation failed:', userError);
            
            // CRITICAL: Only clear tokens and redirect on 401 (Unauthorized)
            // 401 means the token is expired or invalid
            const status = userError.status || userError.response?.status;
            
            if (status === 401) {
              console.log('🔒 Token expired or invalid (401) - logging out');
              // Token is definitely invalid/expired - clear everything
              removeTokens();
              setUser(null);
              setIsAuthenticated(false);
              
              // Only redirect if we're not already on a public page
              const publicPaths = ['/account/login', '/account/signup', '/terms', '/survey/'];
              const currentPath = window.location.pathname;
              
              if (!publicPaths.some(path => currentPath.startsWith(path))) {
                console.log('🔄 Redirecting to login...');
                router.push('/account/login');
              }
            } else {
              // Network error, server error (500), or other issue
              // Keep user logged in with cached data
              console.log(`⚠️ Non-auth error (${status || 'unknown'}) - keeping user logged in with cached data`);
              const cachedUser = getUser();
              if (cachedUser) {
                setUser(cachedUser);
                setIsAuthenticated(true);
                console.log('✅ Using cached user data during temporary error');
              } else {
                // No cached user data available
                console.log('❌ No cached user data - logging out');
                removeTokens();
                setUser(null);
                setIsAuthenticated(false);
              }
            }
          }
        } else {
          console.log('🔍 No token found in storage');
          // Cookie fallback logic
          const cookies = document.cookie.split('; ');
          const userCookie = cookies.find(cookie => cookie.startsWith('user='));
          const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
            
          if (userCookie && tokenCookie) {
            try {
              const userValue = decodeURIComponent(userCookie.split('=')[1]);
              const cookieUser = JSON.parse(userValue);
              
              // Try to validate this token too
              try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                setIsAuthenticated(true);
                console.log('✅ User authenticated via cookie');
              } catch (validationError: any) {
                const status = validationError.status || validationError.response?.status;
                
                if (status === 401) {
                  console.log('🔒 Cookie token expired (401) - logging out');
                  removeTokens();
                  setUser(null);
                  setIsAuthenticated(false);
                } else {
                  // Use cached data on non-auth errors
                  console.log(`⚠️ Error validating cookie token (${status}) - using cached data`);
                  setUser(cookieUser);
                  setIsAuthenticated(true);
                }
              }
            } catch (err) {
              console.error('Error parsing user cookie:', err);
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Auth status check error:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check EULA status when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      refreshEulaStatus();
    }
  }, [isAuthenticated, user, loading]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginApi(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      // After successful login, check EULA status
      // Don't redirect here - let the dashboard handle it
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await signupApi(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      // After signup, always redirect to terms
      setTimeout(() => {
        router.push('/terms');
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await logoutApi();
      setUser(null);
      setIsAuthenticated(false);
      setEulaStatus(null);
      router.push('/account/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    error,
    eulaStatus,
    eulaLoading,
    login,
    signup,
    logout,
    setUser: updateUser,
    clearError,
    refreshEulaStatus,
    checkEulaAndRedirect
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};