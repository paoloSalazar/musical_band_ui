/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ViewEventDialog } from '@/app/components/events/ViewEventDialog';
import { UserProvider } from '@/app/contexts/UserContext';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  eventsApi: {
    getById: vi.fn(),
    updatePrice: vi.fn(),
    getPrice: vi.fn(),
    getPaymentSummary: vi.fn(),
    getMusicianPaymentSummary: vi.fn(),
    getEventMusicians: vi.fn(),
    getEventBillingSummary: vi.fn(),
    getEventMusicianPaymentSummary: vi.fn(),
  },
}));

// Mock timezone functions
vi.mock('@/app/lib/timezone', () => ({
  formatDate: vi.fn((date) => `formatted-date-${date}`),
  formatTime: vi.fn((date) => `formatted-time-${date}`),
  formatDateHumanReadable: vi.fn((date, lang) => `formatted-date-human-${date}-${lang}`),
  formatTimeHumanReadable: vi.fn((date, lang) => `formatted-time-human-${date}-${lang}`),
  formatDateTimeHumanReadable: vi.fn((date, lang) => `formatted-datetime-human-${date}-${lang}`),
  formatDateTimeHumanReadableLocalized: vi.fn((date, lang) => `formatted-datetime-localized-${date}-${lang}`),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key, options) => {
       // Return mocked translations for common keys
       const translations = {
         'events.dialog.view.title': 'Event Details',
         'events.dialog.view.description': 'View event information',
         'events.dialog.view.loading': 'Loading event...',
         'events.dialog.view.error': 'Error',
         'events.dialog.view.date': 'Date',
         'events.dialog.view.time': 'Time',
         'events.dialog.view.allDay': 'All day event',
         'events.dialog.view.location': 'Location',
         'events.dialog.view.price': 'Price',
         'events.dialog.view.enterPrice': 'Enter price',
         'events.dialog.view.setPrice': 'Set Price',
         'events.dialog.view.noPrice': 'No price set',
         'events.dialog.view.createdBy': 'Created by',
         'events.dialog.view.editEvent': 'Edit Event',
         'events.dialog.view.manageMusicians': 'Manage Musicians',
         'events.dialog.view.paymentDetails': 'Payment Details',
         'events.dialog.view.makePayment': 'Make Payment',
         'events.dialog.view.viewMyPayments': 'View My Payments',
         'events.dialog.view.reports': 'Reports',
         'events.dialog.view.billingSummaryLabel': 'Billing Summary',
         'events.dialog.view.musicianPaymentSummaryLabel': 'Musician Payment Summary',
         'events.dialog.view.billingSummaryTitle': 'Billing Summary',
         'events.dialog.view.musicianPaymentSummaryTitle': 'Musician Payment Summary',
         'events.dialog.view.eventName': 'Event Name',
         'events.dialog.view.eventPrice': 'Event Price',
         'events.dialog.view.paymentDone': 'Payment Done',
         'events.dialog.view.remainingPayment': 'Remaining Payment',
         'events.dialog.view.sumOfMusicianSalaries': 'Sum of Musician Salaries',
         'events.dialog.view.paymentDoneToMusicians': 'Payment Done to Musicians',
         'events.dialog.view.noData': 'No data available',
         'events.status.PENDING': 'PENDING',
         'events.status.CONFIRMED': 'CONFIRMED',
         'events.status.CANCELLED': 'CANCELLED',
         'events.dialog.view.validation.invalidAmount': 'Please enter a valid number',
         'events.dialog.view.validation.priceNegative': 'Price cannot be negative',
         'events.dialog.view.failedToUpdate': 'Failed to update price',
         'events.payment.title': 'Payment Details',
         'events.payment.description': '{{eventName}} - Payment history and summary',
         'events.payment.loading': 'Loading payment details...',
         'events.payment.error': 'Error',
         'events.payment.summary.title': 'Payment Summary',
         'events.payment.summary.finalPrice': 'Final Price',
         'events.payment.summary.totalPaid': 'Total Paid',
         'events.payment.summary.remaining': 'Remaining',
         'events.payment.history.title': 'Payment History',
         'events.payment.history.noPayments': 'No payments have been made yet.',
'events.payment.ADVANCE': 'Advance Payment',
          'events.payment.REMAINING': 'Remaining Balance',
          'events.payment.TOTAL': 'Full Payment',
          'events.payment.buttons.close': 'Close',
          'common.close': 'Close',
          'common.cancel': 'Cancel',
         'events.dialog.view.musicianName': 'Musician Name',
         'events.dialog.view.role': 'Role',
         'events.dialog.view.salary': 'Salary',
       };
     const translation = translations[key] || key;
     if (options && typeof translation === 'string' && translation.includes('{{')) {
       return translation.replace('{{eventName}}', options.eventName || '');
     }
     return translation;
   }),
    i18n: {
      language: 'en',
    },
  }),
}));

