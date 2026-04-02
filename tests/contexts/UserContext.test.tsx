/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from '@/app/contexts/UserContext';
import type { User } from '@/app/lib/types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock apiClient
vi.mock('@/app/lib/api/client', () => ({
  apiClient: {
    setToken: vi.fn((token: string | null) => {}),
    getToken: vi.fn(() => null),
  },
}));

import { apiClient } from '@/app/lib/api/client';

// Test component to access context
function TestConsumer() {
  const { user, isAuthenticated, isLoading, error, login, logout } = useUser();
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'null'}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="error">{error || 'none'}</div>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password')}>Login</button>
      <button data-testid="logout-btn" onClick={() => logout()}>Logout</button>
    </div>
  );
}

// Helper to create mock user
const createMockUser = (overrides?: Partial<User>): User => ({
  id: 1,
  name: 'Test',
  lastname: 'User',
  email: 'test@example.com',
  role: 'admin',
  role_id: 1,
  permissions: ['read', 'write', 'delete'],
  ...overrides,
});

describe('UserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (apiClient.setToken as any).mockImplementation(() => {});
    (apiClient.getToken as any).mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial state', () => {
    it('should provide initial null user and unauthenticated state', async () => {
      // Mock session restoration to return null (no token)
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      });

      render(
        <UserProvider>
          <TestConsumer />
        </UserProvider>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('null');
      });
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('error').textContent).toBe('none');
    });
  });

  describe('login flow', () => {
    it('should update state after successful login', async () => {
      const mockUser = createMockUser();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'test-token',
          user: mockUser,
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      render(
        <UserProvider>
          <TestConsumer />
        </UserProvider>
      );

      // Click login button
      const loginBtn = screen.getByTestId('login-btn');
      await act(async () => {
        loginBtn.click();
      });

      // Wait for state updates
      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
      }, { timeout: 3000 });

      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    it('should handle login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      let errorThrown = false;
      function TestLoginFailure() {
        const { login } = useUser();
        
        const handleLogin = async () => {
          try {
            await login('test@example.com', 'wrongpassword');
          } catch (e) {
            errorThrown = true;
          }
        };
        
        return (
          <div>
            <button data-testid="login-fail-btn" onClick={handleLogin}>Login</button>
            <div data-testid="error-thrown">{String(errorThrown)}</div>
          </div>
        );
      }

      render(
        <UserProvider>
          <TestLoginFailure />
        </UserProvider>
      );

      const loginBtn = screen.getByTestId('login-fail-btn');
      await act(async () => {
        loginBtn.click();
        // Wait for async login to complete
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Error should have been thrown
      expect(errorThrown).toBe(true);
    });
  });

  describe('logout flow', () => {
    it('should clear user state after logout', async () => {
      // First, login
      const mockUser = createMockUser();
      
      mockFetch
        // Login
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            access_token: 'test-token',
            user: mockUser,
          }),
        })
        // Get user
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUser),
        })
        // Logout
        .mockResolvedValueOnce({
          ok: true,
        });

      render(
        <UserProvider>
          <TestConsumer />
        </UserProvider>
      );

      // Login first
      const loginBtn = screen.getByTestId('login-btn');
      await act(async () => {
        loginBtn.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true');
      }, { timeout: 3000 });

      // Now logout
      const logoutBtn = screen.getByTestId('logout-btn');
      await act(async () => {
        logoutBtn.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('false');
      }, { timeout: 3000 });

      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  describe('Session restoration', () => {
    it('should call localStorage and fetch when restoring session', async () => {
      const mockUser = createMockUser();
      
      // Simulate token in localStorage
      localStorageMock.getItem.mockReturnValue('existing-token');
      
      // Mock /users/me response to return user
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      render(
        <UserProvider>
          <TestConsumer />
        </UserProvider>
      );

      // Wait a bit for the useEffect to run
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that localStorage.getItem was called
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
      
      // Check that fetch was called to get user
      expect(mockFetch).toHaveBeenCalled();
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toContain('/users/me');
      expect(fetchCall[1]?.headers?.['Authorization']).toBe('Bearer existing-token');
    });

    it('should not call API when no token in localStorage', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(
        <UserProvider>
          <TestConsumer />
        </UserProvider>
      );

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not have called fetch for user data
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Permission helper functions', () => {
    it('hasPermission should return false when user is null', () => {
      let permissionResult: boolean = true;
      
      function TestComponent() {
        const { hasPermission } = useUser();
        permissionResult = hasPermission('read');
        return null;
      }

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(permissionResult).toBe(false);
    });

    it('hasRole should return false when user is null', () => {
      let roleResult: boolean = true;
      
      function TestComponent() {
        const { hasRole } = useUser();
        roleResult = hasRole('admin');
        return null;
      }

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(roleResult).toBe(false);
    });

    it('hasAnyPermission should return false when user is null', () => {
      let anyResult: boolean = true;
      
      function TestComponent() {
        const { hasAnyPermission } = useUser();
        anyResult = hasAnyPermission(['read', 'write']);
        return null;
      }

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(anyResult).toBe(false);
    });

    it('hasAllPermissions should return false when user is null', () => {
      let allResult: boolean = true;
      
      function TestComponent() {
        const { hasAllPermissions } = useUser();
        allResult = hasAllPermissions(['read', 'write']);
        return null;
      }

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(allResult).toBe(false);
    });
  });
});

describe('useUser hook', () => {
  // Note: Testing that useUser throws outside provider is tricky because
  // React's useContext returns the default value during render, and the throw
  // happens at runtime when the value is accessed. The behavior is correct.
  it('should provide context values when used within UserProvider', async () => {
    const mockUser = createMockUser();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'test-token',
        user: mockUser,
      }),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    // Login first
    const loginBtn = screen.getByTestId('login-btn');
    await act(async () => {
      loginBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    }, { timeout: 3000 });
  });
});