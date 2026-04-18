/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePasswordDialog } from '@/app/components/profile/ChangePasswordDialog';

// Mock the profile API
vi.mock('@/app/lib/api/profile', () => ({
  profileApi: {
    changePassword: vi.fn(),
  },
}));

import { profileApi } from '@/app/lib/api/profile';

const mockProfileApi = profileApi as any;

// Mock alert
const mockAlert = vi.fn();
global.alert = mockAlert;

// Mock timers
vi.useFakeTimers();

describe('ChangePasswordDialog Component', () => {
  const mockProps = {
    userEmail: 'user@example.com',
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

  it('should render dialog with form when open', () => {
    render(<ChangePasswordDialog {...mockProps} />);

    expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument();
    expect(screen.getByText('Enter your current password and choose a new password.')).toBeInTheDocument();
    expect(screen.getByLabelText('Current')).toBeInTheDocument();
    expect(screen.getByLabelText('New')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ChangePasswordDialog {...mockProps} open={false} />);

    expect(screen.queryByRole('heading', { name: /change password/i })).not.toBeInTheDocument();
  });

  it('should initialize form fields empty when dialog opens', () => {
    render(<ChangePasswordDialog {...mockProps} />);

    expect(screen.getByLabelText('Current')).toHaveValue('');
    expect(screen.getByLabelText('New')).toHaveValue('');
    expect(screen.getByLabelText('Confirm')).toHaveValue('');
  });

  it('should handle form input changes', () => {
    render(<ChangePasswordDialog {...mockProps} />);

    const currentInput = screen.getByLabelText('Current');
    const newInput = screen.getByLabelText('New');
    const confirmInput = screen.getByLabelText('Confirm');

    fireEvent.change(currentInput, { target: { value: 'oldpass123' } });
    fireEvent.change(newInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpass123' } });

    expect(currentInput).toHaveValue('oldpass123');
    expect(newInput).toHaveValue('newpass123');
    expect(confirmInput).toHaveValue('newpass123');
  });

  it('should show validation error when passwords do not match', async () => {
    render(<ChangePasswordDialog {...mockProps} />);

    const currentInput = screen.getByLabelText('Current');
    const newInput = screen.getByLabelText('New');
    const confirmInput = screen.getByLabelText('Confirm');
    const submitButton = screen.getByRole('button', { name: /change password/i });

    fireEvent.change(currentInput, { target: { value: 'oldpass123' } });
    fireEvent.change(newInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    expect(mockProfileApi.changePassword).not.toHaveBeenCalled();
  });

  it('should show validation error when new password is too short', async () => {
    render(<ChangePasswordDialog {...mockProps} />);

    const currentInput = screen.getByLabelText('Current');
    const newInput = screen.getByLabelText('New');
    const confirmInput = screen.getByLabelText('Confirm');
    const submitButton = screen.getByRole('button', { name: /change password/i });

    fireEvent.change(currentInput, { target: { value: 'oldpass123' } });
    fireEvent.change(newInput, { target: { value: '12345' } });
    fireEvent.change(confirmInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('New password must be at least 6 characters')).toBeInTheDocument();
    expect(mockProfileApi.changePassword).not.toHaveBeenCalled();
  });

  it('should submit form successfully', async () => {
    mockProfileApi.changePassword.mockResolvedValueOnce({
      success: true,
      data: undefined,
    });

    render(<ChangePasswordDialog {...mockProps} />);

    const currentInput = screen.getByLabelText('Current');
    const newInput = screen.getByLabelText('New');
    const confirmInput = screen.getByLabelText('Confirm');
    const submitButton = screen.getByRole('button', { name: /change password/i });

    fireEvent.change(currentInput, { target: { value: 'oldpass123' } });
    fireEvent.change(newInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpass123' } });
    fireEvent.click(submitButton);

    // API should be called
    expect(mockProfileApi.changePassword).toHaveBeenCalledWith(
      'user@example.com',
      'oldpass123',
      'newpass123'
    );
  });

  // it('should handle API error', async () => {
  //   mockProfileApi.changePassword.mockRejectedValueOnce({
  //     detail: 'Current password is incorrect',
  //   });

  //   render(<ChangePasswordDialog {...mockProps} />);

  //   const currentInput = screen.getByLabelText('Current');
  //   const newInput = screen.getByLabelText('New');
  //   const confirmInput = screen.getByLabelText('Confirm');
  //   const submitButton = screen.getByRole('button', { name: /change password/i });

  //   fireEvent.change(currentInput, { target: { value: 'wrongpass' } });
  //   fireEvent.change(newInput, { target: { value: 'newpass123' } });
  //   fireEvent.change(confirmInput, { target: { value: 'newpass123' } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(screen.getByText('Current password is incorrect')).toBeInTheDocument();
  //   });

  //   expect(mockProps.onOpenChange).not.toHaveBeenCalledWith(false);
  //   expect(mockProps.onSuccess).not.toHaveBeenCalled();
  // });
});