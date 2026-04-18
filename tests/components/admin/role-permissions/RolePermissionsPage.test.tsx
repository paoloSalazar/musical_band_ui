/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RolePermissionsPage } from '@/app/components/admin/role-permissions/RolePermissionsPage';

// Mock the APIs
vi.mock('@/app/lib/api/rbac', () => ({
  rolesApi: {
    list: vi.fn(),
  },
  permissionsApi: {
    list: vi.fn(),
    getPermissionsForRole: vi.fn(),
    assignToRole: vi.fn(),
    removeFromRole: vi.fn(),
  },
}));

// Mock window.alert
global.alert = vi.fn();

import { rolesApi, permissionsApi } from '@/app/lib/api/rbac';

const mockRolesApi = rolesApi as any;
const mockPermissionsApi = permissionsApi as any;

describe('RolePermissionsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.alert.mockClear();
  });

  it('should show loading state initially', () => {
    mockRolesApi.list.mockImplementation(() => new Promise(() => {}));

    render(<RolePermissionsPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should display roles and permissions', async () => {
    const mockRoles = [
      { id: 1, name: 'admin', description: 'Administrator' },
      { id: 2, name: 'user', description: 'Regular user' },
    ];
    const mockPermissions = [
      { id: 1, name: 'read', description: 'Can read' },
      { id: 2, name: 'write', description: 'Can write' },
    ];
    const mockRolePermissions = {
      admin: [mockPermissions[0], mockPermissions[1]],
      user: [mockPermissions[0]],
    };

    mockRolesApi.list.mockResolvedValue({ data: mockRoles });
    mockPermissionsApi.list.mockResolvedValue({ data: { data: mockPermissions, total: 2, skip: 0, limit: 1000 } });
    mockPermissionsApi.getPermissionsForRole
      .mockImplementationOnce(() => Promise.resolve({ data: mockRolePermissions.admin }))
      .mockImplementationOnce(() => Promise.resolve({ data: mockRolePermissions.user }));

    render(<RolePermissionsPage />);

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
    });

    expect(screen.getAllByText('read')).toHaveLength(2); // One for admin, one for user
    expect(screen.getAllByText('write')).toHaveLength(1); // Only for admin
  });

  it('should show empty state when no roles', async () => {
    mockRolesApi.list.mockResolvedValue({ data: [] });
    mockPermissionsApi.list.mockResolvedValue({ data: { data: [], total: 0, skip: 0, limit: 1000 } });

    render(<RolePermissionsPage />);

    await waitFor(() => {
      expect(screen.getByText('No roles found')).toBeInTheDocument();
    });
  });

  it('should show error state on API failure', async () => {
    mockRolesApi.list.mockRejectedValue({ detail: 'Network error' });

    render(<RolePermissionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should handle save error', async () => {
    const mockRoles = [{ id: 1, name: 'admin', description: 'Administrator' }];
    const mockPermissions = [{ id: 1, name: 'read', description: 'Can read' }];
    const mockRolePermissions = { admin: [] };

    mockRolesApi.list.mockResolvedValue({ data: mockRoles });
    mockPermissionsApi.list.mockResolvedValue({ data: { data: mockPermissions, total: 1, skip: 0, limit: 1000 } });
    mockPermissionsApi.getPermissionsForRole.mockResolvedValue({ data: mockRolePermissions.admin });
    mockPermissionsApi.assignToRole.mockRejectedValue({ detail: 'Permission denied' });

    render(<RolePermissionsPage />);

    await waitFor(() => screen.getByText('admin'));

    const manageButton = screen.getByRole('button', { name: /manage/i });
    fireEvent.click(manageButton);

    await waitFor(() => screen.getByText('Manage Permissions for admin'));

    const readCheckbox = document.querySelector('[id="perm-1"]');
    fireEvent.click(readCheckbox);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Permission denied');
    });
  });
});