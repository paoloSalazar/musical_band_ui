import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ViewMusicianPaymentsDialog } from '@/app/components/events/ViewMusicianPaymentsDialog';

describe('ViewMusicianPaymentsDialog', () => {
  const defaultProps = {
    eventId: 10,
    musicianId: 5,
    musicianName: 'John Doe',
    open: true,
    onOpenChange: vi.fn(),
  };

  it('should render payment history list and summary', () => {
    render(<ViewMusicianPaymentsDialog {...defaultProps} />);

    expect(screen.getByText('Payment History')).toBeInTheDocument();
    expect(screen.getByText('Total Paid')).toBeInTheDocument();
  });
});
