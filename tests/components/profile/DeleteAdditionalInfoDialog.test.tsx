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

// Mock react-i18next
const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

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
    // Reset the t function mock
    mockT.mockImplementation((key: string) => key);
  });

  afterEach(() => {
    mockAlert.mockClear();
  });

  it('should render alert dialog with confirmation message when open', () => {
    // Set up mock translations
    mockT.mockImplementation((key: string, options?: any) => {
      const translations = {
        'profile.deleteAdditionalInfo.title': 'Delete Additional Information',
        'profile.deleteAdditionalInfo.description': 'Are you sure you want to delete the "{{detailType}}" information? This action cannot be undone.',
        'profile.deleteAdditionalInfo.buttons.cancel': 'Cancel',
        'profile.deleteAdditionalInfo.buttons.delete': 'Delete',
      };
      if (key === 'profile.deleteAdditionalInfo.description') {
        return 'Are you sure you want to delete the "address" information? This action cannot be undone.';
      }
      return translations[key] || key;
    });

    render(<DeleteAdditionalInfoDialog {...mockProps} />);

    expect(screen.getByText('Delete Additional Information')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete the "address" information? This action cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.deleteAdditionalInfo.title': 'Delete Additional Information',
      };
      return translations[key] || key;
    });

    render(<DeleteAdditionalInfoDialog {...mockProps} open={false} />);

    expect(screen.queryByText('Delete Additional Information')).not.toBeInTheDocument();
  });

  it('should delete successfully', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.deleteAdditionalInfo.buttons.delete': 'Delete',
      };
      return translations[key] || key;
    });

    mockProfileApi.deleteUserDetail.mockResolvedValueOnce({
      success: true,
      data: undefined,
    });

    render(<DeleteAdditionalInfoDialog {...mockProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockProfileApi.deleteUserDetail).toHaveBeenCalledWith(1, 1);
    });

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(mockProps.onSuccess).toHaveBeenCalled();
  });

  it('should handle API error', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.deleteAdditionalInfo.buttons.delete': 'Delete',
      };
      return translations[key] || key;
    });

    mockProfileApi.deleteUserDetail.mockRejectedValueOnce({
      detail: 'Detail not found',
    });

    render(<DeleteAdditionalInfoDialog {...mockProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Detail not found');
    });

    expect(mockProps.onSuccess).not.toHaveBeenCalled();
  });

  it('should handle API error with fallback message', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.deleteAdditionalInfo.buttons.delete': 'Delete',
        'profile.deleteAdditionalInfo.error.failed': 'Failed to delete additional info',
      };
      return translations[key] || key;
    });

    // Mock an error without detail or message properties
    const errorWithoutMessage = {};
    mockProfileApi.deleteUserDetail.mockRejectedValueOnce(errorWithoutMessage);

    render(<DeleteAdditionalInfoDialog {...mockProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to delete additional info');
    });

    expect(mockProps.onSuccess).not.toHaveBeenCalled();
  });
});