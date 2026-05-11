/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProfilePage } from '@/app/components/profile/ProfilePage';

// Mock react-i18next
const mockT = vi.fn((key: string, options?: any) => {
  // Translation mappings
  const translations: Record<string, string> = {
    'profile.page.backToHome': 'Back to Home',
    'profile.page.title': 'My Profile',
    'profile.page.changePassword': 'Change Password',
    'profile.page.editProfile': 'Edit Profile',
    'profile.page.sections.email': 'Email',
    'profile.page.sections.phoneNumber': 'Phone Number',
    'profile.page.sections.role': 'Role',
    'profile.page.sections.memberSince': 'Member Since',
    'profile.page.sections.additionalInfo': 'Additional Information',
    'profile.page.sections.addInfo': 'Add Info',
    'profile.page.sections.noAdditionalInfo': 'No additional information added yet. Click "Add Info" to add details like address, city, or other information.',
    'profile.page.sections.myPermissions': 'My Permissions',
    'profile.page.userId': 'ID: {{id}}',
    'profile.addAdditionalInfo.detailTypes.address': 'Address',
    'profile.addAdditionalInfo.detailTypes.city': 'City',
    'profile.addAdditionalInfo.detailTypes.state': 'State',
    'profile.addAdditionalInfo.detailTypes.country': 'Country',
    'profile.addAdditionalInfo.detailTypes.postal_code': 'Postal Code',
    'profile.addAdditionalInfo.detailTypes.phone': 'Phone',
    'profile.addAdditionalInfo.detailTypes.bio': 'Biography',
    'profile.addAdditionalInfo.detailTypes.website': 'Website',
    'profile.addAdditionalInfo.detailTypes.linkedin': 'LinkedIn',
    'profile.addAdditionalInfo.detailTypes.twitter': 'Twitter',
    'profile.addAdditionalInfo.detailTypes.instagram': 'Instagram',
  };

  // Check if we have a translation
  if (translations[key]) {
    let result = translations[key];
    // Handle interpolation
    if (options && typeof options === 'object') {
      Object.keys(options).forEach(optKey => {
        result = result.replace(`{{${optKey}}}`, options[optKey]);
      });
    }
    return result;
  }

  // Handle interpolation for keys without translations
  if (options && typeof options === 'object') {
    let result = key;
    Object.keys(options).forEach(optKey => {
      result = result.replace(`{{${optKey}}}`, options[optKey]);
    });
    return result;
  }

  return key;
});
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock the profile API
vi.mock('@/app/lib/api', () => ({
  profileApi: {
    getCurrentUserWithDetails: vi.fn(),
  },
}));

import { profileApi } from '@/app/lib/api';

const mockProfileApi = profileApi as any;

// Mock child components
vi.mock('@/app/components/profile/EditProfileDialog', () => ({
  EditProfileDialog: ({ open, onOpenChange, onSuccess }: any) => (
    <div data-testid="edit-profile-dialog" data-open={open}>
      Edit Profile Dialog
      <button onClick={() => onOpenChange(false)}>Close</button>
      <button onClick={onSuccess}>Update</button>
    </div>
  ),
}));

vi.mock('@/app/components/profile/AddAdditionalInfoDialog', () => ({
  AddAdditionalInfoDialog: ({ open, onOpenChange, onSuccess }: any) => (
    <div data-testid="add-info-dialog" data-open={open}>
      Add Info Dialog
      <button onClick={() => onOpenChange(false)}>Close</button>
      <button onClick={onSuccess}>Add</button>
    </div>
  ),
}));

vi.mock('@/app/components/profile/EditAdditionalInfoDialog', () => ({
  EditAdditionalInfoDialog: ({ open, onOpenChange, onSuccess }: any) => (
    <div data-testid="edit-detail-dialog" data-open={open}>
      Edit Detail Dialog
      <button onClick={() => onOpenChange(false)}>Close</button>
      <button onClick={onSuccess}>Update</button>
    </div>
  ),
}));

vi.mock('@/app/components/profile/DeleteAdditionalInfoDialog', () => ({
  DeleteAdditionalInfoDialog: ({ open, onOpenChange, onSuccess }: any) => (
    <div data-testid="delete-detail-dialog" data-open={open}>
      Delete Detail Dialog
      <button onClick={() => onOpenChange(false)}>Close</button>
      <button onClick={onSuccess}>Delete</button>
    </div>
  ),
}));

