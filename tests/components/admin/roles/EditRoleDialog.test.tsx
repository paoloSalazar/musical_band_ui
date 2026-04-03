/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditRoleDialog } from '@/app/components/admin/roles/EditRoleDialog';

// Mock the API
vi.mock('@/app/lib/api/rbac', () => ({
  rolesApi: {
    getByName: vi.fn(),
    update: vi.fn(),
  },
}));

import { rolesApi } from '@/app/lib/api/rbac';

const mockRolesApi = rolesApi as any;

describe('EditRoleDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load role when opened', async () => {
    const mockRole = { id: 1, name: 'admin', description: 'Administrator' };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });

    render(
      <EditRoleDialog
        roleId={1}
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(mockRolesApi.getByName).toHaveBeenCalledWith('admin');

    await waitFor(() => {
      expect(screen.getByDisplayValue('admin')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Administrator')).toBeInTheDocument();
    });
  });

  it('should show loading while fetching role', () => {
    mockRolesApi.getByName.mockImplementation(() => new Promise(() => {}));

    render(
      <EditRoleDialog
        roleId={1}
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(screen.getByText('Loading role...')).toBeInTheDocument();
  });

  it('should display name as read-only', async () => {
    const mockRole = { id: 1, name: 'admin', description: 'Administrator' };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });

    render(
      <EditRoleDialog
        roleId={1}
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('admin'));

    const nameInput = screen.getByDisplayValue('admin');
    expect(nameInput).toBeDisabled();
  });

  it('should allow editing description', async () => {
    const mockRole = { id: 1, name: 'admin', description: 'Administrator' };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });

    render(
      <EditRoleDialog
        roleId={1}
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Administrator'));

    const descriptionInput = screen.getByDisplayValue('Administrator');
    expect(descriptionInput).not.toBeDisabled();

    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
    expect(descriptionInput).toHaveValue('Updated description');
  });

  it('should submit update successfully', async () => {
    const mockRole = { id: 1, name: 'admin', description: 'Administrator' };
    const updatedRole = { id: 1, name: 'admin', description: 'Updated desc' };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });
    mockRolesApi.update.mockResolvedValue({
      data: updatedRole,
    });

    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <EditRoleDialog
        roleId={1}
        roleName="admin"
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Administrator'));

    const descriptionInput = screen.getByDisplayValue('Administrator');
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(descriptionInput, { target: { value: 'Updated desc' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRolesApi.update).toHaveBeenCalledWith(1, {
        name: 'admin',
        description: 'Updated desc',
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedRole);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show loading during update', async () => {
    const mockRole = { id: 1, name: 'admin', description: 'Administrator' };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });
    mockRolesApi.update.mockImplementation(() => new Promise(() => {}));

    render(
      <EditRoleDialog
        roleId={1}
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Administrator'));

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should handle update error', async () => {
    const mockRole = { id: 1, name: 'admin', description: 'Administrator' };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });
    mockRolesApi.update.mockRejectedValue({
      detail: 'Update failed',
    });

    render(
      <EditRoleDialog
        roleId={1}
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Administrator'));

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('should reset state when dialog closes', async () => {
    const mockRole = { id: 1, name: 'admin', description: 'Administrator' };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });

    const { rerender } = render(
      <EditRoleDialog
        roleId={1}
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Administrator'));

    const descriptionInput = screen.getByDisplayValue('Administrator');
    fireEvent.change(descriptionInput, { target: { value: 'changed' } });

    // Close dialog
    rerender(
      <EditRoleDialog
        roleId={1}
        roleName="admin"
        open={false}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    // Reopen
    rerender(
      <EditRoleDialog
        roleId={1}
        roleName="admin"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('Administrator'));
    const newDescriptionInput = screen.getByDisplayValue('Administrator');
    expect(newDescriptionInput).toHaveValue('Administrator');
  });

  it('should handle role without description', async () => {
    const mockRole = { id: 1, name: 'user', description: null };

    mockRolesApi.getByName.mockResolvedValue({
      data: mockRole,
    });

    render(
      <EditRoleDialog
        roleId={1}
        roleName="user"
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('user'));

    const descriptionInput = screen.getByPlaceholderText('Enter description');
    expect(descriptionInput).toHaveValue('');
  });
});