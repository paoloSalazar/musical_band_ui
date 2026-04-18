/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Can } from '@/app/components/auth/Can';
import { CanRole } from '@/app/components/auth/CanRole';
import { CanAny } from '@/app/components/auth/CanAny';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';

vi.mock('@/app/contexts/UserContext', () => ({
  useUser: vi.fn(),
}));

import { useUser } from '@/app/contexts/UserContext';

const mockedUseUser = useUser as vi.MockedFunction<typeof useUser>;

describe('Can Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseUser.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(false),
    } as any);
  });

  it('should render children when user has permission', () => {
    mockedUseUser.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(true),
    } as any);

    render(
      <Can permission="read">
        <div data-testid="content">Protected Content</div>
      </Can>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render fallback when user lacks permission', () => {
    mockedUseUser.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(false),
    } as any);

    render(
      <Can permission="admin:access" fallback={<div data-testid="fallback">Access Denied</div>}>
        <div data-testid="content">Protected Content</div>
      </Can>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('should render nothing when no fallback provided and permission denied', () => {
    mockedUseUser.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(false),
    } as any);

    render(
      <Can permission="admin:access">
        <div data-testid="content">Protected Content</div>
      </Can>
    );

    expect(screen.queryByTestId('content')).toBeNull();
  });
});

describe('CanRole Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseUser.mockReturnValue({
      hasRole: vi.fn().mockReturnValue(false),
    } as any);
  });

  it('should render children when user has single role', () => {
    mockedUseUser.mockReturnValue({
      hasRole: vi.fn().mockReturnValue(true),
    } as any);

    render(
      <CanRole roles="admin">
        <div data-testid="content">Admin Content</div>
      </CanRole>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render fallback when user lacks role', () => {
    mockedUseUser.mockReturnValue({
      hasRole: vi.fn().mockReturnValue(false),
    } as any);

    render(
      <CanRole roles="superadmin" fallback={<div data-testid="fallback">Not Admin</div>}>
        <div data-testid="content">Admin Content</div>
      </CanRole>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('should render children when user has any role from array', () => {
    mockedUseUser.mockImplementation(() => ({
      hasRole: (role: string) => role === 'admin',
    } as any));

    render(
      <CanRole roles={['admin', 'moderator']} fallback={<div data-testid="fallback">No Role</div>}>
        <div data-testid="content">Allowed Content</div>
      </CanRole>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render fallback when user has none of the roles', () => {
    mockedUseUser.mockImplementation(() => ({
      hasRole: (role: string) => role === 'superadmin',
    } as any));

    render(
      <CanRole roles={['admin', 'moderator']} fallback={<div data-testid="fallback">No Role</div>}>
        <div data-testid="content">Allowed Content</div>
      </CanRole>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).toBeNull();
  });
});

describe('CanAny Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseUser.mockReturnValue({
      hasAnyPermission: vi.fn().mockReturnValue(false),
    } as any);
  });

  it('should render children when user has any permission', () => {
    mockedUseUser.mockReturnValue({
      hasAnyPermission: vi.fn().mockReturnValue(true),
    } as any);

    render(
      <CanAny permissions={['read', 'write']} fallback={<div data-testid="fallback">No Access</div>}>
        <div data-testid="content">Allowed Content</div>
      </CanAny>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render fallback when user lacks all permissions', () => {
    mockedUseUser.mockReturnValue({
      hasAnyPermission: vi.fn().mockReturnValue(false),
    } as any);

    render(
      <CanAny permissions={['admin:access', 'super:admin']} fallback={<div data-testid="fallback">Access Denied</div>}>
        <div data-testid="content">Protected Content</div>
      </CanAny>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).toBeNull();
  });
});