// Mock useUser hook
const mockUser = {
  id: 1,
  name: 'Test User',
  hasRole: vi.fn(),
  hasPermission: vi.fn(),
};

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/app/contexts/UserContext', () => ({
  UserProvider: ({ children }) => <div data-testid="user-provider">{children}</div>,
  useUser: () => ({
    user: mockUser,
    hasRole: mockUser.hasRole,
    hasPermission: mockUser.hasPermission,
  }),
}));

afterEach(() => {
  mockUser.id = 1;
  mockUser.hasRole.mockReset();
  mockUser.hasPermission.mockReset();
});

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

// Mock dialog components
vi.mock('@/app/components/events/ViewPaymentDetailsDialog', () => ({
  ViewPaymentDetailsDialog: ({ open }) => (
    <div data-testid="view-payment-details-dialog" data-open={open}>
      Payment Details Dialog
    </div>
  ),
}));

vi.mock('@/app/components/events/MakePaymentDialog', () => ({
  MakePaymentDialog: ({ open }) => (
    <div data-testid="make-payment-dialog" data-open={open}>
      Make Payment Dialog
    </div>
  ),
}));

// Mock BillingSummaryPopup component
vi.mock('@/app/components/events/BillingSummaryPopup', () => ({
  BillingSummaryPopup: vi.fn(({ open, onOpenChange, data, loading, error }) => 
    open ? <div data-testid="billing-summary-popup" data-open={open} data-error={error}>{data?.event_name}</div> : null
  ),
}));

