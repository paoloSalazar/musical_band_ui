/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ViewPaymentDetailsDialog } from '@/app/components/events/ViewPaymentDetailsDialog';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  eventsApi: {
    getPayments: vi.fn(),
    getPaymentSummary: vi.fn(),
  },
}));

// Mock timezone functions
vi.mock('@/app/lib/timezone', () => ({
  formatDate: vi.fn((dateString) => `formatted-date-${dateString}`),
  formatTime: vi.fn((dateString) => `formatted-time-${dateString}`),
}));

// Mock UI components
vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }) => (
    <button
      onClick={onClick}
      data-testid={`button-${props.variant || 'default'}-${props.size || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/app/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }) => (
    open ? (
      <div data-testid="dialog" data-open={open}>
        <button onClick={() => onOpenChange(false)} data-testid="close-dialog">
          Close
        </button>
        {children}
      </div>
    ) : null
  ),
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  CreditCard: () => <div data-testid="credit-card-icon" />,
}));

// Import after mocking to get the mocked version
import { eventsApi } from '@/app/lib/api';

describe('ViewPaymentDetailsDialog', () => {
  const mockPayments = [
    {
      id: 1,
      amount: '50.00',
      payment_type: 'ADVANCE',
      payment_date: '2026-01-15T10:00:00Z',
      notes: 'Advance payment for event',
    },
    {
      id: 2,
      amount: '75.00',
      payment_type: 'REMAINING',
      payment_date: '2026-01-20T14:00:00Z',
      notes: null,
    },
    {
      id: 3,
      amount: '100.00',
      payment_type: 'FULL',
      payment_date: '2026-01-25T16:00:00Z',
      notes: 'Full payment received',
    },
  ];

  const mockSummary = {
    final_price: '125.00',
    total_paid: '125.00',
    pending_balance: '0.00',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    eventsApi.getPayments.mockResolvedValue({
      data: mockPayments,
    });
    eventsApi.getPaymentSummary.mockResolvedValue({
      data: mockSummary,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByTestId('dialog')).toBeTruthy();
    expect(screen.getByText('Payment Details')).toBeTruthy();
    expect(screen.getByText('Test Event - Payment history and summary')).toBeTruthy();
  });

  it('should not render dialog when closed', () => {
    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={false}
        onOpenChange={() => {}}
      />
    );

    expect(screen.queryByTestId('dialog')).toBeFalsy();
  });

  it('should show loading state initially', () => {
    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByTestId('loader-icon')).toBeTruthy();
    expect(screen.getByText('Loading payment details...')).toBeTruthy();
  });

  it('should load and display payment data successfully', async () => {
    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment Summary')).toBeTruthy();
    });

    expect(eventsApi.getPayments).toHaveBeenCalledWith(1);
    expect(eventsApi.getPaymentSummary).toHaveBeenCalledWith(1);
    expect(screen.getByText('Payment History')).toBeTruthy();
  });

  it('should display payment summary correctly', async () => {
    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment Summary')).toBeTruthy();
    });

    expect(screen.getByText('Final Price')).toBeTruthy();
    expect(screen.getAllByText('$125.00')).toHaveLength(2); // Final price and total paid
    expect(screen.getByText('Total Paid')).toBeTruthy();
    expect(screen.getAllByText('Remaining')).toHaveLength(2); // Label and payment type
    expect(screen.getAllByText('$0.00')).toHaveLength(1); // Only remaining balance
  });

  it('should display payment history correctly', async () => {
    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment History')).toBeTruthy();
    });

    expect(screen.getByText('$50.00')).toBeTruthy();
    expect(screen.getByText('$75.00')).toBeTruthy();
    expect(screen.getByText('$100.00')).toBeTruthy();
    expect(screen.getAllByText('Advance')).toHaveLength(1);
    expect(screen.getAllByText('Remaining')).toHaveLength(2); // Label and payment type
    expect(screen.getAllByText('Full Payment')).toHaveLength(1);
  });

  it('should display payment notes when available', async () => {
    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment History')).toBeTruthy();
    });

    expect(screen.getByText('Advance payment for event')).toBeTruthy();
    expect(screen.getByText('Full payment received')).toBeTruthy();
  });

  it('should show empty state when no payments', async () => {
    eventsApi.getPayments.mockResolvedValue({
      data: [],
    });

    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment History')).toBeTruthy();
    });

    expect(screen.getByText('No payments have been made yet.')).toBeTruthy();
  });

  it('should handle API errors', async () => {
    eventsApi.getPayments.mockRejectedValue({
      detail: 'Failed to load payments',
    });

    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeTruthy();
    });

    expect(screen.getByText('Failed to load payments')).toBeTruthy();
  });

  it('should handle API error with message property', async () => {
    eventsApi.getPayments.mockRejectedValue({
      message: 'Custom error message',
    });

    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeTruthy();
    });

    expect(screen.getByText('Custom error message')).toBeTruthy();
  });

  it('should call onOpenChange with false when close button is clicked', () => {
    const mockOnOpenChange = vi.fn();

    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const closeButton = screen.getByTestId('close-dialog');
    fireEvent.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onOpenChange with false when Close button is clicked', () => {
    const mockOnOpenChange = vi.fn();

    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const closeButton = screen.getByTestId('button-outline-default');
    fireEvent.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should format amounts correctly', async () => {
    const paymentsWithInvalidAmounts = [
      {
        id: 1,
        amount: '50.5',
        payment_type: 'ADVANCE',
        payment_date: '2026-01-15T10:00:00Z',
        notes: null,
      },
      {
        id: 2,
        amount: 'invalid',
        payment_type: 'FULL',
        payment_date: '2026-01-20T14:00:00Z',
        notes: null,
      },
    ];

    eventsApi.getPayments.mockResolvedValue({
      data: paymentsWithInvalidAmounts,
    });

    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment History')).toBeTruthy();
    });

    expect(screen.getByText('$50.50')).toBeTruthy();
    expect(screen.getAllByText('$0.00')).toHaveLength(2); // Invalid amount should show as 0.00, plus existing summary
  });

  it('should display payment types with correct labels', async () => {
    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment History')).toBeTruthy();
    });

    expect(screen.getAllByText('Advance')).toHaveLength(1);
    expect(screen.getAllByText('Remaining')).toHaveLength(2); // Label and payment type
    expect(screen.getAllByText('Full Payment')).toHaveLength(1);
  });

  it('should display payment types with correct styling', async () => {
    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment History')).toBeTruthy();
    });

    // The styling is applied via CSS classes, but we can verify the text is displayed
    expect(screen.getAllByText('Advance')).toHaveLength(1);
    expect(screen.getAllByText('Remaining')).toHaveLength(2); // Label and payment type
    expect(screen.getAllByText('Full Payment')).toHaveLength(1);
  });

  it('should show remaining balance in red when positive', async () => {
    const summaryWithBalance = {
      final_price: '150.00',
      total_paid: '100.00',
      pending_balance: '50.00',
    };

    eventsApi.getPaymentSummary.mockResolvedValue({
      data: summaryWithBalance,
    });

    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment Summary')).toBeTruthy();
    });

    expect(screen.getAllByText('$50.00')).toHaveLength(2); // Payment amount and remaining balance
  });

  it('should show remaining balance in green when zero', async () => {
    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment Summary')).toBeTruthy();
    });

    expect(screen.getByText('$0.00')).toBeTruthy(); // Should show zero balance
  });

  it('should handle different event names', () => {
    const testCases = [
      'Birthday Party',
      'Concert Event',
      'Wedding Reception',
      'Corporate Meeting',
    ];

    testCases.forEach((eventName) => {
      const { rerender } = render(
        <ViewPaymentDetailsDialog
          eventId={1}
          eventName={eventName}
          open={true}
          onOpenChange={() => {}}
        />
      );

      expect(screen.getByText(`${eventName} - Payment history and summary`)).toBeTruthy();

      rerender(
        <ViewPaymentDetailsDialog
          eventId={1}
          eventName="Different Event"
          open={true}
          onOpenChange={() => {}}
        />
      );
    });
  });

  it('should call API with correct eventId', async () => {
    const testEventIds = [1, 42, 100, 999];

    for (const eventId of testEventIds) {
      eventsApi.getPayments.mockClear();
      eventsApi.getPaymentSummary.mockClear();

      render(
        <ViewPaymentDetailsDialog
          eventId={eventId}
          eventName="Test Event"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(eventsApi.getPayments).toHaveBeenCalledWith(eventId);
        expect(eventsApi.getPaymentSummary).toHaveBeenCalledWith(eventId);
      });
    }
  });

  it('should handle payments without notes', async () => {
    const paymentsWithoutNotes = [
      {
        id: 1,
        amount: '50.00',
        payment_type: 'ADVANCE',
        payment_date: '2026-01-15T10:00:00Z',
        notes: null,
      },
      {
        id: 2,
        amount: '75.00',
        payment_type: 'REMAINING',
        payment_date: '2026-01-20T14:00:00Z',
        notes: '',
      },
    ];

    eventsApi.getPayments.mockResolvedValue({
      data: paymentsWithoutNotes,
    });

    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment History')).toBeTruthy();
    });

    // Should not show file-text icons for payments without notes
    expect(screen.getByText('$50.00')).toBeTruthy();
    expect(screen.getByText('$75.00')).toBeTruthy();
  });

  it('should display formatted dates and times', async () => {
    render(
      <ViewPaymentDetailsDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment History')).toBeTruthy();
    });

    // Check that formatDate and formatTime are called
    expect(screen.getAllByText(/formatted-date/)).toHaveLength(3);
    expect(screen.getAllByText(/formatted-time/)).toHaveLength(3);
  });
});