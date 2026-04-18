/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteAdditionalInfoDialog } from '@/app/components/profile/DeleteAdditionalInfoDialog';

// Mock the profile API
vi.mock('@/app/lib/api/profile', () => ({
  profileApi: {
    deleteUserDetail: vi.fn(),
  },
}));

import { profileApi } from '@/app/lib/api/profile';

const mockProfileApi = profileApi as any;

// Mock alert
const mockAlert = vi.fn();
global.alert = mockAlert;

describe('DeleteAdditionalInfoDialog Component', () => {
  const mockDetail = {
    id: 1,
    user_id: 1,
    detail_type: 'address',
    detail_value: '123 Main St',
  };

  const mockProps = {
    userId: 1,
    detail: mockDetail,
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockAlert.mockClear();
  });

  it('should render alert dialog with confirmation message when open', () => {
    render(<DeleteAdditionalInfoDialog {...mockProps} />);

    expect(screen.getByText('Delete Additional Information')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete the "address" information\?/)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<DeleteAdditionalInfoDialog {...mockProps} open={false} />);

    expect(screen.queryByText('Delete Additional Information')).not.toBeInTheDocument();
  });

  it('should delete successfully', async () => {
    mockProfileApi.deleteUserDetail.mockResolvedValueOnce({
      success: true,
      data: undefined,
    });

    render(<DeleteAdditionalInfoDialog {...mockProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockProfileApi.deleteUserDetail).toHaveBeenCalledWith(1, 1);
    });

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(mockProps.onSuccess).toHaveBeenCalled();
  });

  it('should handle API error', async () => {
    mockProfileApi.deleteUserDetail.mockRejectedValueOnce({
      detail: 'Detail not found',
    });

    render(<DeleteAdditionalInfoDialog {...mockProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Detail not found');
    });

    expect(mockProps.onSuccess).not.toHaveBeenCalled();
  });
});