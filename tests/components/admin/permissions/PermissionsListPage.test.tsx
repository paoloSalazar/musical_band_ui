/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PermissionsListPage } from '@/app/components/admin/permissions/PermissionsListPage';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  permissionsApi: {
    list: vi.fn(),
  },
}));

// Mock dialog components
vi.mock('@/app/components/admin/permissions/PermissionFormDialog', () => ({
  PermissionFormDialog: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="permission-form-dialog" onClick={onSuccess}>Create Permission</div>
  ),
}));

vi.mock('@/app/components/admin/permissions/ViewPermissionDialog', () => ({
  ViewPermissionDialog: ({ open }: { open: boolean }) => (
    open ? <div data-testid="view-permission-dialog">View Dialog</div> : null
  ),
}));

vi.mock('@/app/components/admin/permissions/EditPermissionDialog', () => ({
  EditPermissionDialog: ({ open, onSuccess }: { open: boolean; onSuccess: (perm: any) => void }) => (
    open ? <div data-testid="edit-permission-dialog" onClick={() => onSuccess({ id: 1, name: 'updated', description: 'desc' })}>Edit Dialog</div> : null
  ),
}));

vi.mock('@/app/components/admin/permissions/DeletePermissionDialog', () => ({
  DeletePermissionDialog: ({ open, onSuccess }: { open: boolean; onSuccess: () => void }) => (
    open ? <div data-testid="delete-permission-dialog" onClick={onSuccess}>Delete Dialog</div> : null
  ),
}));

import { permissionsApi } from '@/app/lib/api';

const mockPermissionsApi = permissionsApi as any;

describe('PermissionsListPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockPermissionsApi.list.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<PermissionsListPage />);

    expect(screen.getByText('Loading permissions...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should display permissions in table', async () => {
    const mockPermissions = [
      { id: 1, name: 'read', description: 'Can read data' },
      { id: 2, name: 'write', description: 'Can write data' },
    ];

    mockPermissionsApi.list.mockResolvedValue({
      data: { data: mockPermissions, total: 2, skip: 0, limit: 8 },
    });

    render(<PermissionsListPage />);

    await waitFor(() => {
      expect(screen.getByText('read')).toBeInTheDocument();
      expect(screen.getByText('write')).toBeInTheDocument();
    });

    expect(screen.getByText('Showing 2 of 2 permission(s)')).toBeInTheDocument();
  });

  it('should show empty state when no permissions', async () => {
    mockPermissionsApi.list.mockResolvedValue({
      data: { data: [], total: 0, skip: 0, limit: 8 },
    });

    render(<PermissionsListPage />);

    await waitFor(() => {
      expect(screen.getByText('No permissions found')).toBeInTheDocument();
    });
  });

  it('should show error state on API failure', async () => {
    mockPermissionsApi.list.mockRejectedValue({
      detail: 'Network error',
    });

    render(<PermissionsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading permissions')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
  });

  it('should open view dialog when view button clicked', async () => {
    const mockPermissions = [{ id: 1, name: 'read', description: 'Can read' }];

    mockPermissionsApi.list.mockResolvedValue({
      data: { data: mockPermissions, total: 1, skip: 0, limit: 8 },
    });

    render(<PermissionsListPage />);

    await waitFor(() => screen.getByText('read'));

    const viewButton = screen.getAllByTitle('View')[0];
    fireEvent.click(viewButton);

    expect(screen.getByTestId('view-permission-dialog')).toBeInTheDocument();
  });

  it('should open edit dialog when edit button clicked', async () => {
    const mockPermissions = [{ id: 1, name: 'read', description: 'Can read' }];

    mockPermissionsApi.list.mockResolvedValue({
      data: { data: mockPermissions, total: 1, skip: 0, limit: 8 },
    });

    render(<PermissionsListPage />);

    await waitFor(() => screen.getByText('read'));

    const editButton = screen.getAllByTitle('Edit')[0];
    fireEvent.click(editButton);

    expect(screen.getByTestId('edit-permission-dialog')).toBeInTheDocument();
  });

  it('should open delete dialog when delete button clicked', async () => {
    const mockPermissions = [{ id: 1, name: 'read', description: 'Can read' }];

    mockPermissionsApi.list.mockResolvedValue({
      data: { data: mockPermissions, total: 1, skip: 0, limit: 8 },
    });

    render(<PermissionsListPage />);

    await waitFor(() => screen.getByText('read'));

    const deleteButton = screen.getAllByTitle('Delete')[0];
    fireEvent.click(deleteButton);

    expect(screen.getByTestId('delete-permission-dialog')).toBeInTheDocument();
  });

  it('should handle pagination next/previous', async () => {
    const mockPermissions = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `perm${i + 1}`,
      description: `Desc ${i + 1}`,
    }));

    mockPermissionsApi.list.mockResolvedValue({
      data: { data: mockPermissions, total: 16, skip: 0, limit: 8 },
    });

    render(<PermissionsListPage />);

    await waitFor(() => screen.getByText('perm1'));

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockPermissionsApi.list).toHaveBeenCalledWith(8, 8);
  });

  it('should reload permissions after create success', async () => {
    mockPermissionsApi.list.mockResolvedValue({
      data: { data: [], total: 0, skip: 0, limit: 8 },
    });

    render(<PermissionsListPage />);

    await waitFor(() => screen.getByText('No permissions found'));

    const createButton = screen.getByTestId('permission-form-dialog');
    fireEvent.click(createButton);

    expect(mockPermissionsApi.list).toHaveBeenCalledTimes(2); // Initial + after create
  });

  it('should update permission after edit success', async () => {
    const mockPermissions = [{ id: 1, name: 'read', description: 'Can read' }];

    mockPermissionsApi.list.mockResolvedValue({
      data: { data: mockPermissions, total: 1, skip: 0, limit: 8 },
    });

    render(<PermissionsListPage />);

    await waitFor(() => screen.getByText('read'));

    const editButton = screen.getAllByTitle('Edit')[0];
    fireEvent.click(editButton);

    const editDialog = screen.getByTestId('edit-permission-dialog');
    fireEvent.click(editDialog);

    await waitFor(() => {
      expect(screen.getByText('updated')).toBeInTheDocument();
    });
  });

  it('should reload permissions after delete success', async () => {
    const mockPermissions = [{ id: 1, name: 'read', description: 'Can read' }];

    mockPermissionsApi.list.mockResolvedValueOnce({
      data: { data: mockPermissions, total: 1, skip: 0, limit: 8 },
    }).mockResolvedValueOnce({
      data: { data: [], total: 0, skip: 0, limit: 8 },
    });

    render(<PermissionsListPage />);

    await waitFor(() => screen.getByText('read'));

    const deleteButton = screen.getAllByTitle('Delete')[0];
    fireEvent.click(deleteButton);

    const deleteDialog = screen.getByTestId('delete-permission-dialog');
    fireEvent.click(deleteDialog);

    await waitFor(() => {
      expect(screen.getByText('No permissions found')).toBeInTheDocument();
    });
  });
});