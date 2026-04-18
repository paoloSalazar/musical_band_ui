/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UsersListPage } from '@/app/components/admin/users/UsersListPage';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  usersApi: {
    list: vi.fn(),
  },
}));

// Mock dialog components
vi.mock('@/app/components/admin/users/UserFormDialog', () => ({
  UserFormDialog: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="user-form-dialog" onClick={onSuccess}>Create User</div>
  ),
}));

vi.mock('@/app/components/admin/users/ViewUserDialog', () => ({
  ViewUserDialog: ({ open }: { open: boolean }) => (
    open ? <div data-testid="view-user-dialog">View Dialog</div> : null
  ),
}));

vi.mock('@/app/components/admin/users/EditUserDialog', () => ({
  EditUserDialog: ({ open, onSuccess }: { open: boolean; onSuccess: () => void }) => (
    open ? <div data-testid="edit-user-dialog" onClick={onSuccess}>Edit Dialog</div> : null
  ),
}));

vi.mock('@/app/components/admin/users/DeleteUserDialog', () => ({
  DeleteUserDialog: ({ open, onSuccess }: { open: boolean; onSuccess: () => void }) => (
    open ? <div data-testid="delete-user-dialog" onClick={onSuccess}>Delete Dialog</div> : null
  ),
}));

import { usersApi } from '@/app/lib/api';

const mockUsersApi = usersApi as any;

describe('UsersListPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockUsersApi.list.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<UsersListPage />);

    expect(screen.getByText('Loading users...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should display users in table', async () => {
    const mockUsers = [
      { id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com', role: 'admin', phone_number: '123-456-7890' },
      { id: 2, name: 'Jane', lastname: 'Smith', email: 'jane@example.com', role: 'user', phone_number: null },
    ];

    mockUsersApi.list.mockResolvedValue({ data: { data: mockUsers, total: 2 } });

    render(<UsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });

    expect(screen.getByText('Total: 2 user(s)')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('should show empty state when no users', async () => {
    mockUsersApi.list.mockResolvedValue({ data: { data: [], total: 0 } });

    render(<UsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('should show error state on API failure', async () => {
    mockUsersApi.list.mockRejectedValue(new Error('Network error'));

    render(<UsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading users')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should open view dialog when view button clicked', async () => {
    const mockUsers = [{ id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com', role: 'admin' }];

    mockUsersApi.list.mockResolvedValue({ data: { data: mockUsers, total: 1 } });

    render(<UsersListPage />);

    await waitFor(() => screen.getByText('John'));

    const viewButton = screen.getAllByTitle('View')[0];
    fireEvent.click(viewButton);

    expect(screen.getByTestId('view-user-dialog')).toBeInTheDocument();
  });

  it('should open edit dialog when edit button clicked', async () => {
    const mockUsers = [{ id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com', role: 'admin' }];

    mockUsersApi.list.mockResolvedValue({ data: { data: mockUsers, total: 1 } });

    render(<UsersListPage />);

    await waitFor(() => screen.getByText('John'));

    const editButton = screen.getAllByTitle('Edit')[0];
    fireEvent.click(editButton);

    expect(screen.getByTestId('edit-user-dialog')).toBeInTheDocument();
  });

  it('should open delete dialog when delete button clicked', async () => {
    const mockUsers = [{ id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com', role: 'admin' }];

    mockUsersApi.list.mockResolvedValue({ data: { data: mockUsers, total: 1 } });

    render(<UsersListPage />);

    await waitFor(() => screen.getByText('John'));

    const deleteButton = screen.getAllByTitle('Delete')[0];
    fireEvent.click(deleteButton);

    expect(screen.getByTestId('delete-user-dialog')).toBeInTheDocument();
  });

  it('should reload users after create success', async () => {
    mockUsersApi.list.mockResolvedValue({ data: { data: [], total: 0 } });

    render(<UsersListPage />);

    await waitFor(() => screen.getByText('No users found'));

    const createButton = screen.getByTestId('user-form-dialog');
    fireEvent.click(createButton);

    expect(mockUsersApi.list).toHaveBeenCalledTimes(2); // Initial + after create
  });

  it('should reload users after edit success', async () => {
    const mockUsers = [{ id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com', role: 'admin' }];

    mockUsersApi.list.mockResolvedValue({ data: { data: mockUsers, total: 1 } });

    render(<UsersListPage />);

    await waitFor(() => screen.getByText('John'));

    const editButton = screen.getAllByTitle('Edit')[0];
    fireEvent.click(editButton);

    const editDialog = screen.getByTestId('edit-user-dialog');
    fireEvent.click(editDialog);

    expect(mockUsersApi.list).toHaveBeenCalledTimes(2); // Initial + after edit
  });

  it('should reload users after delete success', async () => {
    const mockUsers = [{ id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com', role: 'admin' }];

    mockUsersApi.list.mockResolvedValueOnce({ data: { data: mockUsers, total: 1 } }).mockResolvedValueOnce({ data: { data: [], total: 0 } });

    render(<UsersListPage />);

    await waitFor(() => screen.getByText('John'));

    const deleteButton = screen.getAllByTitle('Delete')[0];
    fireEvent.click(deleteButton);

    const deleteDialog = screen.getByTestId('delete-user-dialog');
    fireEvent.click(deleteDialog);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  // it('should handle pagination', async () => {
  //   const mockUsers = Array.from({ length: 15 }, (_, i) => ({
  //     id: i + 1,
  //     name: `User${i + 1}`,
  //     lastname: 'Doe',
  //     email: `user${i + 1}@example.com`,
  //     role: 'user',
  //   }));

  //   mockUsersApi.list.mockResolvedValueOnce({ data: { data: mockUsers.slice(0, 10), total: 15 } }).mockResolvedValueOnce({ data: { data: mockUsers.slice(10), total: 15 } });

  //   render(<UsersListPage />);

  //   await waitFor(() => screen.getByText('User1'));

  //   const nextButton = screen.getByRole('button', { name: /next/i });
  //   fireEvent.click(nextButton);

  //   // await waitFor(() => screen.getByText('User11'));

  //   expect(mockUsersApi.list).toHaveBeenCalledWith(10, 10);
  // });
});