/**
 * Authentication API Service
 * Handles login, logout, and user authentication with the REST API
 */

import { apiClient, ApiResponse, ApiError } from './client';

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response from the API
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * User entity
 */
export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
}

/**
 * Auth service methods
 */
export const authService = {
  /**
   * Login with email and password
   * @param credentials - Login credentials (email, password)
   * @returns Login response with token and user data
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Try the standard token endpoint first
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      // Set the token in the client
      if (response.data.access_token) {
        apiClient.setToken(response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      // If the first attempt fails, try alternative endpoints
      const apiError = error as { message?: string; status?: number };
      if (apiError.status === 404) {
        // Try /auth/token endpoint (common in some Django REST frameworks)
        const altResponse = await apiClient.post<LoginResponse>('/auth/token', credentials);
        if (altResponse.data.access_token) {
          apiClient.setToken(altResponse.data.access_token);
        }
        return altResponse.data;
      }
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Continue with logout even if API call fails
    } finally {
      apiClient.setToken(null);
    }
  },

  /**
   * Get the current authenticated user
   * @returns User data if authenticated
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns true if user has a valid token
   */
  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  },

  /**
   * Refresh the authentication token
   * @param refreshToken - The refresh token
   * @returns New access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    if (response.data.access_token) {
      apiClient.setToken(response.data.access_token);
    }
    
    return response.data;
  },
};

export default authService;