// Mock MusicianPaymentSummaryPopup component
vi.mock('@/app/components/events/MusicianPaymentSummaryPopup', () => ({
  MusicianPaymentSummaryPopup: vi.fn(({ open }) => 
    open ? <div data-testid="musician-summary-popup" data-open={open}>Musician Payment Summary</div> : null
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Pencil: () => <div data-testid="pencil-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  User: () => <div data-testid="user-icon" />,
  Users: () => <div data-testid="users-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  Save: () => <div data-testid="save-icon" />,
  CreditCard: () => <div data-testid="credit-card-icon" />,
  Wallet: () => <div data-testid="wallet-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  FileSignature: () => <div data-testid="file-signature-icon" />,
}));

// Mock PDF download button components
vi.mock('@/app/components/events/ReceiptDownloadButton', () => ({
  ReceiptDownloadButton: ({ 'aria-label': ariaLabel }: { ariaLabel?: string }) => (
    <button data-testid="receipt-download-button" aria-label={ariaLabel}>
      <div data-testid="file-text-icon" />
    </button>
  ),
}));

vi.mock('@/app/components/events/ContractDownloadButton', () => ({
  ContractDownloadButton: ({ 'aria-label': ariaLabel }: { ariaLabel?: string }) => (
    <button data-testid="contract-download-button" aria-label={ariaLabel}>
      <div data-testid="file-signature-icon" />
    </button>
  ),
}));

// Import after mocking to get the mocked version
import { eventsApi } from '@/app/lib/api';

// Get the mocked eventsApi
const mockEventsApi = vi.mocked(eventsApi);
describe('ViewEventDialog', () => {
  const mockEvent = {
    id: 1,
    name: 'Test Event',
    description: 'Test event description',
    place: 'Test Venue',
    start_datetime: '2026-01-15T10:00:00Z',
    end_datetime: '2026-01-15T12:00:00Z',
    price: 25.50,
    status: 'CONFIRMED',
    user_id: 1,
    is_all_day: false,
    created_by: {
      id: 1,
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEventsApi.getById.mockResolvedValue({
      data: mockEvent,
    });
    mockEventsApi.updatePrice.mockResolvedValue({
      data: { ...mockEvent, price: 30.00 },
    });
    mockEventsApi.getPrice.mockResolvedValue({
      data: 100.00,
    });
    mockUser.hasRole.mockReturnValue(false); // Regular user by default
    mockUser.hasPermission.mockReturnValue(false); // No permissions by default
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loading state initially', () => {
    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    expect(screen.getByTestId('loader-icon')).toBeTruthy();
    expect(screen.getByText('Loading event...')).toBeTruthy();
  });

  it('should load and display event successfully', async () => {
    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(mockEventsApi.getById).toHaveBeenCalledWith(1);
    expect(screen.getByText('Test event description')).toBeTruthy();
    expect(screen.getByText('Test Venue')).toBeTruthy();
    expect(screen.getByText('CONFIRMED')).toBeTruthy();
    expect(screen.getByText('25.50')).toBeTruthy();
  });

  it('should show error state when API fails', async () => {
    mockEventsApi.getById.mockRejectedValue(new Error('API Error'));

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeTruthy();
    });

    expect(screen.getByText('API Error')).toBeTruthy();
  });

  it('should display event details correctly', async () => {
    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    // Check all event details are displayed
    expect(screen.getByText('Test event description')).toBeTruthy();
    expect(screen.getByText('Test Venue')).toBeTruthy();
    // expect(screen.getByText('formatted-date-2026-01-15T10:00:00Z')).toBeTruthy();
    // expect(screen.getByText('formatted-time-2026-01-15T10:00:00Z - formatted-time-2026-01-15T12:00:00Z')).toBeTruthy();
    expect(screen.getByText('25.50')).toBeTruthy();
    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('john@example.com')).toBeTruthy();
  });

  it('should show all day event correctly', async () => {
    const allDayEvent = { ...mockEvent, is_all_day: true };
    mockEventsApi.getById.mockResolvedValue({
      data: allDayEvent,
    });

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.getByText('All day event')).toBeTruthy();
  });

  it('should show different statuses with correct colors', async () => {
    const pendingEvent = { ...mockEvent, status: 'PENDING' };
    mockEventsApi.getById.mockResolvedValue({
      data: pendingEvent,
    });

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.getByText('PENDING')).toBeTruthy();
  });

  it('should show edit button when canEditEvent is true', async () => {
    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
          canEditEvent={true}
          onEdit={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.getByText('Edit Event')).toBeTruthy();
  });

  it('should hide edit button when canEditEvent is false', async () => {
    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
          canEditEvent={false}
          onEdit={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.queryByText('Edit Event')).toBeFalsy();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const mockOnEdit = vi.fn();
    const mockOnOpenChange = vi.fn();

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={mockOnOpenChange}
          canEditEvent={true}
          onEdit={mockOnEdit}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    const editButton = screen.getByText('Edit Event');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(1);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show price editing UI for admin users', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin user

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.getByText('Set Price')).toBeTruthy();
  });

  it('should hide price editing UI for non-admin users', async () => {
    mockUser.hasRole.mockReturnValue(false); // Regular user

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.queryByText('Set Price')).toBeFalsy();
    expect(screen.getByText('25.50')).toBeTruthy();
  });

  it('should handle price editing workflow', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin user

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    // Click Set Price button
    const setPriceButton = screen.getByText('Set Price');
    fireEvent.click(setPriceButton);

    // Input should appear
    const input = screen.getByTestId('input');
    expect(input).toBeTruthy();

    // Enter new price
    fireEvent.change(input, { target: { value: '30.00' } });

    // Click save
    const saveButton = screen.getByTestId('save-icon').parentElement!;
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockEventsApi.updatePrice).toHaveBeenCalledWith(1, 30);
    });
  });

  it('should validate price input', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin user

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    // Click Set Price button
    const setPriceButton = screen.getByText('Set Price');
    fireEvent.click(setPriceButton);

    const input = screen.getByTestId('input');

    // Enter invalid price (negative)
    fireEvent.change(input, { target: { value: '-10' } });

    // Click save
    const saveButton = screen.getByTestId('save-icon').parentElement!;
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Price cannot be negative')).toBeTruthy();
    });

    expect(mockEventsApi.updatePrice).not.toHaveBeenCalled();
  });

  it('should handle price update errors', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin user
    mockEventsApi.updatePrice.mockRejectedValue({
      detail: 'Update failed',
    });

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    // Click Set Price button
    const setPriceButton = screen.getByText('Set Price');
    fireEvent.click(setPriceButton);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: '30.00' } });

    // Click save
    const saveButton = screen.getByTestId('save-icon').parentElement!;
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeTruthy();
    });
  });

  it('should call onPriceUpdate when price is successfully updated', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin user
    const mockOnPriceUpdate = vi.fn();

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
          onPriceUpdate={mockOnPriceUpdate}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    // Click Set Price button
    const setPriceButton = screen.getByText('Set Price');
    fireEvent.click(setPriceButton);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: '30.00' } });

    // Click save
    const saveButton = screen.getByTestId('save-icon').parentElement!;
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnPriceUpdate).toHaveBeenCalledWith({ ...mockEvent, price: 30.00 });
    });
  });

  it('should show payment buttons for event owner', async () => {
    mockUser.hasRole.mockReturnValue(false); // Regular user (event owner)

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.getByText('Payment Details')).toBeTruthy();
    expect(screen.getByText('Make Payment')).toBeTruthy();
  });

  it('should show payment buttons for admin', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin user

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.getByText('Payment Details')).toBeTruthy();
    expect(screen.queryByText('Make Payment')).toBeFalsy(); // Admin shouldn't see Make Payment
  });

  it('should hide payment buttons for non-owner users', async () => {
    const nonOwnerEvent = { ...mockEvent, user_id: 2 }; // Different user ID
    mockEventsApi.getById.mockResolvedValue({
      data: nonOwnerEvent,
    });
    mockUser.hasRole.mockReturnValue(false); // Regular user, not owner

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.queryByText('Payment Details')).toBeFalsy();
    expect(screen.queryByText('Make Payment')).toBeFalsy();
  });

  it('should open payment details dialog when button is clicked', async () => {
    mockUser.hasRole.mockReturnValue(false); // Regular user (event owner)

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    const paymentDetailsButton = screen.getByText('Payment Details');
    fireEvent.click(paymentDetailsButton);

    expect(screen.getByTestId('view-payment-details-dialog')).toHaveAttribute('data-open', 'true');
  });

  it('should open make payment dialog when button is clicked', async () => {
    mockUser.hasRole.mockReturnValue(false); // Regular user (event owner)

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    const makePaymentButton = screen.getByText('Make Payment');
    fireEvent.click(makePaymentButton);

    expect(screen.getByTestId('make-payment-dialog')).toHaveAttribute('data-open', 'true');
  });

  it('should handle event without description', async () => {
    const eventWithoutDesc = { ...mockEvent, description: undefined };
    mockEventsApi.getById.mockResolvedValue({
      data: eventWithoutDesc,
    });

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    // Should not show description section
    expect(screen.queryByText('Description')).toBeFalsy();
  });

  it('should handle event without price', async () => {
    const eventWithoutPrice = { ...mockEvent, price: null };
    mockEventsApi.getById.mockResolvedValue({
      data: eventWithoutPrice,
    });

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.getByText('No price set')).toBeTruthy();
  });

  it('should handle event without created_by', async () => {
    const eventWithoutCreator = { ...mockEvent, created_by: undefined };
    mockEventsApi.getById.mockResolvedValue({
      data: eventWithoutCreator,
    });

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    // Should not show created by section
    expect(screen.queryByText('Created by')).toBeFalsy();
  });

  it('should hide edit button when showEditButton is false', async () => {
    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
          canEditEvent={true}
          onEdit={() => {}}
          showEditButton={false}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.queryByText('Edit Event')).toBeFalsy();
  });

  it('should show manage musicians button for admin users', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin user
    mockUser.hasPermission.mockReturnValue(true); // Has read:event_musician permission

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
          onManageMusicians={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.getByText('Manage Musicians')).toBeTruthy();
  });

  it('should show manage musicians button for musician users', async () => {
    mockUser.hasRole.mockImplementation((role) => role === 'musician'); // Musician user
    mockUser.hasPermission.mockReturnValue(true); // Has read:event_musician permission

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
          onManageMusicians={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.getByText('Manage Musicians')).toBeTruthy();
  });

  it('should show manage musicians button for auxiliar musician users', async () => {
    mockUser.hasRole.mockImplementation((role) => role === 'auxiliar_musician'); // Auxiliar musician user
    mockUser.hasPermission.mockReturnValue(true); // Has read:event_musician permission

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
          onManageMusicians={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.getByText('Manage Musicians')).toBeTruthy();
  });

  it('should hide manage musicians button for unauthorized users', async () => {
    mockUser.hasRole.mockReturnValue(false); // Regular user
    mockUser.hasPermission.mockReturnValue(false); // No permissions

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
          onManageMusicians={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    expect(screen.queryByText('Manage Musicians')).toBeFalsy();
  });

  it('should navigate to musician management when manage musicians button is clicked', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin user
    mockUser.hasPermission.mockReturnValue(true); // Has permission
    const mockOnOpenChange = vi.fn();

    render(
      <UserProvider>
        <ViewEventDialog
          eventId={1}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeTruthy();
    });

    const manageButton = screen.getByText('Manage Musicians');
    fireEvent.click(manageButton);

     expect(mockNavigate).toHaveBeenCalledWith('/events/1/musicians');
     expect(mockOnOpenChange).toHaveBeenCalledWith(false);
   });

