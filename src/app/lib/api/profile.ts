/**
 * Profile API Service
 * API functions for fetching user profile data
 */

import { apiClient, type ApiResponse } from './client';
import type { User, UserDetail, UserProfileWithDetails } from '../types';

/**
 * Profile API
 * Endpoints: /api/users/me, /api/users/{id}/details
 */
export const profileApi = {
  /**
   * Get current user profile
   * GET /api/users/me
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiClient.get<User>('/users/me');
  },

  /**
   * Get user additional details
   * GET /api/users/{id}/details
   */
  getUserDetails: async (id: number): Promise<ApiResponse<UserDetail[]>> => {
    return apiClient.get<UserDetail[]>(`/users/${id}/details`);
  },

  /**
   * Get current user profile with all details
   * Uses Promise.all for parallel fetching
   */
  getCurrentUserWithDetails: async (): Promise<ApiResponse<UserProfileWithDetails>> => {
    // First get the current user
    const userResponse = await apiClient.get<User>('/users/me');
    
    if (!userResponse.data) {
      return {
        data: { user: {} as User, details: [] },
        success: false,
        message: 'Failed to fetch user',
      };
    }

    // Then get the user details
    const detailsResponse = await apiClient.get<UserDetail[]>(`/users/${userResponse.data.id}/details`);

    // Combine the results
    const combined: UserProfileWithDetails = {
      user: userResponse.data,
      details: detailsResponse.data || [],
    };

    return {
      data: combined,
      success: true,
    };
  },
};

export default profileApi;
