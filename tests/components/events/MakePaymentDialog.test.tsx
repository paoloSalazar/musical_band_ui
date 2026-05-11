/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MakePaymentDialog } from '@/app/components/events/MakePaymentDialog';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  eventsApi: {
    getPaymentSummary: vi.fn(),
    createPayment: vi.fn(),
  },
  translatePaymentError: vi.fn((message) => message), // Return message as-is for tests
}));

// Mock UI components
vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-${props.variant || 'default'}-${props.size || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/app/components/ui/input', () => ({
  Input: ({ value, onChange, disabled, ...props }) => (
    <input
      value={value}
      onChange={onChange}
      disabled={disabled}
      data-testid="input"
      {...props}
    />
  ),
}));

vi.mock('@/app/components/ui/label', () => ({
  Label: ({ children, ...props }) => <label {...props}>{children}</label>,
}));

vi.mock('@/app/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, disabled, ...props }) => (
    <textarea
      value={value}
      onChange={onChange}
      disabled={disabled}
      data-testid="textarea"
      {...props}
    />
  ),
}));

vi.mock('@/app/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }) => (
    <div data-testid="select" data-value={value}>
      {children}
      <button
        data-testid="select-trigger"
        onClick={() => onValueChange?.('REMAINING')}
      />
    </div>
  ),
  SelectContent: ({ children }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }) => (
    <option data-testid={`select-item-${value}`} value={value}>
      {children}
    </option>
  ),
  SelectTrigger: ({ children, ...props }) => (
    <button data-testid="select-trigger" {...props}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
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
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key, options) => {
      // Return mocked translations for common keys
      const translations = {
        'events.makePayment.title': 'Make Payment',
        'events.makePayment.description': '{{eventName}} - Record a payment for this event',
        'events.makePayment.loadingSummary': 'Loading summary...',
        'events.makePayment.summary.finalPrice': 'Final Price:',
        'events.makePayment.summary.totalPaid': 'Total Paid:',
        'events.makePayment.summary.remainingBalance': 'Remaining Balance:',
        'events.makePayment.warning': 'Payment summary not available. Please ensure the event price has been set.',
        'events.makePayment.form.paymentType': 'Payment Type',
        'events.makePayment.form.paymentTypePlaceholder': 'Select payment type',
        'events.makePayment.form.amount': 'Amount ($)',
        'events.makePayment.form.notes': 'Notes (optional)',
        'events.makePayment.form.notesPlaceholder': 'Add any notes about this payment...',
        'events.makePayment.paymentTypes.ADVANCE': 'Advance Payment',
        'events.makePayment.paymentTypes.REMAINING': 'Remaining Balance',
        'events.makePayment.paymentTypes.TOTAL': 'Full Payment',
        'events.makePayment.descriptions.ADVANCE': 'A partial payment towards the total',
        'events.makePayment.descriptions.REMAINING': 'Pays the full remaining balance',
        'events.makePayment.descriptions.TOTAL': 'Pays the entire remaining balance',
        'events.makePayment.validation.invalidAmount': 'Please enter a valid amount greater than 0',
        'events.makePayment.validation.exceedsBalance': 'Amount cannot exceed the remaining balance of ${{balance}}',
        'events.makePayment.buttons.cancel': 'Cancel',
        'events.makePayment.buttons.submitPayment': 'Submit Payment',
        'events.makePayment.failedToCreate': 'Failed to create payment',
      };
      const translation = translations[key] || key;
      if (options && typeof translation === 'string') {
        return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => options[key] || match);
      }
      return translation;
    }),
  }),
}));

// Import after mocking to get the mocked version
import { eventsApi } from '@/app/lib/api';

