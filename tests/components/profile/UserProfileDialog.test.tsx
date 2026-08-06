/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfileDialog } from '@/app/components/profile/UserProfileDialog';

// Mock the profile API
vi.mock('@/app/lib/api', () => ({
  profileApi: {
    getCurrentUserWithDetails: vi.fn(),
  },
}));

import { profileApi } from '@/app/lib/api';

const mockProfileApi = profileApi as any;

describe('UserProfileDialog Component', () => {
  const mockProps = {
    open: true,
    onOpenChange: vi.fn(),
  };

  const mockUser = {
    id: 1,
    name: 'John',
    lastname: 'Doe',
    second_lastname: 'Smith',
    email: 'john.doe@example.com',
    phone_number: '+1234567890',
    role: 'admin',
    role_id: 1,
    permissions: ['read', 'write'],
    created_at: '2023-01-01T00:00:00Z',
  };

  const mockDetails = [
    { id: 1, user_id: 1, detail_type: 'address', detail_value: '123 Main St' },
    { id: 2, user_id: 1, detail_type: 'city', detail_value: 'New York' },
  ];

  const mockProfileData = {
    user: mockUser,
    details: mockDetails,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog with title and description', () => {
    render(<UserProfileDialog {...mockProps} />);

    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('View your profile information')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<UserProfileDialog {...mockProps} open={false} />);

    expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
  });

  it('should show loading state initially when open', () => {
    mockProfileApi.getCurrentUserWithDetails.mockImplementation(() => new Promise(() => {}));

    render(<UserProfileDialog {...mockProps} />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should load profile data when dialog opens', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(mockProfileApi.getCurrentUserWithDetails).toHaveBeenCalledTimes(1);
    });
  });

  it('should display user profile information successfully', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe Smith')).toBeInTheDocument();
    });

    expect(screen.getByText('ID: 1')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('read')).toBeInTheDocument();
    expect(screen.getByText('write')).toBeInTheDocument();
  });

  it('should display additional details', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Additional Information')).toBeInTheDocument();
    });

    expect(screen.getByText('address')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('city')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('should display user without second_lastname', async () => {
    const userWithoutSecondName = { ...mockUser, second_lastname: undefined };
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: { user: userWithoutSecondName, details: [] },
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.queryByText('John Doe Smith')).not.toBeInTheDocument();
  });

  it('should display user without phone number', async () => {
    const userWithoutPhone = { ...mockUser, phone_number: undefined };
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: { user: userWithoutPhone, details: [] },
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe Smith')).toBeInTheDocument();
    });

    expect(screen.queryByText('Phone Number')).not.toBeInTheDocument();
  });

  it('should display user without permissions', async () => {
    const userWithoutPermissions = { ...mockUser, permissions: [] };
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: { user: userWithoutPermissions, details: [] },
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe Smith')).toBeInTheDocument();
    });

    expect(screen.queryByText('Permissions')).not.toBeInTheDocument();
  });

  it('should display user without additional details', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: { user: mockUser, details: [] },
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe Smith')).toBeInTheDocument();
    });

    expect(screen.queryByText('Additional Information')).not.toBeInTheDocument();
  });

  it('should display address icon for address type details', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });

    // Check for MapPin icon (should be present for address type)
    const mapPinIcon = document.querySelector('.lucide-map-pin');
    expect(mapPinIcon).toBeInTheDocument();
    // Verify the detail type is displayed
    expect(screen.getByText('address')).toBeInTheDocument();
  });

  it('should show error state when API fails', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: false,
      message: 'Network error',
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    expect(screen.queryByText('John Doe Smith')).not.toBeInTheDocument();
  });

  it('should show error state when API throws exception', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockRejectedValueOnce(new Error('Connection failed'));

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });

  it('should show empty state when no user data', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: { user: null, details: [] },
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('No profile data available')).toBeInTheDocument();
    });
  });

  it('should have a close button', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      const closeButtons = screen.getAllByText('Close');
      const mainCloseButton = closeButtons.find(button =>
        button.tagName === 'BUTTON' && !button.classList.contains('sr-only')
      );
      expect(mainCloseButton).toBeInTheDocument();
    });
  });

  it('should call onOpenChange when close button is clicked', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    render(<UserProfileDialog {...mockProps} />);

    await waitFor(() => {
      const closeButtons = screen.getAllByText('Close');
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    const closeButtons = screen.getAllByText('Close');
    const mainCloseButton = closeButtons.find(button =>
      button.tagName === 'BUTTON' && !button.classList.contains('sr-only')
    );
    expect(mainCloseButton).toBeInTheDocument();

    fireEvent.click(mainCloseButton!);

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should reload data when dialog reopens', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    const { rerender } = render(<UserProfileDialog {...mockProps} open={false} />);

    // Open dialog
    rerender(<UserProfileDialog {...mockProps} open={true} />);

    await waitFor(() => {
      expect(mockProfileApi.getCurrentUserWithDetails).toHaveBeenCalledTimes(1);
    });

    // Close and reopen
    rerender(<UserProfileDialog {...mockProps} open={false} />);
    rerender(<UserProfileDialog {...mockProps} open={true} />);

    await waitFor(() => {
      expect(mockProfileApi.getCurrentUserWithDetails).toHaveBeenCalledTimes(2);
    });
  });
});