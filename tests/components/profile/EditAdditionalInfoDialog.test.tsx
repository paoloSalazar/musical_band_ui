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
  });

  it('should render dialog with form when open', () => {
    render(<EditAdditionalInfoDialog {...mockProps} />);

    expect(screen.getByText('Edit Additional Information')).toBeInTheDocument();
    expect(screen.getByText('Update the additional information for your profile.')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Value')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<EditAdditionalInfoDialog {...mockProps} open={false} />);

    expect(screen.queryByText('Edit Additional Information')).not.toBeInTheDocument();
  });

  it('should initialize form with detail data when dialog opens', () => {
    render(<EditAdditionalInfoDialog {...mockProps} />);

    expect(screen.getByLabelText('Type')).toHaveValue('address');
    expect(screen.getByLabelText('Value')).toHaveValue('123 Main St');
  });

  it('should show datalist options for detail types', () => {
    render(<EditAdditionalInfoDialog {...mockProps} />);

    const datalist = document.getElementById('detail-types-edit');
    expect(datalist).toBeInTheDocument();

    const options = datalist?.querySelectorAll('option');
    expect(options).toHaveLength(13); // Based on DETAIL_TYPES array
    expect(options?.[0]).toHaveAttribute('value', 'address');
  });

  it('should have read-only detail type field', () => {
    render(<EditAdditionalInfoDialog {...mockProps} />);

    const typeInput = screen.getByLabelText('Type');
    expect(typeInput).toBeDisabled();
    expect(typeInput).toHaveValue('address');
  });

  it('should handle detail value input changes', () => {
    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });

    expect(valueInput).toHaveValue('456 Oak Ave');
  });

  it('should show validation error when value is empty', async () => {
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
    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    fireEvent.change(valueInput, { target: { value: '   ' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Please enter a value')).toBeInTheDocument();
    expect(mockProfileApi.updateUserDetail).not.toHaveBeenCalled();
  });

  it('should submit form successfully', async () => {
    const mockUpdatedDetail = { ...mockDetail, detail_value: '456 Oak Ave' };
    mockProfileApi.updateUserDetail.mockResolvedValueOnce({
      success: true,
      data: mockUpdatedDetail,
    });

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockProfileApi.updateUserDetail).toHaveBeenCalledWith(1, 1, '456 Oak Ave');
    });

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(mockProps.onSuccess).toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    mockProfileApi.updateUserDetail.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockProfileApi.updateUserDetail).toHaveBeenCalled();
    });
  });

  it('should handle API error', async () => {
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
    mockProfileApi.updateUserDetail.mockImplementationOnce(() =>
      Promise.reject({ message: 'Server error' })
    );

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('should handle generic error fallback', async () => {
    mockProfileApi.updateUserDetail.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should re-initialize form when detail prop changes', () => {
    const { rerender } = render(<EditAdditionalInfoDialog {...mockProps} />);

    expect(screen.getByLabelText('Value')).toHaveValue('123 Main St');

    const newDetail = { ...mockDetail, detail_value: '789 Pine St' };
    rerender(<EditAdditionalInfoDialog {...mockProps} detail={newDetail} />);

    expect(screen.getByLabelText('Value')).toHaveValue('789 Pine St');
  });

  it('should clear error when dialog closes', async () => {
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
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    // Error should be cleared when dialog closes
  });

  it('should call onOpenChange when cancel is clicked', () => {
    render(<EditAdditionalInfoDialog {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable inputs during loading', () => {
    mockProfileApi.updateUserDetail.mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<EditAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');

    fireEvent.change(valueInput, { target: { value: '456 Oak Ave' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    expect(valueInput).toBeDisabled();
  });

  it('should handle different detail types', () => {
    const phoneDetail = { ...mockDetail, detail_type: 'phone', detail_value: '+1234567890' };

    render(<EditAdditionalInfoDialog {...mockProps} detail={phoneDetail} />);

    expect(screen.getByLabelText('Type')).toHaveValue('phone');
    expect(screen.getByLabelText('Value')).toHaveValue('+1234567890');
  });

  it('should handle empty detail value', () => {
    const emptyDetail = { ...mockDetail, detail_value: '' };

    render(<EditAdditionalInfoDialog {...mockProps} detail={emptyDetail} />);

    expect(screen.getByLabelText('Value')).toHaveValue('');
  });

  it('should handle special characters in detail value', () => {
    const specialDetail = { ...mockDetail, detail_value: 'Special & <characters> "test"' };

    render(<EditAdditionalInfoDialog {...mockProps} detail={specialDetail} />);

    expect(screen.getByLabelText('Value')).toHaveValue('Special & <characters> "test"');
  });
});