/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileApi, type ProfileUpdateData, type UserDetailCreateData } from '@/app/lib/api/profile';
import { apiClient } from '@/app/lib/api/client';
import type { User, UserDetail, UserProfileWithDetails } from '@/app/lib/types';

describe('profileApi', () => {
  let mockGet: ReturnType<typeof vi.fn>;
  let mockPost: ReturnType<typeof vi.fn>;
  let mockPatch: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGet = vi.fn();
    mockPost = vi.fn();
    mockPatch = vi.fn();
    mockDelete = vi.fn();
    
    (apiClient as any).get = mockGet;
    (apiClient as any).post = mockPost;
    (apiClient as any).patch = mockPatch;
    (apiClient as any).delete = mockDelete;
  });

  describe('getCurrentUser', () => {
    it('should fetch current user profile', async () => {
      const mockUser: User = {
        id: 1,
        name: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        role: 'admin',
        role_id: 1,
        permissions: ['read', 'write'],
      };

      mockGet.mockResolvedValue({
        data: mockUser,
        success: true,
      });

      const result = await profileApi.getCurrentUser();

      expect(mockGet).toHaveBeenCalledWith('/users/me');
      expect(result.data.email).toBe('test@example.com');
    });
  });

  describe('getUserDetails', () => {
    it('should fetch user additional details', async () => {
      const mockDetails: UserDetail[] = [
        { id: 1, user_id: 1, detail_type: 'bio', detail_value: 'Test bio' },
        { id: 2, user_id: 1, detail_type: 'github', detail_value: 'testuser' },
      ];

      mockGet.mockResolvedValue({
        data: mockDetails,
        success: true,
      });

      const result = await profileApi.getUserDetails(1);

      expect(mockGet).toHaveBeenCalledWith('/users/1/details');
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getCurrentUserWithDetails', () => {
    it('should fetch current user with all details', async () => {
      const mockUser: User = {
        id: 1,
        name: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        role: 'admin',
        role_id: 1,
        permissions: ['read'],
      };

      const mockDetails: UserDetail[] = [
        { id: 1, user_id: 1, detail_type: 'bio', detail_value: 'Test bio' },
      ];

      // First call returns user, second call returns details
      mockGet
        .mockResolvedValueOnce({ data: mockUser, success: true })
        .mockResolvedValueOnce({ data: mockDetails, success: true });

      const result = await profileApi.getCurrentUserWithDetails();

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(result.data.user.email).toBe('test@example.com');
      expect(result.data.details).toHaveLength(1);
    });

    it('should handle user fetch failure', async () => {
      // Return a response with null data to simulate fetch failure
      mockGet.mockResolvedValueOnce({ data: null, success: false });

      const result = await profileApi.getCurrentUserWithDetails();

      expect(result.success).toBe(false);
    });
  });

  describe('updateCurrentUser', () => {
    it('should update current user profile', async () => {
      const updateData: ProfileUpdateData = {
        name: 'Updated Name',
        phone_number: '1234567890',
      };

      const updatedUser: User = {
        id: 1,
        name: 'Updated Name',
        lastname: 'User',
        email: 'test@example.com',
        role: 'admin',
        role_id: 1,
        permissions: ['read'],
        phone_number: '1234567890',
      };

      mockPatch.mockResolvedValue({
        data: updatedUser,
        success: true,
      });

      const result = await profileApi.updateCurrentUser(updateData);

      expect(mockPatch).toHaveBeenCalledWith('/users/me', updateData);
      expect(result.data.name).toBe('Updated Name');
    });
  });

  describe('createUserDetail', () => {
    it('should create user additional detail', async () => {
      const newDetail: UserDetail = {
        id: 1,
        user_id: 1,
        detail_type: 'bio',
        detail_value: 'New bio',
      };

      mockPost.mockResolvedValue({
        data: newDetail,
        success: true,
      });

      const result = await profileApi.createUserDetail(1, 'bio', 'New bio');

      expect(mockPost).toHaveBeenCalledWith('/users/1/details', {
        user_id: 1,
        detail_type: 'bio',
        detail_value: 'New bio',
      });
      expect(result.data.detail_type).toBe('bio');
    });
  });

  describe('updateUserDetail', () => {
    it('should update user additional detail', async () => {
      const updatedDetail: UserDetail = {
        id: 1,
        user_id: 1,
        detail_type: 'bio',
        detail_value: 'Updated bio',
      };

      mockPatch.mockResolvedValue({
        data: updatedDetail,
        success: true,
      });

      const result = await profileApi.updateUserDetail(1, 1, 'Updated bio');

      expect(mockPatch).toHaveBeenCalledWith('/users/1/details/1', {
        detail_value: 'Updated bio',
      });
      expect(result.data.detail_value).toBe('Updated bio');
    });
  });

  describe('deleteUserDetail', () => {
    it('should delete user additional detail', async () => {
      mockDelete.mockResolvedValue({
        data: undefined,
        success: true,
      });

      const result = await profileApi.deleteUserDetail(1, 1);

      expect(mockDelete).toHaveBeenCalledWith('/users/1/details/1');
      expect(result.success).toBe(true);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      mockPatch.mockResolvedValue({
        data: undefined,
        success: true,
      });

      const result = await profileApi.changePassword(
        'test@example.com',
        'oldpassword',
        'newpassword'
      );

      expect(mockPatch).toHaveBeenCalledWith('/users/test%40example.com/password', {
        current_password: 'oldpassword',
        new_password: 'newpassword',
      });
      expect(result.success).toBe(true);
    });
  });
});