describe('Reports section', () => {
      it('should render Reports section with title and buttons for admin users', async () => {
        mockUser.hasRole.mockReturnValue(true); // Admin user

        render(
          <UserProvider>
            <ViewEventDialog
              eventId={1}
              open={true}
              onOpenChange={() => {}}
            />
          </UserProvider>
        );

        await waitFor(() => {
          expect(screen.getByText('Test Event')).toBeTruthy();
        });

        // Check Reports section title
        expect(screen.getAllByText('Reports')[0]).toBeTruthy();

        // Check billing and musician payment summary buttons (admin only)
        const billingButton = screen.getAllByLabelText(/billing summary/i)[0];
        const musicianButton = screen.getAllByLabelText(/musician payment summary/i)[0];
        expect(billingButton).toBeTruthy();
        expect(musicianButton).toBeTruthy();

        // Check PDF download buttons (admin AND event owner)
        expect(screen.getAllByTestId('receipt-download-button')[0]).toBeTruthy();
        expect(screen.getAllByTestId('contract-download-button')[0]).toBeTruthy();
      });

      it('should show Reports section with PDF buttons for event owner (non-admin)', async () => {
        mockUser.hasRole.mockReturnValue(false); // Regular user (event owner)
        mockUser.id = 1; // User is the event owner (event.user_id is 1)

        render(
          <UserProvider>
            <ViewEventDialog
              eventId={1}
              open={true}
              onOpenChange={() => {}}
            />
          </UserProvider>
        );

        await waitFor(() => {
          expect(screen.getByText('Test Event')).toBeTruthy();
        });

        // Reports section title should be visible
        expect(screen.getAllByText('Reports')[0]).toBeTruthy();

        // Billing and musician payment summary buttons should NOT be visible for non-admin
        expect(screen.queryAllByLabelText(/billing summary/i)).toHaveLength(0);
        expect(screen.queryAllByLabelText(/musician payment summary/i)).toHaveLength(0);

        // PDF download buttons should be visible for event owner
        expect(screen.getAllByTestId('receipt-download-button')[0]).toBeTruthy();
        expect(screen.getAllByTestId('contract-download-button')[0]).toBeTruthy();
      });

      it('should hide Reports section for non-admin and non-owner users', async () => {
        mockUser.hasRole.mockReturnValue(false); // Non-admin user
        mockUser.id = 999; // Different user ID (not owner)

        render(
          <UserProvider>
            <ViewEventDialog
              eventId={1}
              open={true}
              onOpenChange={() => {}}
            />
          </UserProvider>
        );

        await waitFor(() => {
          expect(screen.getByText('Test Event')).toBeTruthy();
        });

        // Reports section title should not be visible for non-owner
        expect(screen.queryAllByText('Reports')).toHaveLength(0);
      });

it('should have accessible labels on report buttons', async () => {
      mockUser.hasRole.mockReturnValue(true); // Admin user

      render(
        <UserProvider>
          <ViewEventDialog
            eventId={1}
            open={true}
            onOpenChange={() => {}}
          />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeTruthy();
      });

      // Check that buttons have accessible labels (aria-label or title)
      const billingButton = screen.getAllByLabelText(/billing summary/i)[0];
      expect(billingButton).toHaveAttribute('aria-label');
      
      const musicianButton = screen.getAllByLabelText(/musician payment summary/i)[0];
      expect(musicianButton).toHaveAttribute('aria-label');
    });

    it('should show PDF download buttons for admin users', async () => {
      mockUser.hasRole.mockReturnValue(true); // Admin user

      render(
        <UserProvider>
          <ViewEventDialog
            eventId={1}
            open={true}
            onOpenChange={() => {}}
          />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeTruthy();
      });

      // Check PDF download buttons are visible for admin
      expect(screen.getAllByTestId('receipt-download-button')[0]).toBeTruthy();
      expect(screen.getAllByTestId('contract-download-button')[0]).toBeTruthy();
    });

    it('should show PDF download buttons for event owner (non-admin)', async () => {
      mockUser.hasRole.mockReturnValue(false); // Regular user (event owner)
      mockUser.id = 1; // User is the event owner

      render(
        <UserProvider>
          <ViewEventDialog
            eventId={1}
            open={true}
            onOpenChange={() => {}}
          />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeTruthy();
      });

      // Check PDF download buttons are visible for event owner
      expect(screen.getAllByTestId('receipt-download-button')[0]).toBeTruthy();
      expect(screen.getAllByTestId('contract-download-button')[0]).toBeTruthy();
    });

    it('should hide PDF download buttons for non-owner users', async () => {
      mockUser.hasRole.mockReturnValue(false); // Non-admin user
      mockUser.id = 999; // Different user ID (not owner)

      render(
        <UserProvider>
          <ViewEventDialog
            eventId={1}
            open={true}
            onOpenChange={() => {}}
          />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeTruthy();
      });

      // Check PDF download buttons are NOT visible for non-owner
      expect(screen.queryAllByTestId('receipt-download-button')).toHaveLength(0);
      expect(screen.queryAllByTestId('contract-download-button')).toHaveLength(0);
});

      it('should call billing summary API and show loading state when billing button is clicked', async () => {
        mockUser.hasRole.mockReturnValue(true); // Admin user
        mockEventsApi.getEventBillingSummary.mockResolvedValue({
          data: {
            event_name: 'Test Event',
            event_price: '1000.00',
            payment_done: '500.00',
            remaining_payment: '500.00',
            sum_of_musician_salaries: '3000.00',
            payment_done_to_musicians: '1500.00'
          },
        });

        render(
          <UserProvider>
            <ViewEventDialog
              eventId={1}
              open={true}
              onOpenChange={() => {}}
            />
          </UserProvider>
        );

        await waitFor(() => {
          expect(screen.getByText('Test Event')).toBeTruthy();
        });

        // Click billing summary button
        const billingButton = screen.getAllByLabelText(/billing summary/i)[0];
        fireEvent.click(billingButton);

        // Wait for API call to be made
        await waitFor(() => {
          expect(mockEventsApi.getEventBillingSummary).toHaveBeenCalledWith(1);
        });
      });

      it('should call musician payment summary API and show loading state when musician button is clicked', async () => {
        mockUser.hasRole.mockReturnValue(true); // Admin user
        mockEventsApi.getEventMusicianPaymentSummary.mockResolvedValue({
          data: [
            {
              musician_name: 'John Doe',
              role: 'Violinist',
              salary: '500.00',
              payment_done: '250.00',
              remaining_payment: '250.00'
            },
            {
              musician_name: 'Jane Smith',
              role: 'Pianist',
              salary: '300.00',
              payment_done: '300.00',
              remaining_payment: '0.00'
            }
          ],
        });

        render(
          <UserProvider>
            <ViewEventDialog
              eventId={1}
              open={true}
              onOpenChange={() => {}}
            />
          </UserProvider>
        );

        await waitFor(() => {
          expect(screen.getByText('Test Event')).toBeTruthy();
        });

        // Click musician payment summary button
        const musicianButton = screen.getAllByLabelText(/musician payment summary/i)[0];
        fireEvent.click(musicianButton);

        // Wait for API call to be made
        await waitFor(() => {
          expect(mockEventsApi.getEventMusicianPaymentSummary).toHaveBeenCalledWith(1);
        });
      });

      it('should handle billing summary API error', async () => {
        mockUser.hasRole.mockReturnValue(true); // Admin user
        mockEventsApi.getEventBillingSummary.mockRejectedValue(
          new Error('Failed to fetch billing summary')
        );

        render(
          <UserProvider>
            <ViewEventDialog
              eventId={1}
              open={true}
              onOpenChange={() => {}}
            />
          </UserProvider>
        );

        await waitFor(() => {
          expect(screen.getByText('Test Event')).toBeTruthy();
        });

        const billingButton = screen.getAllByLabelText(/billing summary/i)[0];
        fireEvent.click(billingButton);

        // Wait for the billing summary popup to be called with error state
        await waitFor(() => {
          expect(mockEventsApi.getEventBillingSummary).toHaveBeenCalledWith(1);
        });
      });

      it('should handle musician payment summary API error', async () => {
        mockUser.hasRole.mockReturnValue(true); // Admin user
        mockEventsApi.getEventMusicianPaymentSummary.mockRejectedValue(
          new Error('Failed to fetch musician payment summary')
        );

        render(
          <UserProvider>
            <ViewEventDialog
              eventId={1}
              open={true}
              onOpenChange={() => {}}
            />
          </UserProvider>
        );

        await waitFor(() => {
          expect(screen.getByText('Test Event')).toBeTruthy();
        });

        const musicianButton = screen.getAllByLabelText(/musician payment summary/i)[0];
        fireEvent.click(musicianButton);

        // Wait for the musician payment summary popup to be called with error state
        await waitFor(() => {
          expect(mockEventsApi.getEventMusicianPaymentSummary).toHaveBeenCalledWith(1);
        });
      });
  });
});