/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the apiClient before importing anything that uses it
vi.mock('@/app/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { authService, type LoginRequest, type User } from '@/app/lib/api/auth';
import { apiClient } from '@/app/lib/api/client';

describe('authService', () => {
  let mockPost: ReturnType<typeof vi.fn>;
  let mockGet: ReturnType<typeof vi.fn>;
  let mockSetToken: ReturnType<typeof vi.fn>;
  let mockGetToken: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mocks for apiClient methods
    mockPost = vi.fn();
    mockGet = vi.fn();
    mockSetToken = vi.fn();
    mockGetToken = vi.fn();
    
    // Assign mocks to apiClient
    (apiClient as any).post = mockPost;
    (apiClient as any).get = mockGet;
    (apiClient as any).setToken = mockSetToken;
    (apiClient as any).getToken = mockGetToken;
  });

  describe('login', () => {
    it('should call /users/login endpoint and return login response', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          token_type: 'Bearer',
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
          } as User,
        },
        success: true,
        message: 'Login successful',
      };

      mockPost.mockResolvedValue(mockResponse);

      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(credentials);

      expect(mockPost).toHaveBeenCalledWith('/users/login', credentials);
      expect(mockSetToken).toHaveBeenCalledWith('test-token');
      expect(result.access_token).toBe('test-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should try alternative /auth/token endpoint on 404', async () => {
      const mockFirstError = { message: 'Not found', status: 404 };
      const mockAltResponse = {
        data: {
          access_token: 'alt-token',
          token_type: 'Bearer',
          user: {
            id: 2,
            email: 'alt@example.com',
            name: 'Alt User',
          } as User,
        },
        success: true,
      };

      mockPost
        .mockRejectedValueOnce(mockFirstError)
        .mockResolvedValueOnce(mockAltResponse);

      const credentials: LoginRequest = {
        email: 'alt@example.com',
        password: 'password',
      };

      const result = await authService.login(credentials);

      expect(mockPost).toHaveBeenCalledTimes(2);
      expect(mockPost).toHaveBeenNthCalledWith(1, '/users/login', credentials);
      expect(mockPost).toHaveBeenNthCalledWith(2, '/auth/token', credentials);
      expect(result.access_token).toBe('alt-token');
    });
  });

  describe('logout', () => {
    it('should call /auth/logout and clear token', async () => {
      mockPost.mockResolvedValue({ success: true });

      await authService.logout();

      expect(mockPost).toHaveBeenCalledWith('/auth/logout');
      expect(mockSetToken).toHaveBeenCalledWith(null);
    });

    it('should clear token even if logout API fails', async () => {
      mockPost.mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(mockSetToken).toHaveBeenCalledWith(null);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when authenticated', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      };

      mockGet.mockResolvedValue({
        data: mockUser,
        success: true,
      });

      const result = await authService.getCurrentUser();

      expect(mockGet).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should return null when not authenticated', async () => {
      mockGet.mockRejectedValue(new Error('Unauthorized'));

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      mockGetToken.mockReturnValue('some-token');

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token', () => {
      mockGetToken.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should call /auth/refresh and update token', async () => {
      mockPost.mockResolvedValue({
        data: {
          access_token: 'new-token',
          token_type: 'Bearer',
        },
        success: true,
      });

      const result = await authService.refreshToken('refresh-token');

      expect(mockPost).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: 'refresh-token',
      });
      expect(mockSetToken).toHaveBeenCalledWith('new-token');
      expect(result.access_token).toBe('new-token');
    });
  });
});