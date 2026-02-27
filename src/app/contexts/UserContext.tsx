/**
 * User Context
 * Provides user authentication state and permission utilities throughout the app
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { User, UserContextType } from '../lib/types';
import { apiClient } from '../lib/api/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const initialState: UserContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
};

const UserContext = createContext<UserContextType>(initialState);

interface UserProviderProps {
  children: ReactNode;
}

/**
 * UserProvider component
 * Wraps the application to provide user context
 */
export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user || !user.permissions) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role: string): boolean => {
      if (!user || !user.role) return false;
      return user.role === role;
    },
    [user]
  );

  /**
   * Check if user has any of the specified permissions (OR logic)
   */
  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!user || !user.permissions) return false;
      return permissions.some((permission) => user.permissions.includes(permission));
    },
    [user]
  );

  /**
   * Check if user has all of the specified permissions (AND logic)
   */
  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (!user || !user.permissions) return false;
      return permissions.every((permission) => user.permissions.includes(permission));
    },
    [user]
  );

  /**
   * Login user
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Set token
      if (data.access_token) {
        apiClient.setToken(data.access_token);
        localStorage.setItem('auth_token', data.access_token);
      }

      // Fetch full user data with permissions
      const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      } else {
        // Fallback to user data from login response
        setUser(data.user);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      const token = apiClient.getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Continue with logout even if API call fails
    } finally {
      apiClient.setToken(null);
      localStorage.removeItem('auth_token');
      setUser(null);
      setError(null);
    }
  }, []);

  /**
   * Try to restore session from localStorage
   */
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          apiClient.setToken(token);
        } else {
          // Token invalid, clear it
          localStorage.removeItem('auth_token');
        }
      } catch {
        // Failed to restore session
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const value: UserContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook to access user context
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
