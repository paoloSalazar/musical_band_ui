/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeletePermissionDialog } from '@/app/components/admin/permissions/DeletePermissionDialog';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  permissionsApi: {
    deleteByName: vi.fn(),
  },
}));

import { permissionsApi } from '@/app/lib/api';

const mockPermissionsApi = permissionsApi as any;

describe('DeletePermissionDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display permission name in confirmation', () => {
    render(
      <DeletePermissionDialog
        permissionId={1}
        permissionName="read:events"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(screen.getByText('read:events')).toBeInTheDocument();
    expect(screen.getByText('permissions.dialog.delete.title')).toBeInTheDocument();
  });

  it('should submit delete successfully', async () => {
    mockPermissionsApi.deleteByName.mockResolvedValue({});

    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <DeletePermissionDialog
        permissionId={1}
        permissionName="read:events"
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockPermissionsApi.deleteByName).toHaveBeenCalledWith('read:events');
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show loading state during delete', async () => {
    mockPermissionsApi.deleteByName.mockImplementation(() => new Promise(() => {}));

    render(
      <DeletePermissionDialog
        permissionId={1}
        permissionName="read:events"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(deleteButton).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should handle delete error', async () => {
    mockPermissionsApi.deleteByName.mockRejectedValue({
      detail: 'Permission is in use',
    });

    render(
      <DeletePermissionDialog
        permissionId={1}
        permissionName="read:events"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Permission is in use')).toBeInTheDocument();
    });
  });

  it('should reset error when dialog closes', async () => {
    mockPermissionsApi.deleteByName.mockRejectedValue({
      detail: 'Error',
    });

    render(
      <DeletePermissionDialog
        permissionId={1}
        permissionName="read:events"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => screen.getByText('Error'));

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('should disable buttons during loading', () => {
    mockPermissionsApi.deleteByName.mockImplementation(() => new Promise(() => {}));

    render(
      <DeletePermissionDialog
        permissionId={1}
        permissionName="read:events"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});