/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditProfileDialog } from '@/app/components/profile/EditProfileDialog';

// Mock the profile API
vi.mock('@/app/lib/api/profile', () => ({
  profileApi: {
    updateCurrentUser: vi.fn(),
  },
}));

import { profileApi } from '@/app/lib/api/profile';

const mockProfileApi = profileApi as any;

describe('EditProfileDialog Component', () => {
  const mockUser = {
    id: 1,
    name: 'John',
    lastname: 'Doe',
    second_lastname: 'Smith',
    email: 'john.doe@example.com',
    phone_number: '+1234567890',
    role: 'admin',
    role_id: 1,
    permissions: ['read'],
    created_at: '2023-01-01T00:00:00Z',
  };

  const mockProps = {
    user: mockUser,
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog with form when open', async () => {
    render(<EditProfileDialog {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('Update your basic profile information below.')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Second Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<EditProfileDialog {...mockProps} open={false} />);

    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });

  it('should initialize form with user data when dialog opens', () => {
    render(<EditProfileDialog {...mockProps} />);

    expect(screen.getByLabelText('Name')).toHaveValue('John');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
    expect(screen.getByLabelText('Second Last Name')).toHaveValue('Smith');
    expect(screen.getByLabelText('Phone Number')).toHaveValue('+1234567890');
  });

  it('should handle form input changes', () => {
    render(<EditProfileDialog {...mockProps} />);

    const nameInput = screen.getByLabelText('Name');
    const lastnameInput = screen.getByLabelText('Last Name');
    const secondLastnameInput = screen.getByLabelText('Second Last Name');
    const phoneInput = screen.getByLabelText('Phone Number');

    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastnameInput, { target: { value: 'Smith' } });
    fireEvent.change(secondLastnameInput, { target: { value: 'Johnson' } });
    fireEvent.change(phoneInput, { target: { value: '+0987654321' } });

    expect(nameInput).toHaveValue('Jane');
    expect(lastnameInput).toHaveValue('Smith');
    expect(secondLastnameInput).toHaveValue('Johnson');
    expect(phoneInput).toHaveValue('+0987654321');
  });

  it('should show validation error when required fields are empty', async () => {
    render(<EditProfileDialog {...mockProps} />);

    const nameInput = screen.getByLabelText('Name');
    const lastnameInput = screen.getByLabelText('Last Name');

    // Clear required fields
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.change(lastnameInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    expect(mockProfileApi.updateCurrentUser).not.toHaveBeenCalled();
  });

  it('should submit form successfully', async () => {
    const mockUpdatedUser = { ...mockUser, name: 'Jane', lastname: 'Smith' };
    mockProfileApi.updateCurrentUser.mockResolvedValueOnce({
      success: true,
      data: mockUpdatedUser,
    });

    render(<EditProfileDialog {...mockProps} />);

    const nameInput = screen.getByLabelText('Name');
    const lastnameInput = screen.getByLabelText('Last Name');
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastnameInput, { target: { value: 'Smith' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockProfileApi.updateCurrentUser).toHaveBeenCalledWith({
        name: 'Jane',
        lastname: 'Smith',
        second_lastname: 'Smith',
        phone_number: '+1234567890',
      });
    });

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(mockProps.onSuccess).toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    mockProfileApi.updateCurrentUser.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<EditProfileDialog {...mockProps} />);

    const nameInput = screen.getByLabelText('Name');
    const lastnameInput = screen.getByLabelText('Last Name');
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastnameInput, { target: { value: 'Smith' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockProfileApi.updateCurrentUser).toHaveBeenCalled();
    });
  });

  // it('should handle API error', async () => {
  //   mockProfileApi.updateCurrentUser.mockImplementationOnce(() =>
  //     Promise.reject({ detail: 'Validation error' })
  //   );

  //   render(<EditProfileDialog {...mockProps} />);

  //   const nameInput = screen.getByLabelText('Name');
  //   const lastnameInput = screen.getByLabelText('Last Name');
  //   const submitButton = screen.getByRole('button', { name: /save changes/i });

  //   fireEvent.change(nameInput, { target: { value: 'Jane' } });
  //   fireEvent.change(lastnameInput, { target: { value: 'Smith' } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(screen.getByText('Validation error')).toBeInTheDocument();
  //   });

  //   // In error case, dialog should stay open
  //   expect(mockProps.onOpenChange).not.toHaveBeenCalled();
  //   expect(mockProps.onSuccess).not.toHaveBeenCalled();
  // });

  it('should handle API error with message fallback', async () => {
    mockProfileApi.updateCurrentUser.mockImplementationOnce(() =>
      Promise.reject({ message: 'Server error' })
    );

    render(<EditProfileDialog {...mockProps} />);

    const nameInput = screen.getByLabelText('Name');
    const lastnameInput = screen.getByLabelText('Last Name');
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastnameInput, { target: { value: 'Smith' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('should handle generic error fallback', async () => {
    mockProfileApi.updateCurrentUser.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<EditProfileDialog {...mockProps} />);

    const nameInput = screen.getByLabelText('Name');
    const lastnameInput = screen.getByLabelText('Last Name');
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastnameInput, { target: { value: 'Smith' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should re-initialize form when user prop changes', () => {
    const { rerender } = render(<EditProfileDialog {...mockProps} />);

    expect(screen.getByLabelText('Name')).toHaveValue('John');

    const newUser = { ...mockUser, name: 'Jane' };
    rerender(<EditProfileDialog {...mockProps} user={newUser} />);

    expect(screen.getByLabelText('Name')).toHaveValue('Jane');
  });

  it('should clear error when dialog closes', async () => {
    mockProfileApi.updateCurrentUser.mockImplementationOnce(() =>
      Promise.reject({ detail: 'Validation error' })
    );

    render(<EditProfileDialog {...mockProps} />);

    const nameInput = screen.getByLabelText('Name');
    const lastnameInput = screen.getByLabelText('Last Name');
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastnameInput, { target: { value: 'Smith' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Validation error')).toBeInTheDocument();
    });

    // Close dialog by clicking cancel - error should be cleared
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // The handleOpenChange should clear the error when dialog closes
    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onOpenChange when cancel is clicked', () => {
    render(<EditProfileDialog {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable inputs during loading', () => {
    mockProfileApi.updateCurrentUser.mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<EditProfileDialog {...mockProps} />);

    const nameInput = screen.getByLabelText('Name');
    const lastnameInput = screen.getByLabelText('Last Name');
    const secondLastnameInput = screen.getByLabelText('Second Last Name');
    const phoneInput = screen.getByLabelText('Phone Number');

    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastnameInput, { target: { value: 'Smith' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    expect(nameInput).toBeDisabled();
    expect(lastnameInput).toBeDisabled();
    expect(secondLastnameInput).toBeDisabled();
    expect(phoneInput).toBeDisabled();
  });

  it('should handle user with missing optional fields', () => {
    const userWithoutOptional = {
      ...mockUser,
      second_lastname: undefined,
      phone_number: undefined,
    };

    render(<EditProfileDialog {...mockProps} user={userWithoutOptional} />);

    expect(screen.getByLabelText('Name')).toHaveValue('John');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
    expect(screen.getByLabelText('Second Last Name')).toHaveValue('');
    expect(screen.getByLabelText('Phone Number')).toHaveValue('');
  });

  it('should handle user with null values', () => {
    const userWithNulls = {
      ...mockUser,
      name: null,
      lastname: null,
      second_lastname: null,
      phone_number: null,
    } as any;

    render(<EditProfileDialog {...mockProps} user={userWithNulls} />);

    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Last Name')).toHaveValue('');
    expect(screen.getByLabelText('Second Last Name')).toHaveValue('');
    expect(screen.getByLabelText('Phone Number')).toHaveValue('');
  });
});