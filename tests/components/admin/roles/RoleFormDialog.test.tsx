/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoleFormDialog } from '@/app/components/admin/roles/RoleFormDialog';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  rolesApi: {
    create: vi.fn(),
  },
}));

import { rolesApi } from '@/app/lib/api';

const mockRolesApi = rolesApi as any;

describe('RoleFormDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render trigger button', () => {
    render(<RoleFormDialog />);

    expect(screen.getByRole('button', { name: /create role/i })).toBeInTheDocument();
  });

  it('should open dialog when trigger clicked', () => {
    render(<RoleFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create role/i });
    fireEvent.click(triggerButton);

    expect(screen.getByText('Create New Role')).toBeInTheDocument();
  });

  it('should show validation error for empty name', async () => {
    render(<RoleFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create role/i });
    fireEvent.click(triggerButton);

    const submitButton = screen.getByRole('button', { name: /save role/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Role name is required')).toBeInTheDocument();
  });

  it('should submit form successfully', async () => {
    const mockRole = { id: 1, name: 'moderator', description: 'Can moderate' };
    mockRolesApi.create.mockResolvedValue({
      data: mockRole,
    });

    const onSuccess = vi.fn();

    render(<RoleFormDialog onSuccess={onSuccess} />);

    const triggerButton = screen.getByRole('button', { name: /create role/i });
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('e.g., moderator');
    const descriptionInput = screen.getByPlaceholderText('Optional description');
    const submitButton = screen.getByRole('button', { name: /save role/i });

    fireEvent.change(nameInput, { target: { value: 'moderator' } });
    fireEvent.change(descriptionInput, { target: { value: 'Can moderate' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRolesApi.create).toHaveBeenCalledWith({
        name: 'moderator',
        description: 'Can moderate',
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockRole);

    // Dialog should be closed
    expect(screen.queryByText('Create New Role')).not.toBeInTheDocument();
  });

  it('should show loading state during submit', async () => {
    mockRolesApi.create.mockImplementation(() => new Promise(() => {}));

    render(<RoleFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create role/i });
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('e.g., moderator');
    const submitButton = screen.getByRole('button', { name: /save role/i });

    fireEvent.change(nameInput, { target: { value: 'moderator' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Save Role')).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should handle API error', async () => {
    mockRolesApi.create.mockRejectedValue({
      detail: 'Role already exists',
    });

    render(<RoleFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create role/i });
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('e.g., moderator');
    const submitButton = screen.getByRole('button', { name: /save role/i });

    fireEvent.change(nameInput, { target: { value: 'moderator' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Role already exists')).toBeInTheDocument();
    });
  });

  it('should reset form when dialog closes', async () => {
    render(<RoleFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create role/i });
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('e.g., moderator');
    fireEvent.change(nameInput, { target: { value: 'test' } });

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Reopen
    fireEvent.click(triggerButton);

    const newNameInput = screen.getByPlaceholderText('e.g., moderator');
    await waitFor(() => {
      expect(newNameInput).toHaveValue('');
    });
  });

  it('should trim whitespace from inputs', async () => {
    const mockRole = { id: 1, name: 'moderator', description: 'desc' };
    mockRolesApi.create.mockResolvedValue({
      data: mockRole,
    });

    render(<RoleFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create role/i });
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('e.g., moderator');
    const descriptionInput = screen.getByPlaceholderText('Optional description');
    const submitButton = screen.getByRole('button', { name: /save role/i });

    fireEvent.change(nameInput, { target: { value: '  moderator  ' } });
    fireEvent.change(descriptionInput, { target: { value: '  desc  ' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRolesApi.create).toHaveBeenCalledWith({
        name: 'moderator',
        description: 'desc',
      });
    });
  });

  it('should accept custom trigger', () => {
    render(<RoleFormDialog trigger={<button>Custom Trigger</button>} />);

    expect(screen.getByRole('button', { name: /custom trigger/i })).toBeInTheDocument();
  });
});