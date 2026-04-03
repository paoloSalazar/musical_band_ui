/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditUserDialog } from '@/app/components/admin/users/EditUserDialog';

// Mock the APIs
vi.mock('@/app/lib/api', () => ({
  usersApi: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/app/lib/api/rbac', () => ({
  rolesApi: {
    list: vi.fn(),
  },
}));

import { usersApi } from '@/app/lib/api';
import { rolesApi } from '@/app/lib/api/rbac';

const mockUsersApi = usersApi as any;
const mockRolesApi = rolesApi as any;

describe('EditUserDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load user and roles when opened', async () => {
    const mockUser = {
      id: 1,
      name: 'John',
      lastname: 'Doe',
      second_lastname: 'Smith',
      phone_number: '123-456-7890',
      role_id: 1,
    };
    const mockRoles = [{ id: 1, name: 'admin' }];

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(
      <EditUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(mockUsersApi.getById).toHaveBeenCalledWith(1);
    expect(mockRolesApi.list).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123-456-7890')).toBeInTheDocument();
    });
  });

  it('should show loading while fetching user', () => {
    mockUsersApi.getById.mockImplementation(() => new Promise(() => {}));

    render(
      <EditUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(screen.getByText('Loading user...')).toBeInTheDocument();
  });

  it('should show loading while fetching roles', () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', role_id: 1 };
    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockRolesApi.list.mockImplementation(() => new Promise(() => {}));

    render(
      <EditUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
  });

  it('should allow editing fields', async () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', role_id: 1 };
    const mockRoles = [{ id: 1, name: 'admin' }];

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(
      <EditUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('John'));

    const nameInput = screen.getByDisplayValue('John');
    const lastnameInput = screen.getByDisplayValue('Doe');

    expect(nameInput).not.toBeDisabled();
    expect(lastnameInput).not.toBeDisabled();

    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    expect(nameInput).toHaveValue('Jane');
  });

  it('should submit update successfully', async () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', role_id: 1 };
    const mockRoles = [{ id: 1, name: 'admin' }];
    const updatedUser = { id: 1, name: 'Jane', lastname: 'Doe', role_id: 1 };

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });
    mockUsersApi.update.mockResolvedValue({ data: updatedUser });

    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <EditUserDialog
        userId={1}
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => screen.getByDisplayValue('John'));

    const nameInput = screen.getByDisplayValue('John');
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUsersApi.update).toHaveBeenCalledWith(1, {
        name: 'Jane',
        lastname: 'Doe',
        second_lastname: undefined,
        phone_number: undefined,
        role_id: 1,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedUser);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show loading during update', async () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', role_id: 1 };
    const mockRoles = [{ id: 1, name: 'admin' }];

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });
    mockUsersApi.update.mockImplementation(() => new Promise(() => {}));

    render(
      <EditUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('John'));

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should handle update error', async () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', role_id: 1 };
    const mockRoles = [{ id: 1, name: 'admin' }];

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });
    mockUsersApi.update.mockRejectedValue({
      detail: 'Update failed',
    });

    render(
      <EditUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('John'));

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('should show validation errors', async () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', role_id: 1 };
    const mockRoles = [{ id: 1, name: 'admin' }];

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(
      <EditUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('John'));

    const nameInput = screen.getByDisplayValue('John');
    fireEvent.change(nameInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('should reset state when dialog closes', async () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', role_id: 1 };
    const mockRoles = [{ id: 1, name: 'admin' }];

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    const { rerender } = render(
      <EditUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('John'));

    const nameInput = screen.getByDisplayValue('John');
    fireEvent.change(nameInput, { target: { value: 'changed' } });

    // Close dialog
    rerender(
      <EditUserDialog
        userId={1}
        open={false}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    // Reopen
    rerender(
      <EditUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('John'));
    const newNameInput = screen.getByDisplayValue('John');
    expect(newNameInput).toHaveValue('John');
  });

  it('should handle user without optional fields', async () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', role_id: 1 };
    const mockRoles = [{ id: 1, name: 'admin' }];

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(
      <EditUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByDisplayValue('John'));

    const secondLastnameInput = screen.getByPlaceholderText('e.g., Villarroel');
    const phoneInput = screen.getByPlaceholderText('e.g., +1234567890');

    expect(secondLastnameInput).toHaveValue('');
    expect(phoneInput).toHaveValue('');
  });
});