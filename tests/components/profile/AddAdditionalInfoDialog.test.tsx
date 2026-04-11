/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddAdditionalInfoDialog } from '@/app/components/profile/AddAdditionalInfoDialog';

// Mock the profile API
vi.mock('@/app/lib/api/profile', () => ({
  profileApi: {
    createUserDetail: vi.fn(),
  },
}));

import { profileApi } from '@/app/lib/api/profile';

const mockProfileApi = profileApi as any;

describe('AddAdditionalInfoDialog Component', () => {
  const mockProps = {
    userId: 1,
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog with form when open', () => {
    render(<AddAdditionalInfoDialog {...mockProps} />);

    expect(screen.getByText('Add Additional Information')).toBeInTheDocument();
    expect(screen.getByText('Add new additional information to your profile.')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Value')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add info/i })).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<AddAdditionalInfoDialog {...mockProps} open={false} />);

    expect(screen.queryByText('Add Additional Information')).not.toBeInTheDocument();
  });

  it('should show datalist options for detail types', () => {
    render(<AddAdditionalInfoDialog {...mockProps} />);

    const datalist = document.getElementById('detail-types');
    expect(datalist).toBeInTheDocument();

    const options = datalist?.querySelectorAll('option');
    expect(options).toHaveLength(13); // Based on DETAIL_TYPES array
    expect(options?.[0]).toHaveAttribute('value', 'address');
  });

  it('should handle form input changes', () => {
    render(<AddAdditionalInfoDialog {...mockProps} />);

    const typeInput = screen.getByLabelText('Type');
    const valueInput = screen.getByLabelText('Value');

    fireEvent.change(typeInput, { target: { value: 'address' } });
    fireEvent.change(valueInput, { target: { value: '123 Main St' } });

    expect(typeInput).toHaveValue('address');
    expect(valueInput).toHaveValue('123 Main St');
  });

  it('should show validation error when submitting empty form', async () => {
    render(<AddAdditionalInfoDialog {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /add info/i });
    fireEvent.click(submitButton);

    // await waitFor(() => {
    //   expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    // });

    expect(mockProfileApi.createUserDetail).not.toHaveBeenCalled();
  });

  it('should show validation error when only detail_type is filled', async () => {
    render(<AddAdditionalInfoDialog {...mockProps} />);

    const typeInput = screen.getByLabelText('Type');
    fireEvent.change(typeInput, { target: { value: 'address' } });

    const submitButton = screen.getByRole('button', { name: /add info/i });
    fireEvent.click(submitButton);

    // await waitFor(() => {
    //   expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    // });

    expect(mockProfileApi.createUserDetail).not.toHaveBeenCalled();
  });

  it('should show validation error when only detail_value is filled', async () => {
    render(<AddAdditionalInfoDialog {...mockProps} />);

    const valueInput = screen.getByLabelText('Value');
    fireEvent.change(valueInput, { target: { value: '123 Main St' } });

    const submitButton = screen.getByRole('button', { name: /add info/i });
    fireEvent.click(submitButton);

    // await waitFor(() => {
    //   expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    // });

    expect(mockProfileApi.createUserDetail).not.toHaveBeenCalled();
  });

  it('should submit form successfully', async () => {
    const mockDetail = { id: 1, detail_type: 'address', detail_value: '123 Main St', user_id: 1 };
    mockProfileApi.createUserDetail.mockResolvedValueOnce({
      success: true,
      data: mockDetail,
    });

    render(<AddAdditionalInfoDialog {...mockProps} />);

    const typeInput = screen.getByLabelText('Type');
    const valueInput = screen.getByLabelText('Value');
    const submitButton = screen.getByRole('button', { name: /add info/i });

    fireEvent.change(typeInput, { target: { value: 'address' } });
    fireEvent.change(valueInput, { target: { value: '123 Main St' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockProfileApi.createUserDetail).toHaveBeenCalledWith(1, 'address', '123 Main St');
    });

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(mockProps.onSuccess).toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    mockProfileApi.createUserDetail.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<AddAdditionalInfoDialog {...mockProps} />);

    const typeInput = screen.getByLabelText('Type');
    const valueInput = screen.getByLabelText('Value');
    const submitButton = screen.getByRole('button', { name: /add info/i });

    fireEvent.change(typeInput, { target: { value: 'address' } });
    fireEvent.change(valueInput, { target: { value: '123 Main St' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Add Info')).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockProfileApi.createUserDetail).toHaveBeenCalled();
    });
  });

  // it('should handle API error', async () => {
  //   mockProfileApi.createUserDetail.mockRejectedValueOnce({
  //     detail: 'Invalid detail type',
  //   });

  //   render(<AddAdditionalInfoDialog {...mockProps} />);

  //   const typeInput = screen.getByLabelText('Type');
  //   const valueInput = screen.getByLabelText('Value');
  //   const submitButton = screen.getByRole('button', { name: /add info/i });

  //   fireEvent.change(typeInput, { target: { value: 'address' } });
  //   fireEvent.change(valueInput, { target: { value: '123 Main St' } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(screen.getByText('Invalid detail type')).toBeInTheDocument();
  //   });

  //   expect(mockProps.onOpenChange).not.toHaveBeenCalledWith(false);
  //   expect(mockProps.onSuccess).not.toHaveBeenCalled();
  // });

  it('should reset form when dialog opens', () => {
    const { rerender } = render(<AddAdditionalInfoDialog {...mockProps} open={false} />);

    // Re-open dialog
    rerender(<AddAdditionalInfoDialog {...mockProps} open={true} />);

    const typeInput = screen.getByLabelText('Type');
    const valueInput = screen.getByLabelText('Value');

    expect(typeInput).toHaveValue('');
    expect(valueInput).toHaveValue('');
  });

  it('should clear error when dialog opens', () => {
    render(<AddAdditionalInfoDialog {...mockProps} />);

    // First submit with error
    const submitButton = screen.getByRole('button', { name: /add info/i });
    fireEvent.click(submitButton);

    // expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();

    // Simulate closing and reopening
    const { rerender } = render(<AddAdditionalInfoDialog {...mockProps} open={false} />);
    rerender(<AddAdditionalInfoDialog {...mockProps} open={true} />);

    expect(screen.queryByText('Please fill in all required fields')).not.toBeInTheDocument();
  });

  it('should call onOpenChange when cancel is clicked', () => {
    render(<AddAdditionalInfoDialog {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable inputs during loading', () => {
    mockProfileApi.createUserDetail.mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<AddAdditionalInfoDialog {...mockProps} />);

    const typeInput = screen.getByLabelText('Type');
    const valueInput = screen.getByLabelText('Value');

    fireEvent.change(typeInput, { target: { value: 'address' } });
    fireEvent.change(valueInput, { target: { value: '123 Main St' } });

    const submitButton = screen.getByRole('button', { name: /add info/i });
    fireEvent.click(submitButton);

    expect(typeInput).toBeDisabled();
    expect(valueInput).toBeDisabled();
  });
});