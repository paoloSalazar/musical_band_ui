/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RolesListPage } from '@/app/components/admin/roles/RolesListPage';

// Mock the API
vi.mock('@/app/lib/api/rbac', () => ({
  rolesApi: {
    list: vi.fn(),
  },
}));

// Mock dialog components
vi.mock('@/app/components/admin/roles/RoleFormDialog', () => ({
  RoleFormDialog: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="role-form-dialog" onClick={onSuccess}>Create Role</div>
  ),
}));

vi.mock('@/app/components/admin/roles/ViewRoleDialog', () => ({
  ViewRoleDialog: ({ open }: { open: boolean }) => (
    open ? <div data-testid="view-role-dialog">View Dialog</div> : null
  ),
}));

vi.mock('@/app/components/admin/roles/EditRoleDialog', () => ({
  EditRoleDialog: ({ open, onSuccess }: { open: boolean; onSuccess: (role: any) => void }) => (
    open ? <div data-testid="edit-role-dialog" onClick={() => onSuccess({ id: 1, name: 'updated', description: 'desc' })}>Edit Dialog</div> : null
  ),
}));

vi.mock('@/app/components/admin/roles/DeleteRoleDialog', () => ({
  DeleteRoleDialog: ({ open, onSuccess }: { open: boolean; onSuccess: () => void }) => (
    open ? <div data-testid="delete-role-dialog" onClick={onSuccess}>Delete Dialog</div> : null
  ),
}));

import { rolesApi } from '@/app/lib/api/rbac';

const mockRolesApi = rolesApi as any;

describe('RolesListPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockRolesApi.list.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<RolesListPage />);

    expect(screen.getByText('Loading roles...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should display roles in table', async () => {
    const mockRoles = [
      { id: 1, name: 'admin', description: 'Administrator' },
      { id: 2, name: 'user', description: 'Regular user' },
    ];

    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(<RolesListPage />);

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
    });

    expect(screen.getByText('Total: 2 role(s)')).toBeInTheDocument();
  });

  it('should show empty state when no roles', async () => {
    mockRolesApi.list.mockResolvedValue({ data: [] });

    render(<RolesListPage />);

    await waitFor(() => {
      expect(screen.getByText('No roles found')).toBeInTheDocument();
    });
  });

  it('should show error state on API failure', async () => {
    mockRolesApi.list.mockRejectedValue(new Error('Network error'));

    render(<RolesListPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading roles')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should open view dialog when view button clicked', async () => {
    const mockRoles = [{ id: 1, name: 'admin', description: 'Administrator' }];

    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(<RolesListPage />);

    await waitFor(() => screen.getByText('admin'));

    const viewButton = screen.getAllByTitle('View')[0];
    fireEvent.click(viewButton);

    expect(screen.getByTestId('view-role-dialog')).toBeInTheDocument();
  });

  it('should open edit dialog when edit button clicked', async () => {
    const mockRoles = [{ id: 1, name: 'admin', description: 'Administrator' }];

    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(<RolesListPage />);

    await waitFor(() => screen.getByText('admin'));

    const editButton = screen.getAllByTitle('Edit')[0];
    fireEvent.click(editButton);

    expect(screen.getByTestId('edit-role-dialog')).toBeInTheDocument();
  });

  it('should open delete dialog when delete button clicked', async () => {
    const mockRoles = [{ id: 1, name: 'admin', description: 'Administrator' }];

    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(<RolesListPage />);

    await waitFor(() => screen.getByText('admin'));

    const deleteButton = screen.getAllByTitle('Delete')[0];
    fireEvent.click(deleteButton);

    expect(screen.getByTestId('delete-role-dialog')).toBeInTheDocument();
  });

  it('should reload roles after create success', async () => {
    mockRolesApi.list.mockResolvedValue({ data: [] });

    render(<RolesListPage />);

    await waitFor(() => screen.getByText('No roles found'));

    const createButton = screen.getByTestId('role-form-dialog');
    fireEvent.click(createButton);

    expect(mockRolesApi.list).toHaveBeenCalledTimes(2); // Initial + after create
  });

  it('should update role after edit success', async () => {
    const mockRoles = [{ id: 1, name: 'admin', description: 'Administrator' }];

    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(<RolesListPage />);

    await waitFor(() => screen.getByText('admin'));

    const editButton = screen.getAllByTitle('Edit')[0];
    fireEvent.click(editButton);

    const editDialog = screen.getByTestId('edit-role-dialog');
    fireEvent.click(editDialog);

    await waitFor(() => {
      expect(screen.getByText('updated')).toBeInTheDocument();
    });
  });

  it('should reload roles after delete success', async () => {
    const mockRoles = [{ id: 1, name: 'admin', description: 'Administrator' }];

    mockRolesApi.list.mockResolvedValueOnce({ data: mockRoles }).mockResolvedValueOnce({ data: [] });

    render(<RolesListPage />);

    await waitFor(() => screen.getByText('admin'));

    const deleteButton = screen.getAllByTitle('Delete')[0];
    fireEvent.click(deleteButton);

    const deleteDialog = screen.getByTestId('delete-role-dialog');
    fireEvent.click(deleteDialog);

    await waitFor(() => {
      expect(screen.getByText('No roles found')).toBeInTheDocument();
    });
  });
});