/**
 * Profile API Service
 * API functions for fetching user profile data
 */

import { apiClient, type ApiResponse } from './client';
import type { User, UserDetail, UserProfileWithDetails } from '../types';

/**
 * Profile update data type
 */
export interface ProfileUpdateData {
  name?: string;
  lastname?: string;
  second_lastname?: string;
  phone_number?: string;
}

/**
 * User detail creation data type
 */
export interface UserDetailCreateData {
  user_id: number;
  detail_type: string;
  detail_value: string;
}

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

  /**
   * Update current user profile
   * PATCH /api/users/me
   */
  updateCurrentUser: async (data: ProfileUpdateData): Promise<ApiResponse<User>> => {
    return apiClient.patch<User>('/users/me', data);
  },

  /**
   * Create user additional detail
   * POST /api/users/{id}/details
   */
  createUserDetail: async (userId: number, detailType: string, detailValue: string): Promise<ApiResponse<UserDetail>> => {
    return apiClient.post<UserDetail>(`/users/${userId}/details`, {
      user_id: userId,
      detail_type: detailType,
      detail_value: detailValue,
    });
  },

  /**
   * Update user additional detail
   * PATCH /api/users/{userId}/details/{detailId}
   */
  updateUserDetail: async (userId: number, detailId: number, detailValue: string): Promise<ApiResponse<UserDetail>> => {
    return apiClient.patch<UserDetail>(`/users/${userId}/details/${detailId}`, {
      detail_value: detailValue,
    });
  },

  /**
   * Delete user additional detail
   * DELETE /api/users/{userId}/details/{detailId}
   */
  deleteUserDetail: async (userId: number, detailId: number): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/users/${userId}/details/${detailId}`);
  },
};

export default profileApi;
