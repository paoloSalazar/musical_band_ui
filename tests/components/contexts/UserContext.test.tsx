import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from '../../../src/app/contexts/UserContext';
import { ReactNode } from 'react';

const mockUserData = {
  id: 1,
  name: 'John',
  lastname: 'Doe',
  second_lastname: 'Smith',
  email: 'john.doe@example.com',
  role: 'admin',
  role_id: 1,
  permissions: [
    'read:user_roles',
    'write:user_roles',
    'delete:user_roles',
    'read:users',
    'write:users',
    'delete:users',
    'read:events',
  ],
};

describe('UserContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <UserProvider>{children}</UserProvider>
  );

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should have null user initially', () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it('should set user after login', async () => {
    const mockLoginResponse = {
      access_token: 'mock-token',
      user: mockUserData,
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse),
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUserData);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should check hasPermission correctly', async () => {
    const mockLoginResponse = {
      access_token: 'mock-token',
      user: mockUserData,
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse),
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.hasPermission('read:users')).toBe(true);
      expect(result.current.hasPermission('delete:users')).toBe(true);
    });
  });

  it('should return false for missing permission', async () => {
    const mockLoginResponse = {
      access_token: 'mock-token',
      user: mockUserData,
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse),
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.hasPermission('nonexistent:permission')).toBe(false);
    });
  });

  it('should return false for hasPermission when user is null', () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    expect(result.current.hasPermission('read:users')).toBe(false);
  });

  it('should check hasRole correctly', async () => {
    const mockLoginResponse = {
      access_token: 'mock-token',
      user: mockUserData,
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse),
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.hasRole('admin')).toBe(true);
    });
  });

  it('should return false for missing role', async () => {
    const mockLoginResponse = {
      access_token: 'mock-token',
      user: mockUserData,
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse),
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.hasRole('musician')).toBe(false);
    });
  });

  it('should return false for hasRole when user is null', () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    expect(result.current.hasRole('admin')).toBe(false);
  });

  it('should clear user after logout', async () => {
    const mockLoginResponse = {
      access_token: 'mock-token',
      user: mockUserData,
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse),
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should check hasAnyPermission correctly', async () => {
    const mockLoginResponse = {
      access_token: 'mock-token',
      user: mockUserData,
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse),
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.hasAnyPermission(['read:users', 'nonexistent'])).toBe(true);
      expect(result.current.hasAnyPermission(['nonexistent1', 'nonexistent2'])).toBe(false);
    });
  });

  it('should check hasAllPermissions correctly', async () => {
    const mockLoginResponse = {
      access_token: 'mock-token',
      user: mockUserData,
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse),
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.hasAllPermissions(['read:users', 'write:users'])).toBe(true);
      expect(result.current.hasAllPermissions(['read:users', 'nonexistent'])).toBe(false);
    });
  });
});
