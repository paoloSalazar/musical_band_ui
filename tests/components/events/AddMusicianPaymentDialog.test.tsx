import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddMusicianPaymentDialog } from '@/app/components/events/AddMusicianPaymentDialog';

describe('AddMusicianPaymentDialog', () => {
  const defaultProps = {
    eventId: 10,
    musicianId: 5,
    musicianName: 'John Doe',
    salary: 1000,
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields: amount, payment_type, notes', () => {
    render(<AddMusicianPaymentDialog {...defaultProps} />);

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByText(/payment type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('should show validation error when amount exceeds 50% for ADVANCE', async () => {
    render(<AddMusicianPaymentDialog {...defaultProps} />);

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '600' } }); // > 50% of 1000

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/cannot exceed 50%/i)).toBeInTheDocument();
  });
});
