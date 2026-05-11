/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditPermissionDialog } from '@/app/components/admin/permissions/EditPermissionDialog';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  permissionsApi: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

import { permissionsApi } from '@/app/lib/api';

const mockPermissionsApi = permissionsApi as any;

describe('EditPermissionDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load permission when opened', async () => {
    const mockPermission = { id: 1, name: 'read', description: 'Can read data' };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });

    render(
      <EditPermissionDialog
        permissionId={1}
        permissionName="read"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(mockPermissionsApi.getById).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByDisplayValue('read')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Can read data')).toBeInTheDocument();
    });
  });

  it('should show loading while fetching permission', () => {
    mockPermissionsApi.getById.mockImplementation(() => new Promise(() => {}));

    render(
      <EditPermissionDialog
        permissionId={1}
        permissionName="read"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(screen.getByText('permissions.form.loadingPermission')).toBeInTheDocument();
  });

  it('should display name as read-only', async () => {
    const mockPermission = { id: 1, name: 'read', description: 'Can read data' };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });

    render(
      <EditPermissionDialog
        permissionId={1}
        permissionName="read"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('read'));

    const nameInput = screen.getByDisplayValue('read');
    expect(nameInput).toBeDisabled();
  });

  it('should allow editing description', async () => {
    const mockPermission = { id: 1, name: 'read', description: 'Can read data' };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });

    render(
      <EditPermissionDialog
        permissionId={1}
        permissionName="read"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Can read data'));

    const descriptionInput = screen.getByDisplayValue('Can read data');
    expect(descriptionInput).not.toBeDisabled();

    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
    expect(descriptionInput).toHaveValue('Updated description');
  });

  it('should submit update successfully', async () => {
    const mockPermission = { id: 1, name: 'read', description: 'Can read data' };
    const updatedPermission = { id: 1, name: 'read', description: 'Updated desc' };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });
    mockPermissionsApi.update.mockResolvedValue({
      data: updatedPermission,
    });

    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <EditPermissionDialog
        permissionId={1}
        permissionName="read"
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Can read data'));

    const descriptionInput = screen.getByDisplayValue('Can read data');
    const submitButton = screen.getByRole('button', { name: /permissions\.form\.buttons\.saveChanges/i });

    fireEvent.change(descriptionInput, { target: { value: 'Updated desc' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPermissionsApi.update).toHaveBeenCalledWith(1, {
        description: 'Updated desc',
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedPermission);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show loading during update', async () => {
    const mockPermission = { id: 1, name: 'read', description: 'Can read data' };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });
    mockPermissionsApi.update.mockImplementation(() => new Promise(() => {}));

    render(
      <EditPermissionDialog
        permissionId={1}
        permissionName="read"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Can read data'));

    const submitButton = screen.getByRole('button', { name: /permissions\.form\.buttons\.saveChanges/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should handle update error', async () => {
    const mockPermission = { id: 1, name: 'read', description: 'Can read data' };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });
    mockPermissionsApi.update.mockRejectedValue({
      detail: 'Update failed',
    });

    render(
      <EditPermissionDialog
        permissionId={1}
        permissionName="read"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Can read data'));

    const submitButton = screen.getByRole('button', { name: /permissions\.form\.buttons\.saveChanges/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('should reset state when dialog closes', async () => {
    const mockPermission = { id: 1, name: 'read', description: 'Can read data' };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });

    const { rerender } = render(
      <EditPermissionDialog
        permissionId={1}
        permissionName="read"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Can read data'));

    const descriptionInput = screen.getByDisplayValue('Can read data');
    fireEvent.change(descriptionInput, { target: { value: 'changed' } });

    // Close dialog
    rerender(
      <EditPermissionDialog
        permissionId={1}
        permissionName="read"
        open={false}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    // Reopen
    rerender(
      <EditPermissionDialog
        permissionId={1}
        permissionName="read"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Can read data'));
    const newDescriptionInput = screen.getByDisplayValue('Can read data');
    expect(newDescriptionInput).toHaveValue('Can read data');
  });

  it('should handle permission without description', async () => {
    const mockPermission = { id: 1, name: 'read', description: null };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });

    render(
      <EditPermissionDialog
        permissionId={1}
        permissionName="read"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('read'));

    const descriptionInput = screen.getByPlaceholderText('permissions.form.fields.descriptionPlaceholder');
    expect(descriptionInput).toHaveValue('');
  });
});