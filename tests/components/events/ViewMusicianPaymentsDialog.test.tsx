import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ViewMusicianPaymentsDialog } from '@/app/components/events/ViewMusicianPaymentsDialog';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  eventsApi: {
    getMusicianPayments: vi.fn(),
    getMusicianPaymentSummary: vi.fn(),
  },
}));

// Import after mocking to get the mocked version
import { eventsApi } from '@/app/lib/api';

const mockEventsApi = vi.mocked(eventsApi);

describe('ViewMusicianPaymentsDialog', () => {
  const defaultProps = {
    eventId: 10,
    musicianId: 5,
    musicianName: 'John Doe',
    open: true,
    onOpenChange: vi.fn(),
  };

  it('should render payment history list and summary', async () => {
    // Mock API responses
    mockEventsApi.getMusicianPayments.mockResolvedValue({
      success: true,
      data: [
        { id: 1, amount: 50, payment_type: 'ADVANCE', payment_date: '2026-01-15', notes: 'First payment' },
        { id: 2, amount: 50, payment_type: 'REMAINING', payment_date: '2026-01-20', notes: 'Final payment' },
      ],
    });
    
    mockEventsApi.getMusicianPaymentSummary.mockResolvedValue({
      success: true,
      data: { total_paid: 100, payment_count: 2 },
    });

    render(<ViewMusicianPaymentsDialog {...defaultProps} />);
    expect(await screen.findByText(/payment history/i)).toBeInTheDocument();
    expect(await screen.findByText(/total paid/i)).toBeInTheDocument();
    expect(await screen.findByText('100.00')).toBeInTheDocument();

 });
});
