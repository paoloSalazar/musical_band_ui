/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserFormDialog } from '@/app/components/admin/users/UserFormDialog';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null),
    clear: vi.fn(() => null),
  },
  writable: true,
});

// Mock the APIs
vi.mock('@/app/lib/api', () => ({
  usersApi: {
    create: vi.fn(),
  },
  rolesApi: {
    list: vi.fn(),
  },
}));

import { usersApi, rolesApi } from '@/app/lib/api';

const mockUsersApi = usersApi as any;
const mockRolesApi = rolesApi as any;

describe('UserFormDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render trigger button', () => {
    render(<UserFormDialog />);

    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
  });

  it('should open dialog when trigger clicked', async () => {
    const mockRoles = [{ id: 1, name: 'admin' }];
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(<UserFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText('Create New User')).toBeInTheDocument();
    });
  });

  it('should load roles when dialog opens', async () => {
    const mockRoles = [{ id: 1, name: 'admin' }, { id: 2, name: 'user' }];
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(<UserFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(mockRolesApi.list).toHaveBeenCalled();
    });
  });

  it('should show validation errors for required fields', async () => {
    const mockRoles = [{ id: 1, name: 'admin' }];
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(<UserFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(triggerButton);

    await waitFor(() => screen.getByText('Create New User'));

    const submitButton = screen.getByRole('button', { name: /save user/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('should validate all required fields', async () => {
    const mockRoles = [{ id: 1, name: 'admin' }];
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(<UserFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(triggerButton);

    await waitFor(() => screen.getByText('Create New User'));

    // Fill some fields but miss required ones
    const lastnameInput = screen.getByPlaceholderText('e.g., Perez');
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });

    const submitButton = screen.getByRole('button', { name: /save user/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Name is required')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('e.g., Juan');
    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Email is required')).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('e.g., juan.perez@example.com');
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Password is required')).toBeInTheDocument();

    const passwordInput = screen.getByPlaceholderText('Enter password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Role is required')).toBeInTheDocument();
  });

  it('should submit form successfully', async () => {
    const mockRoles = [{ id: 1, name: 'admin' }];
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com', role: 'admin' };
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });
    mockUsersApi.create.mockResolvedValue({
      data: mockUser,
    });

    const onSuccess = vi.fn();

    render(<UserFormDialog onSuccess={onSuccess} />);

    const triggerButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(triggerButton);

    await waitFor(() => screen.getByText('Create New User'));

    const nameInput = screen.getByPlaceholderText('e.g., Juan');
    const lastnameInput = screen.getByPlaceholderText('e.g., Perez');
    const emailInput = screen.getByPlaceholderText('e.g., juan.perez@example.com');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const submitButton = screen.getByRole('button', { name: /save user/i });

    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Select role
    const roleSelect = screen.getByRole('combobox');
    fireEvent.click(roleSelect);
    const adminOption = screen.getByRole('option', { name: 'admin' });
    fireEvent.click(adminOption);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUsersApi.create).toHaveBeenCalledWith({
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role_id: 1,
        second_lastname: undefined,
        phone_number: undefined,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockUser);

    // Dialog should be closed
    expect(screen.queryByText('Create New User')).not.toBeInTheDocument();
  });

  it('should show loading state during submit', async () => {
    const mockRoles = [{ id: 1, name: 'admin' }];
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });
    mockUsersApi.create.mockImplementation(() => new Promise(() => {}));

    render(<UserFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(triggerButton);

    await waitFor(() => screen.getByText('Create New User'));

    const nameInput = screen.getByPlaceholderText('e.g., Juan');
    const lastnameInput = screen.getByPlaceholderText('e.g., Perez');
    const emailInput = screen.getByPlaceholderText('e.g., juan.perez@example.com');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const submitButton = screen.getByRole('button', { name: /save user/i });

    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Select role
    const roleSelect = screen.getByRole('combobox');
    fireEvent.click(roleSelect);
    const adminOption = screen.getByRole('option', { name: 'admin' });
    fireEvent.click(adminOption);

    fireEvent.click(submitButton);

    expect(screen.getByText('Save User')).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should handle API error', async () => {
    const mockRoles = [{ id: 1, name: 'admin' }];
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });
    mockUsersApi.create.mockRejectedValue({
      detail: 'Email already exists',
    });

    render(<UserFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(triggerButton);

    await waitFor(() => screen.getByText('Create New User'));

    const nameInput = screen.getByPlaceholderText('e.g., Juan');
    const lastnameInput = screen.getByPlaceholderText('e.g., Perez');
    const emailInput = screen.getByPlaceholderText('e.g., juan.perez@example.com');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const submitButton = screen.getByRole('button', { name: /save user/i });

    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Select role
    const roleSelect = screen.getByRole('combobox');
    fireEvent.click(roleSelect);
    const adminOption = screen.getByRole('option', { name: 'admin' });
    fireEvent.click(adminOption);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('should reset form when dialog closes', async () => {
    const mockRoles = [{ id: 1, name: 'admin' }];
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });

    render(<UserFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(triggerButton);

    await waitFor(() => screen.getByText('Create New User'));

    const nameInput = screen.getByPlaceholderText('e.g., Juan');
    fireEvent.change(nameInput, { target: { value: 'test' } });

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Reopen
    fireEvent.click(triggerButton);

    await waitFor(() => screen.getByText('Create New User'));

    const newNameInput = screen.getByPlaceholderText('e.g., Juan');
    await waitFor(() => {
      expect(newNameInput).toHaveValue('');
    });
  });

  it('should trim whitespace from inputs', async () => {
    const mockRoles = [{ id: 1, name: 'admin' }];
    const mockUser = { id: 1, name: 'John', lastname: 'Doe', email: 'john@example.com', role: 'admin' };
    mockRolesApi.list.mockResolvedValue({ data: mockRoles });
    mockUsersApi.create.mockResolvedValue({
      data: mockUser,
    });

    render(<UserFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(triggerButton);

    await waitFor(() => screen.getByText('Create New User'));

    const nameInput = screen.getByPlaceholderText('e.g., Juan');
    const lastnameInput = screen.getByPlaceholderText('e.g., Perez');
    const emailInput = screen.getByPlaceholderText('e.g., juan.perez@example.com');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const submitButton = screen.getByRole('button', { name: /save user/i });

    fireEvent.change(nameInput, { target: { value: '  John  ' } });
    fireEvent.change(lastnameInput, { target: { value: '  Doe  ' } });
    fireEvent.change(emailInput, { target: { value: '  john@example.com  ' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Select role
    const roleSelect = screen.getByRole('combobox');
    fireEvent.click(roleSelect);
    const adminOption = screen.getByRole('option', { name: 'admin' });
    fireEvent.click(adminOption);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUsersApi.create).toHaveBeenCalledWith({
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role_id: 1,
        second_lastname: undefined,
        phone_number: undefined,
      });
    });
  });

  it('should accept custom trigger', () => {
    render(<UserFormDialog trigger={<button>Custom Trigger</button>} />);

    expect(screen.getByRole('button', { name: /custom trigger/i })).toBeInTheDocument();
  });
});