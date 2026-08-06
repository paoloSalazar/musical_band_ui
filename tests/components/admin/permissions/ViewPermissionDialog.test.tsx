/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ViewPermissionDialog } from '@/app/components/admin/permissions/ViewPermissionDialog';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  permissionsApi: {
    getById: vi.fn(),
  },
}));

import { permissionsApi } from '@/app/lib/api';

const mockPermissionsApi = permissionsApi as any;

describe('ViewPermissionDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not load permission when not open', () => {
    render(<ViewPermissionDialog permissionId={1} open={false} onOpenChange={() => {}} />);

    expect(mockPermissionsApi.getById).not.toHaveBeenCalled();
  });

  it('should load permission when opened with permissionId', async () => {
    const mockPermission = { id: 1, name: 'read', description: 'Can read data' };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });

    render(<ViewPermissionDialog permissionId={1} open={true} onOpenChange={() => {}} />);

    expect(mockPermissionsApi.getById).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('read')).toBeInTheDocument();
      expect(screen.getByText('Can read data')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    mockPermissionsApi.getById.mockImplementation(() => new Promise(() => {}));

    render(<ViewPermissionDialog permissionId={1} open={true} onOpenChange={() => {}} />);

    expect(screen.getByText('permissions.form.loadingPermission')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    mockPermissionsApi.getById.mockRejectedValue({
      detail: 'Permission not found',
    });

    render(<ViewPermissionDialog permissionId={1} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Permission not found')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByRole('button', { name: /permissions\.tryAgain/i });
    expect(tryAgainButton).toBeInTheDocument();
  });

  it('should display permission details correctly', async () => {
    const mockPermission = { id: 42, name: 'admin:full', description: 'Full admin access' };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });

    render(<ViewPermissionDialog permissionId={42} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('admin:full')).toBeInTheDocument();
      expect(screen.getByText('Full admin access')).toBeInTheDocument();
    });
  });

  it('should handle permission without description', async () => {
    const mockPermission = { id: 1, name: 'read', description: null };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });

    render(<ViewPermissionDialog permissionId={1} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('permissions.dialog.view.noDescription')).toBeInTheDocument();
    });
  });

  it('should reset state when dialog closes', async () => {
    const mockPermission = { id: 1, name: 'read', description: 'Can read' };

    mockPermissionsApi.getById.mockResolvedValue({
      data: mockPermission,
    });

    const { rerender } = render(<ViewPermissionDialog permissionId={1} open={true} onOpenChange={() => {}} />);

    await waitFor(() => screen.getByText('read'));

    // Close dialog
    rerender(<ViewPermissionDialog permissionId={1} open={false} onOpenChange={() => {}} />);

    expect(screen.queryByText('read')).not.toBeInTheDocument();
  });
});