describe('MakePaymentDialog', () => {
  const mockSummary = {
    final_price: '150.00',
    total_paid: '50.00',
    pending_balance: '100.00',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    eventsApi.getPaymentSummary.mockResolvedValue({
      data: mockSummary,
    });
    eventsApi.createPayment.mockResolvedValue({
      data: { id: 1 },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByTestId('dialog')).toBeTruthy();
    expect(screen.getByText('Make Payment')).toBeTruthy();
    expect(screen.getByText('Test Event - Record a payment for this event')).toBeTruthy();
  });

  it('should not render dialog when closed', () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={false}
        onOpenChange={() => {}}
      />
    );

    expect(screen.queryByTestId('dialog')).toBeFalsy();
  });

  it('should load and display payment summary', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    expect(eventsApi.getPaymentSummary).toHaveBeenCalledWith(1);
    expect(screen.getByText('Final Price:')).toBeTruthy();
    expect(screen.getByText('$150.00')).toBeTruthy();
    expect(screen.getByText('Total Paid:')).toBeTruthy();
    expect(screen.getByText('$50.00')).toBeTruthy();
    expect(screen.getByText('Remaining Balance:')).toBeTruthy();
    expect(screen.getByText('$100.00')).toBeTruthy();
  });

  it('should show loading state for payment summary', () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText('Loading summary...')).toBeTruthy();
  });

  it('should show warning when payment summary is not available', async () => {
    eventsApi.getPaymentSummary.mockRejectedValue(new Error('Summary not found'));

    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment summary not available. Please ensure the event price has been set.')).toBeTruthy();
    });

    expect(screen.getByTestId('alert-circle-icon')).toBeTruthy();
  });

  it('should have all required form fields', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    expect(screen.getByText('Payment Type')).toBeTruthy();
    expect(screen.getByText('Amount ($)')).toBeTruthy();
    expect(screen.getByText('Notes (optional)')).toBeTruthy();
  });

  it('should show payment type options', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    expect(screen.getByText('Advance Payment')).toBeTruthy();
    expect(screen.getByText('Remaining Balance')).toBeTruthy();
    expect(screen.getByText('Full Payment')).toBeTruthy();
  });

  it('should show default payment type as ADVANCE', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    expect(screen.getByText('A partial payment towards the total')).toBeTruthy();
  });



  it('should validate amount - must be greater than 0', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '0' } });

    const submitButton = screen.getByText('Submit Payment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid amount greater than 0')).toBeTruthy();
    });
  });

  it('should validate amount - cannot exceed remaining balance for ADVANCE', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '150.00' } }); // More than remaining $100

    const submitButton = screen.getByText('Submit Payment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Amount cannot exceed the remaining balance of $100.00')).toBeTruthy();
    });
  });

  it('should create payment successfully with valid data', async () => {
    const mockOnPaymentSuccess = vi.fn();
    const mockOnOpenChange = vi.fn();

    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={mockOnOpenChange}
        onPaymentSuccess={mockOnPaymentSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    const notesInput = document.getElementById('notes') as HTMLTextAreaElement;

    fireEvent.change(amountInput, { target: { value: '50.00' } });
    fireEvent.change(notesInput, { target: { value: 'Test payment notes' } });

    const submitButton = screen.getByText('Submit Payment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventsApi.createPayment).toHaveBeenCalledWith(1, {
        event_id: 1,
        user_id: 1,
        amount: 50,
        payment_type: 'ADVANCE',
        notes: 'Test payment notes',
      });
    });

    expect(mockOnPaymentSuccess).toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should create payment with empty notes', async () => {
    const mockOnPaymentSuccess = vi.fn();

    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
        onPaymentSuccess={mockOnPaymentSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '25.00' } });

    const submitButton = screen.getByText('Submit Payment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventsApi.createPayment).toHaveBeenCalledWith(1, {
        event_id: 1,
        user_id: 1,
        amount: 25,
        payment_type: 'ADVANCE',
        notes: undefined,
      });
    });
  });

  it('should handle API errors during payment creation', async () => {
    eventsApi.createPayment.mockRejectedValue({
      detail: 'Payment creation failed',
    });

    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '25.00' } });

    const submitButton = screen.getByText('Submit Payment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Payment creation failed')).toBeTruthy();
    });

    expect(eventsApi.createPayment).toHaveBeenCalled();
  });

  it('should handle generic API error', async () => {
    eventsApi.createPayment.mockRejectedValue(new Error('Network error'));

    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '25.00' } });

    const submitButton = screen.getByText('Submit Payment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeTruthy();
    });
  });

  it('should show loading state during payment submission', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '25.00' } });

    const submitButton = screen.getByText('Submit Payment');
    fireEvent.click(submitButton);

    // Should show loading spinner
    expect(screen.getByTestId('loader-icon')).toBeTruthy();
    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button when amount is empty', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    const submitButton = screen.getByText('Submit Payment');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when amount is entered', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '25.00' } });

    const submitButton = screen.getByText('Submit Payment');
    expect(submitButton).not.toBeDisabled();
  });



  it('should show payment type descriptions correctly', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    expect(screen.getByText('A partial payment towards the total')).toBeTruthy();
  });



  it('should handle negative amount input', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '-10.00' } });

    const submitButton = screen.getByText('Submit Payment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid amount greater than 0')).toBeTruthy();
    });
  });

  it('should call API with correct parameters', async () => {
    const mockOnPaymentSuccess = vi.fn();

    render(
      <MakePaymentDialog
        eventId={42}
        eventName="Test Event"
        userId={99}
        open={true}
        onOpenChange={() => {}}
        onPaymentSuccess={mockOnPaymentSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    const notesInput = document.getElementById('notes') as HTMLTextAreaElement;

    fireEvent.change(amountInput, { target: { value: '75.00' } });
    fireEvent.change(notesInput, { target: { value: 'Payment notes' } });

    const submitButton = screen.getByText('Submit Payment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventsApi.createPayment).toHaveBeenCalledWith(42, {
        event_id: 42,
        user_id: 99,
        amount: 75,
        payment_type: 'ADVANCE',
        notes: 'Payment notes',
      });
    });
  });

  it('should display dollar sign icon in amount input', async () => {
    render(
      <MakePaymentDialog
        eventId={1}
        eventName="Test Event"
        userId={1}
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
    });

    expect(screen.getByTestId('dollar-sign-icon')).toBeTruthy();
  });
});