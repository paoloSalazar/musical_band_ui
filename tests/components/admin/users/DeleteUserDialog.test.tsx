/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteUserDialog } from '@/app/components/admin/users/DeleteUserDialog';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  usersApi: {
    getById: vi.fn(),
    delete: vi.fn(),
  },
}));

import { usersApi } from '@/app/lib/api';

const mockUsersApi = usersApi as any;

describe('DeleteUserDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load user when opened', async () => {
    const mockUser = {
      id: 1,
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      phone_number: '123-456-7890',
    };

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });

    render(
      <DeleteUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(mockUsersApi.getById).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    });
  });

  it('should show loading while fetching user', () => {
    mockUsersApi.getById.mockImplementation(() => new Promise(() => {}));

    render(
      <DeleteUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(screen.getByText('Loading user...')).toBeInTheDocument();
  });

  it('should submit delete successfully', async () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com' };

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockUsersApi.delete.mockResolvedValue({});

    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <DeleteUserDialog
        userId={1}
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => screen.getByText('John Doe'));

    const deleteButton = screen.getByRole('button', { name: /delete user/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockUsersApi.delete).toHaveBeenCalledWith(1);
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show loading state during delete', async () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com' };

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockUsersApi.delete.mockImplementation(() => new Promise(() => {}));

    render(
      <DeleteUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByText('John Doe'));

    const deleteButton = screen.getByRole('button', { name: /delete user/i });
    fireEvent.click(deleteButton);

    expect(deleteButton).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should handle delete error', async () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com' };

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockUsersApi.delete.mockRejectedValue({
      detail: 'User cannot be deleted',
    });

    render(
      <DeleteUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByText('John Doe'));

    const deleteButton = screen.getByRole('button', { name: /delete user/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('User cannot be deleted')).toBeInTheDocument();
    });
  });

  it('should handle load user error', async () => {
    mockUsersApi.getById.mockRejectedValue(new Error('User not found'));

    render(
      <DeleteUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('should reset error when dialog closes', async () => {
    mockUsersApi.getById.mockRejectedValue(new Error('Error'));

    const { rerender } = render(
      <DeleteUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    await waitFor(() => screen.getByText('Error'));

    // Close dialog
    rerender(
      <DeleteUserDialog
        userId={1}
        open={false}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('should disable buttons during loading', async () => {
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com' };

    mockUsersApi.getById.mockResolvedValue({ data: mockUser });
    mockUsersApi.delete.mockImplementation(() => new Promise(() => {}));

    render(
      <DeleteUserDialog
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    );

    // Wait for user to load
    await waitFor(() => screen.getByText('John Doe'));

    const deleteButton = screen.getByRole('button', { name: /delete user/i });
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});