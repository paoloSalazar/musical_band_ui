import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, API_BASE_URL, type ApiResponse, type ApiError } from '@/app/lib/api/client';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('api/client.ts - apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('apiClient instance', () => {
    it('should be defined', () => {
      expect(apiClient).toBeDefined();
    });
  });

  describe('setToken and getToken', () => {
    it('should set token and store in localStorage', () => {
      apiClient.setToken('new-token');
      expect(apiClient.getToken()).toBe('new-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
    });

    it('should remove token from localStorage when set to null', () => {
      apiClient.setToken('some-token');
      apiClient.setToken(null);
      expect(apiClient.getToken()).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('get method', () => {
    it('should make GET request to correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: 'test-data' }),
      });

      const result = await apiClient.get<{ data: string }>('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test',
        expect.objectContaining({ method: 'GET' })
      );
      // The client wraps response in { data: ... } so result.data is the unwrapped value
      expect(result.data).toEqual({ data: 'test-data' });
      expect(result.success).toBe(true);
    });

    it('should include auth token in headers', async () => {
      apiClient.setToken('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: {} }),
      });

      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalled();
      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1].headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer test-token');
    });
  });

  describe('post method', () => {
    it('should make POST request with body', async () => {
      const requestBody = { name: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: 'created' }),
      });

      const result = await apiClient.post<{ data: string }>('/test', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
      expect(result.data).toEqual({ data: 'created' });
    });

    it('should handle POST without body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: {} }),
      });

      await apiClient.post('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('put method', () => {
    it('should make PUT request with body', async () => {
      const requestBody = { name: 'updated' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: 'updated' }),
      });

      const result = await apiClient.put<{ data: string }>('/test/1', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestBody),
        })
      );
    });
  });

  describe('patch method', () => {
    it('should make PATCH request with body', async () => {
      const requestBody = { name: 'patched' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: 'patched' }),
      });

      const result = await apiClient.patch<{ data: string }>('/test/1', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(requestBody),
        })
      );
    });
  });

  describe('delete method', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => null },
      });

      const result = await apiClient.delete('/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ detail: 'Resource not found' }),
      });

      await expect(apiClient.get('/test')).rejects.toEqual(
        expect.objectContaining({
          message: 'Resource not found',
          status: 404,
        })
      );
    });

    it('should handle error without JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: { get: () => 'text/html' },
        json: () => Promise.reject(new Error('Not JSON')),
      });

      await expect(apiClient.get('/test')).rejects.toEqual(
        expect.objectContaining({
          message: 'Internal Server Error',
          status: 500,
        })
      );
    });

    it('should parse validation errors from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve({
            detail: 'Validation failed',
            errors: { email: ['Invalid email format'] },
          }),
      });

      try {
        await apiClient.post('/test', {});
      } catch (error) {
        expect(error).toEqual(
          expect.objectContaining({
            message: 'Validation failed',
            errors: { email: ['Invalid email format'] },
          })
        );
      }
    });
  });

  describe('handleResponse - edge cases', () => {
    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => null },
      });

      const result = await apiClient.delete('/test');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });

    it('should handle non-JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'text/html' },
        json: () => Promise.reject(new Error('Not JSON')),
      });

      const result = await apiClient.get('/test');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });

    it('should parse successful JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ user: 'test-user' }),
      });

      const result = await apiClient.get<{ user: string }>('/test');

      expect(result.data.user).toBe('test-user');
      expect(result.success).toBe(true);
    });
  });
});

describe('API_BASE_URL', () => {
  it('should export the API base URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });
});

describe('ApiResponse type', () => {
  it('should have correct structure', () => {
    const response: ApiResponse<string> = {
      data: 'test',
      success: true,
    };
    expect(response.data).toBe('test');
    expect(response.success).toBe(true);
  });

  it('should allow optional message', () => {
    const response: ApiResponse<string> = {
      data: 'test',
      success: true,
      message: 'Success',
    };
    expect(response.message).toBe('Success');
  });
});

describe('ApiError type', () => {
  it('should have correct structure', () => {
    const error: ApiError = {
      message: 'Error message',
      status: 400,
    };
    expect(error.message).toBe('Error message');
    expect(error.status).toBe(400);
  });

  it('should allow optional fields', () => {
    const error: ApiError = {
      message: 'Validation error',
      status: 422,
      detail: 'Field validation failed',
      errors: { name: ['Required'] },
    };
    expect(error.detail).toBe('Field validation failed');
    expect(error.errors).toEqual({ name: ['Required'] });
  });
});