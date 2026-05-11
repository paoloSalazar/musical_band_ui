/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ViewRoleDialog } from '@/app/components/admin/roles/ViewRoleDialog';

// Mock the API
vi.mock('@/app/lib/api/rbac', () => ({
  rolesApi: {
    getByName: vi.fn(),
  },
}));

import { rolesApi } from '@/app/lib/api/rbac';

const mockRolesApi = rolesApi as any;

describe('ViewRoleDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not load role when not open', () => {
    render(<ViewRoleDialog roleName="admin" open={false} onOpenChange={() => {}} />);

    expect(mockRolesApi.getByName).not.toHaveBeenCalled();
  });

  it('should load role when opened with roleName', async () => {
    const mockRole = { id: 1, name: 'admin', description: 'Administrator role' };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });

    render(<ViewRoleDialog roleName="admin" open={true} onOpenChange={() => {}} />);

    expect(mockRolesApi.getByName).toHaveBeenCalledWith('admin');

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('Administrator role')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    mockRolesApi.getByName.mockImplementation(() => new Promise(() => {}));

    render(<ViewRoleDialog roleName="admin" open={true} onOpenChange={() => {}} />);

    expect(screen.getByText('roles.form.loadingRole')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    mockRolesApi.getByName.mockRejectedValue({
      detail: 'Role not found',
    });

    render(<ViewRoleDialog roleName="admin" open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Role not found')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByRole('button', { name: /common\.tryAgain/i });
    expect(tryAgainButton).toBeInTheDocument();
  });

  it('should display role details correctly', async () => {
    const mockRole = { id: 42, name: 'superadmin', description: 'Super admin access' };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });

    render(<ViewRoleDialog roleName="superadmin" open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('superadmin')).toBeInTheDocument();
      expect(screen.getByText('Super admin access')).toBeInTheDocument();
    });
  });

  it('should handle role without description', async () => {
    const mockRole = { id: 1, name: 'user', description: null };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });

    render(<ViewRoleDialog roleName="user" open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('roles.dialog.view.noDescription')).toBeInTheDocument();
    });
  });

  it('should reset state when dialog closes', async () => {
    const mockRole = { id: 1, name: 'admin', description: 'Admin' };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });

    const { rerender } = render(<ViewRoleDialog roleName="admin" open={true} onOpenChange={() => {}} />);

    await waitFor(() => screen.getByText('admin'));

    // Close dialog
    rerender(<ViewRoleDialog roleName="admin" open={false} onOpenChange={() => {}} />);

    expect(screen.queryByText('admin')).not.toBeInTheDocument();
  });
});