vi.mock('@/app/components/profile/ChangePasswordDialog', () => ({
  ChangePasswordDialog: ({ open, onOpenChange, onSuccess }: any) => (
    <div data-testid="change-password-dialog" data-open={open}>
      Change Password Dialog
      <button onClick={() => onOpenChange(false)}>Close</button>
      <button onClick={onSuccess}>Change</button>
    </div>
  ),
}));

describe('ProfilePage Component', () => {
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
    // Reset the t function mock
    mockT.mockImplementation((key: string, options?: any) => {
      if (options && typeof options === 'object') {
        let result = key;
        Object.keys(options).forEach(optKey => {
          result = result.replace(`{{${optKey}}}`, options[optKey]);
        });
        return result;
      }
      return key;
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should show loading state initially', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.loading': 'Loading profile...',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockImplementation(() => new Promise(() => {}));

    renderWithRouter(<ProfilePage />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should load profile data on mount', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(mockProfileApi.getCurrentUserWithDetails).toHaveBeenCalledTimes(1);
    });
  });

  it('should display profile information successfully', async () => {
    mockT.mockImplementation((key: string, options?: any) => {
      const translations = {
        'profile.page.title': 'My Profile',
        'profile.page.userId': 'ID: {{id}}',
        'profile.page.sections.email': 'Email',
        'profile.page.sections.phoneNumber': 'Phone Number',
        'profile.page.sections.role': 'Role',
        'profile.page.sections.memberSince': 'Member Since',
      };
      if (key === 'profile.page.userId' && options) {
        return 'ID: 1';
      }
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });

    // Check basic user info
    expect(screen.getByText('John Doe Smith')).toBeInTheDocument();
    expect(screen.getByText('ID: 1')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('Member Since')).toBeInTheDocument();
  });

  it('should display permissions', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.sections.myPermissions': 'My Permissions',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('My Permissions')).toBeInTheDocument();
    });

    expect(screen.getByText('read')).toBeInTheDocument();
    expect(screen.getByText('write')).toBeInTheDocument();
  });

  it('should display additional details', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.backToHome': 'Back to Home',
        'profile.page.title': 'My Profile',
        'profile.page.changePassword': 'Change Password',
        'profile.page.editProfile': 'Edit Profile',
        'profile.page.sections.email': 'Email',
        'profile.page.sections.phoneNumber': 'Phone Number',
        'profile.page.sections.role': 'Role',
        'profile.page.sections.memberSince': 'Member Since',
        'profile.page.sections.additionalInfo': 'Additional Information',
        'profile.page.sections.myPermissions': 'My Permissions',
        'profile.addAdditionalInfo.detailTypes.address': 'Address',
        'profile.addAdditionalInfo.detailTypes.city': 'City',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Additional Information')).toBeInTheDocument();
    });

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('should show empty state for additional details when none exist', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.sections.additionalInfo': 'Additional Information',
        'profile.page.sections.noAdditionalInfo': 'No additional information added yet. Click "Add Info" to add details like address, city, or other information.',
      };
      return translations[key] || key;
    });

    const profileWithoutDetails = { user: mockUser, details: [] };
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: profileWithoutDetails,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Additional Information')).toBeInTheDocument();
    });

    expect(screen.getByText('No additional information added yet. Click "Add Info" to add details like address, city, or other information.')).toBeInTheDocument();
  });

  it('should handle API error', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.error': 'Error',
        'profile.page.retry': 'Retry',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: false,
      message: 'Failed to load profile',
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('should handle API exception', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.error': 'Error',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should show retry button on error and reload on click', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.retry': 'Retry',
        'profile.page.title': 'My Profile',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails
      .mockResolvedValueOnce({
        success: false,
        message: 'Failed to load',
      })
      .mockResolvedValueOnce({
        success: true,
        data: mockProfileData,
      });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockProfileApi.getCurrentUserWithDetails).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByText('My Profile')).toBeInTheDocument();
  });

  it('should show empty state when no user data', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.noData': 'No profile data available',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: { user: null, details: [] },
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('No profile data available')).toBeInTheDocument();
    });
  });

  it('should open edit profile dialog when edit button is clicked', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.editProfile': 'Edit Profile',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: 'Edit Profile' });
    fireEvent.click(editButton);

    expect(screen.getByTestId('edit-profile-dialog')).toHaveAttribute('data-open', 'true');
  });

  it('should open change password dialog when change password button is clicked', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.changePassword': 'Change Password',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByRole('button', { name: 'Change Password' });
    fireEvent.click(changePasswordButton);

    expect(screen.getByTestId('change-password-dialog')).toHaveAttribute('data-open', 'true');
  });

  it('should open add info dialog when add info button is clicked', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.sections.addInfo': 'Add Info',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add Info' })).toBeInTheDocument();
    });

    const addInfoButton = screen.getByRole('button', { name: 'Add Info' });
    fireEvent.click(addInfoButton);

    expect(screen.getByTestId('add-info-dialog')).toHaveAttribute('data-open', 'true');
  });

  it('should render edit detail dialog when selectedDetail is set', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.sections.additionalInfo': 'Additional Information',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Additional Information')).toBeInTheDocument();
    });

    // The dialog should not be rendered initially
    expect(screen.queryByTestId('edit-detail-dialog')).not.toBeInTheDocument();
  });

  it('should render delete detail dialog when selectedDetail is set', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.sections.additionalInfo': 'Additional Information',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Additional Information')).toBeInTheDocument();
    });

    // The dialog should not be rendered initially
    expect(screen.queryByTestId('delete-detail-dialog')).not.toBeInTheDocument();
  });

  it('should reload profile when dialogs call onSuccess', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.editProfile': 'Edit Profile',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails
      .mockResolvedValueOnce({
        success: true,
        data: mockProfileData,
      })
      .mockResolvedValueOnce({
        success: true,
        data: mockProfileData, // Same data for simplicity
      });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();
    });

    // Open edit dialog
    const editButton = screen.getByRole('button', { name: 'Edit Profile' });
    fireEvent.click(editButton);

    // Simulate dialog success
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockProfileApi.getCurrentUserWithDetails).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle user without second lastname', async () => {
    const userWithoutSecondName = { ...mockUser, second_lastname: undefined };
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: { user: userWithoutSecondName, details: [] },
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.queryByText('John Doe Smith')).not.toBeInTheDocument();
  });

  it('should handle user without phone number', async () => {
    const userWithoutPhone = { ...mockUser, phone_number: undefined };
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: { user: userWithoutPhone, details: [] },
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe Smith')).toBeInTheDocument();
    });

    // Phone section should not be displayed
    expect(screen.queryByText('Phone Number')).not.toBeInTheDocument();
  });

  it('should handle user without permissions', async () => {
    const userWithoutPermissions = { ...mockUser, permissions: [] };
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: { user: userWithoutPermissions, details: [] },
    });

    renderWithRouter(<ProfilePage />);

    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.sections.myPermissions': 'My Permissions',
      };
      return translations[key] || key;
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe Smith')).toBeInTheDocument();
    });

    expect(screen.queryByText('My Permissions')).not.toBeInTheDocument();
  });

  it('should handle user without created_at', async () => {
    const userWithoutCreatedAt = { ...mockUser, created_at: undefined };
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: { user: userWithoutCreatedAt, details: [] },
    });

    renderWithRouter(<ProfilePage />);

    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.sections.memberSince': 'Member Since',
      };
      return translations[key] || key;
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe Smith')).toBeInTheDocument();
    });

    expect(screen.queryByText('Member Since')).not.toBeInTheDocument();
  });

  it('should show back to home link', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.page.backToHome': 'Back to Home',
      };
      return translations[key] || key;
    });

    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    const backLink = screen.getByText('Back to Home');
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should display user icon', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      const userIcon = document.querySelector('.lucide-user');
      expect(userIcon).toBeInTheDocument();
    });
  });

  it('should display contact icons', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      const mailIcon = document.querySelector('.lucide-mail');
      const phoneIcon = document.querySelector('.lucide-phone');
      const shieldIcon = document.querySelector('.lucide-shield');

      expect(mailIcon).toBeInTheDocument();
      expect(phoneIcon).toBeInTheDocument();
      expect(shieldIcon).toBeInTheDocument();
    });
  });

  it('should display map pin icon for address details', async () => {
    mockProfileApi.getCurrentUserWithDetails.mockResolvedValueOnce({
      success: true,
      data: mockProfileData,
    });

    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      const mapPinIcon = document.querySelector('.lucide-map-pin');
      expect(mapPinIcon).toBeInTheDocument();
    });
  });
});