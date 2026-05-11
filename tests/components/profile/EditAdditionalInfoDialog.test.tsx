/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditAdditionalInfoDialog } from '@/app/components/profile/EditAdditionalInfoDialog';

// Mock the profile API
vi.mock('@/app/lib/api/profile', () => ({
  profileApi: {
    updateUserDetail: vi.fn(),
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

describe('EditAdditionalInfoDialog Component', () => {
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

  it('should render dialog with form when open', () => {
    // Set up mock translations
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.title': 'Edit Additional Information',
        'profile.editAdditionalInfo.description': 'Update the additional information for your profile.',
        'profile.editAdditionalInfo.fields.type': 'Type',
        'profile.editAdditionalInfo.fields.value': 'Value',
        'profile.editAdditionalInfo.buttons.cancel': 'Cancel',
        'profile.editAdditionalInfo.buttons.saveChanges': 'Save Changes',
      };
      return translations[key] || key;
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    expect(screen.getByText('Edit Additional Information')).toBeInTheDocument();
    expect(screen.getByText('Update the additional information for your profile.')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Value')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.title': 'Edit Additional Information',
      };
      return translations[key] || key;
    });

    render(<EditAdditionalInfoDialog {...mockProps} open={false} />);

    expect(screen.queryByText('Edit Additional Information')).not.toBeInTheDocument();
  });

  it('should initialize form with detail data when dialog opens', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.type': 'Type',
        'profile.editAdditionalInfo.fields.value': 'Value',
      };
      return translations[key] || key;
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    expect(screen.getByLabelText('Type')).toHaveValue('address');
    expect(screen.getByLabelText('Value')).toHaveValue('123 Main St');
  });

  it('should show datalist options for detail types', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.addAdditionalInfo.detailTypes.address': 'Address',
        'profile.addAdditionalInfo.detailTypes.address1': 'Address Line 1',
        'profile.addAdditionalInfo.detailTypes.address2': 'Address Line 2',
        'profile.addAdditionalInfo.detailTypes.city': 'City',
        'profile.addAdditionalInfo.detailTypes.state': 'State/Province',
        'profile.addAdditionalInfo.detailTypes.country': 'Country',
        'profile.addAdditionalInfo.detailTypes.postal_code': 'Postal Code',
        'profile.addAdditionalInfo.detailTypes.phone': 'Phone',
        'profile.addAdditionalInfo.detailTypes.bio': 'Biography',
        'profile.addAdditionalInfo.detailTypes.website': 'Website',
        'profile.addAdditionalInfo.detailTypes.linkedin': 'LinkedIn',
        'profile.addAdditionalInfo.detailTypes.twitter': 'Twitter',
        'profile.addAdditionalInfo.detailTypes.instagram': 'Instagram',
      };
      return translations[key] || key;
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const datalist = document.getElementById('detail-types-edit');
    expect(datalist).toBeInTheDocument();

    const options = datalist?.querySelectorAll('option');
    expect(options).toHaveLength(13); // Based on DETAIL_TYPES array
    expect(options?.[0]).toHaveAttribute('value', 'address');
    expect(options?.[0]).toHaveTextContent('Address');
  });

  it('should have read-only detail type field', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.type': 'Type',
      };
      return translations[key] || key;
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const typeInput = screen.getByLabelText('Type');
    expect(typeInput).toBeDisabled();
    expect(typeInput).toHaveValue('address');
  });

  it('should handle detail value input changes', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
      };
      return translations[key] || key;
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });

    expect(valueInput).toHaveValue('456 Oak Ave');
  });

  it('should show validation error when value is empty', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
        'profile.editAdditionalInfo.error.fillFields': 'Please enter a value',
      };
      return translations[key] || key;
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    const form = valueInput.closest('form');

    fireEvent.change(valueInput, { target: { value: '' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Please enter a value')).toBeInTheDocument();
    });
    expect(mockProfileApi.updateUserDetail).not.toHaveBeenCalled();
  });

  it('should show validation error when value is only whitespace', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
        'profile.editAdditionalInfo.error.fillFields': 'Please enter a value',
        'profile.editAdditionalInfo.buttons.saveChanges': 'Save Changes',
      };
      return translations[key] || key;
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    fireEvent.change(valueInput, { target: { value: '   ' } });

    const submitButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(submitButton);

    expect(screen.getByText('Please enter a value')).toBeInTheDocument();
    expect(mockProfileApi.updateUserDetail).not.toHaveBeenCalled();
  });

  it('should submit form successfully', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
        'profile.editAdditionalInfo.buttons.saveChanges': 'Save Changes',
      };
      return translations[key] || key;
    });

    const mockUpdatedDetail = { ...mockDetail, detail_value: '456 Oak Ave' };
    mockProfileApi.updateUserDetail.mockResolvedValueOnce({
      success: true,
      data: mockUpdatedDetail,
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    const submitButton = screen.getByRole('button', { name: 'Save Changes' });

    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockProfileApi.updateUserDetail).toHaveBeenCalledWith(1, 1, '456 Oak Ave');
    });

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(mockProps.onSuccess).toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
        'profile.editAdditionalInfo.buttons.saveChanges': 'Save Changes',
        'profile.editAdditionalInfo.buttons.cancel': 'Cancel',
      };
      return translations[key] || key;
    });

    mockProfileApi.updateUserDetail.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    const submitButton = screen.getByRole('button', { name: 'Save Changes' });

    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockProfileApi.updateUserDetail).toHaveBeenCalled();
    });
  });

  it('should handle API error', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
      };
      return translations[key] || key;
    });

    mockProfileApi.updateUserDetail.mockRejectedValueOnce({
      detail: 'Validation error'
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    const form = valueInput.closest('form');

    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Validation error')).toBeInTheDocument();
    });
  });

  it('should handle API error with message fallback', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
        'profile.editAdditionalInfo.buttons.saveChanges': 'Save Changes',
      };
      return translations[key] || key;
    });

    mockProfileApi.updateUserDetail.mockImplementationOnce(() =>
      Promise.reject({ message: 'Server error' })
    );

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    const submitButton = screen.getByRole('button', { name: 'Save Changes' });

    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('should handle generic error fallback', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
        'profile.editAdditionalInfo.buttons.saveChanges': 'Save Changes',
      };
      return translations[key] || key;
    });

    mockProfileApi.updateUserDetail.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    const submitButton = screen.getByRole('button', { name: 'Save Changes' });

    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should re-initialize form when detail prop changes', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
      };
      return translations[key] || key;
    });

    const { rerender } = render(<EditAdditionalInfoDialog {...mockProps} />);

    expect(screen.getByLabelText('Value')).toHaveValue('123 Main St');

    const newDetail = { ...mockDetail, detail_value: '789 Pine St' };
    rerender(<EditAdditionalInfoDialog {...mockProps} detail={newDetail} />);

    expect(screen.getByLabelText('Value')).toHaveValue('789 Pine St');
  });

  it('should clear error when dialog closes', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
        'profile.editAdditionalInfo.error.fillFields': 'Please enter a value',
        'profile.editAdditionalInfo.buttons.cancel': 'Cancel',
      };
      return translations[key] || key;
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    // First submit with error
    const valueInput = screen.getByLabelText('Value');
    const form = valueInput.closest('form');

    fireEvent.change(valueInput, { target: { value: '' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Please enter a value')).toBeInTheDocument();
    });

    // Simulate closing dialog
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    // Error should be cleared when dialog closes
  });

  it('should call onOpenChange when cancel is clicked', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.buttons.cancel': 'Cancel',
      };
      return translations[key] || key;
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable inputs during loading', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
        'profile.editAdditionalInfo.buttons.saveChanges': 'Save Changes',
      };
      return translations[key] || key;
    });

    mockProfileApi.updateUserDetail.mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');

    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });

    const submitButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(submitButton);

    expect(valueInput).toBeDisabled();
  });

  it('should handle different detail types', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.type': 'Type',
        'profile.editAdditionalInfo.fields.value': 'Value',
      };
      return translations[key] || key;
    });

    const phoneDetail = { ...mockDetail, detail_type: 'phone', detail_value: '+1234567890' };

    render(<EditAdditionalInfoDialog {...mockProps} detail={phoneDetail} />);

    expect(screen.getByLabelText('Type')).toHaveValue('phone');
    expect(screen.getByLabelText('Value')).toHaveValue('+1234567890');
  });

  it('should handle empty detail value', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
      };
      return translations[key] || key;
    });

    const emptyDetail = { ...mockDetail, detail_value: '' };

    render(<EditAdditionalInfoDialog {...mockProps} detail={emptyDetail} />);

    expect(screen.getByLabelText('Value')).toHaveValue('');
  });

  it('should handle special characters in detail value', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'profile.editAdditionalInfo.fields.value': 'Value',
      };
      return translations[key] || key;
    });

    const specialDetail = { ...mockDetail, detail_value: 'Special & <characters> "test"' };

    render(<EditAdditionalInfoDialog {...mockProps} detail={specialDetail} />);

    expect(screen.getByLabelText('Value')).toHaveValue('Special & <characters> "test"');
  });
});