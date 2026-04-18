/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PermissionFormDialog } from '@/app/components/admin/permissions/PermissionFormDialog';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  permissionsApi: {
    create: vi.fn(),
  },
}));

import { permissionsApi } from '@/app/lib/api';

const mockPermissionsApi = permissionsApi as any;

describe('PermissionFormDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render trigger button', () => {
    render(<PermissionFormDialog />);

    expect(screen.getByRole('button', { name: /create permission/i })).toBeInTheDocument();
  });

  it('should open dialog when trigger clicked', () => {
    render(<PermissionFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create permission/i });
    fireEvent.click(triggerButton);

    expect(screen.getByText('Create New Permission')).toBeInTheDocument();
  });

  it('should show validation error for empty name', async () => {
    render(<PermissionFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create permission/i });
    fireEvent.click(triggerButton);

    const submitButton = screen.getByRole('button', { name: /save permission/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Permission name is required')).toBeInTheDocument();
  });

  it('should submit form successfully', async () => {
    const mockPermission = { id: 1, name: 'read:events', description: 'Can read events' };
    mockPermissionsApi.create.mockResolvedValue({
      data: mockPermission,
    });

    const onSuccess = vi.fn();

    render(<PermissionFormDialog onSuccess={onSuccess} />);

    const triggerButton = screen.getByRole('button', { name: /create permission/i });
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('e.g., read:events');
    const descriptionInput = screen.getByPlaceholderText('Optional description');
    const submitButton = screen.getByRole('button', { name: /save permission/i });

    fireEvent.change(nameInput, { target: { value: 'read:events' } });
    fireEvent.change(descriptionInput, { target: { value: 'Can read events' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPermissionsApi.create).toHaveBeenCalledWith({
        name: 'read:events',
        description: 'Can read events',
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockPermission);

    // Dialog should be closed
    expect(screen.queryByText('Create New Permission')).not.toBeInTheDocument();
  });

  it('should show loading state during submit', async () => {
    mockPermissionsApi.create.mockImplementation(() => new Promise(() => {}));

    render(<PermissionFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create permission/i });
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('e.g., read:events');
    const submitButton = screen.getByRole('button', { name: /save permission/i });

    fireEvent.change(nameInput, { target: { value: 'read' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Save Permission')).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should handle API error', async () => {
    mockPermissionsApi.create.mockRejectedValue({
      detail: 'Permission already exists',
    });

    render(<PermissionFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create permission/i });
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('e.g., read:events');
    const submitButton = screen.getByRole('button', { name: /save permission/i });

    fireEvent.change(nameInput, { target: { value: 'read' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Permission already exists')).toBeInTheDocument();
    });
  });

  it('should reset form when dialog closes', async () => {
    render(<PermissionFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create permission/i });
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('e.g., read:events');
    fireEvent.change(nameInput, { target: { value: 'test' } });

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Reopen
    fireEvent.click(triggerButton);

    const newNameInput = screen.getByPlaceholderText('e.g., read:events');
    await waitFor(() => {
      expect(newNameInput).toHaveValue('');
    });
  });

  it('should trim whitespace from inputs', async () => {
    const mockPermission = { id: 1, name: 'read', description: 'desc' };
    mockPermissionsApi.create.mockResolvedValue({
      data: mockPermission,
    });

    render(<PermissionFormDialog />);

    const triggerButton = screen.getByRole('button', { name: /create permission/i });
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('e.g., read:events');
    const descriptionInput = screen.getByPlaceholderText('Optional description');
    const submitButton = screen.getByRole('button', { name: /save permission/i });

    fireEvent.change(nameInput, { target: { value: '  read  ' } });
    fireEvent.change(descriptionInput, { target: { value: '  desc  ' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPermissionsApi.create).toHaveBeenCalledWith({
        name: 'read',
        description: 'desc',
      });
    });
  });

  it('should accept custom trigger', () => {
    render(<PermissionFormDialog trigger={<button>Custom Trigger</button>} />);

    expect(screen.getByRole('button', { name: /custom trigger/i })).toBeInTheDocument();
  });
});