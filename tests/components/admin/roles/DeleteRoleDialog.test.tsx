/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteRoleDialog } from '@/app/components/admin/roles/DeleteRoleDialog';

// Mock the API
vi.mock('@/app/lib/api/rbac', () => ({
  rolesApi: {
    delete: vi.fn(),
  },
}));

import { rolesApi } from '@/app/lib/api/rbac';

const mockRolesApi = rolesApi as any;

describe('DeleteRoleDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display role name in confirmation', () => {
    render(
      <DeleteRoleDialog
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('roles.dialog.delete.title')).toBeInTheDocument();
  });

  it('should submit delete successfully', async () => {
    mockRolesApi.delete.mockResolvedValue({});

    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <DeleteRoleDialog
        roleName="admin"
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /roles\.dialog\.delete\.delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockRolesApi.delete).toHaveBeenCalledWith('admin');
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show loading state during delete', async () => {
    mockRolesApi.delete.mockImplementation(() => new Promise(() => {}));

    render(
      <DeleteRoleDialog
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /roles\.dialog\.delete\.delete/i });
    fireEvent.click(deleteButton);

    expect(deleteButton).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should handle delete error', async () => {
    mockRolesApi.delete.mockRejectedValue({
      detail: 'Role is in use',
    });

    render(
      <DeleteRoleDialog
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /roles\.dialog\.delete\.delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Role is in use')).toBeInTheDocument();
    });
  });

  it('should reset error when dialog closes', async () => {
    mockRolesApi.delete.mockRejectedValue({
      detail: 'Error',
    });

    render(
      <DeleteRoleDialog
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /roles\.dialog\.delete\.delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => screen.getByText('Error'));

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /roles\.form\.buttons\.cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('should disable buttons during loading', () => {
    mockRolesApi.delete.mockImplementation(() => new Promise(() => {}));

    render(
      <DeleteRoleDialog
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /roles\.dialog\.delete\.delete/i });
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByRole('button', { name: /roles\.form\.buttons\.cancel/i });
    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});