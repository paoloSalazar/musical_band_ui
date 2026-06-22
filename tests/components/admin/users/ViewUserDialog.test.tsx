/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ViewUserDialog } from '@/app/components/admin/users/ViewUserDialog';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  usersApi: {
    getById: vi.fn(),
  },
}));

import { usersApi } from '@/app/lib/api';

const mockUsersApi = usersApi as any;

describe('ViewUserDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load user when opened with userId', async () => {
    const mockUser = {
      id: 1,
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      role: 'admin',
      phone_number: '123-456-7890',
      permissions: ['read', 'write'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    };

    mockUsersApi.getById.mockResolvedValue({
      data: mockUser,
    });

    render(<ViewUserDialog userId={1} open={true} onOpenChange={() => {}} />);

    expect(mockUsersApi.getById).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('read')).toBeInTheDocument();
      expect(screen.getByText('write')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    mockUsersApi.getById.mockImplementation(() => new Promise(() => {}));

    render(<ViewUserDialog userId={1} open={true} onOpenChange={() => {}} />);

    expect(screen.getByText('users.form.loadingUser')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    mockUsersApi.getById.mockRejectedValue(new Error('User not found'));

    render(<ViewUserDialog userId={1} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('should display user details correctly', async () => {
    const mockUser = {
      id: 42,
      name: 'Jane',
      lastname: 'Smith',
      second_lastname: 'Johnson',
      email: 'jane@example.com',
      role: 'user',
      phone_number: '987-654-3210',
      permissions: [],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: null,
    };

    mockUsersApi.getById.mockResolvedValue({
      data: mockUser,
    });

    render(<ViewUserDialog userId={42} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith Johnson')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('987-654-3210')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
    });
  });

  it('should handle user without phone number', async () => {
    const mockUser = {
      id: 1,
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      role: 'admin',
      phone_number: null,
      permissions: [],
    };

    mockUsersApi.getById.mockResolvedValue({
      data: mockUser,
    });

    render(<ViewUserDialog userId={1} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Should not show phone section
    expect(screen.queryByText('Phone Number')).not.toBeInTheDocument();
  });

  it('should handle user without permissions', async () => {
    const mockUser = {
      id: 1,
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      role: 'admin',
      permissions: [],
    };

    mockUsersApi.getById.mockResolvedValue({
      data: mockUser,
    });

    render(<ViewUserDialog userId={1} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Should not show permissions section
    expect(screen.queryByText('Permissions')).not.toBeInTheDocument();
  });

  it('should display CI when available', async () => {
    const mockUser = {
      id: 1,
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      role: 'admin',
      ci: 'V-12345678',
      permissions: [],
    };

    mockUsersApi.getById.mockResolvedValue({
      data: mockUser,
    });

    render(<ViewUserDialog userId={1} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Should show CI
    expect(screen.getByText('V-12345678')).toBeInTheDocument();
  });

  it('should handle user without CI', async () => {
    const mockUser = {
      id: 1,
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      role: 'admin',
      ci: null,
      permissions: [],
    };

    mockUsersApi.getById.mockResolvedValue({
      data: mockUser,
    });

    render(<ViewUserDialog userId={1} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Should not show CI section
    expect(screen.queryByText('CI')).not.toBeInTheDocument();
  });

  it('should reset state when dialog closes', async () => {
    const mockUser = {
      id: 1,
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      role: 'admin',
    };

    mockUsersApi.getById.mockResolvedValue({
      data: mockUser,
    });

    const { rerender } = render(<ViewUserDialog userId={1} open={true} onOpenChange={() => {}} />);

    await waitFor(() => screen.getByText('John Doe'));

    // Close dialog
    rerender(<ViewUserDialog userId={1} open={false} onOpenChange={() => {}} />);

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});