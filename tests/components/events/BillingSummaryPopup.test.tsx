/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BillingSummaryPopup } from '@/app/components/events/BillingSummaryPopup';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key) => {
      const translations: Record<string, string> = {
        'events.dialog.view.billingSummaryTitle': 'Billing Summary',
        'events.dialog.view.eventName': 'Event Name',
        'events.dialog.view.eventPrice': 'Event Price',
        'events.dialog.view.paymentDone': 'Payment Done',
        'events.dialog.view.remainingPayment': 'Remaining Payment',
        'events.dialog.view.sumOfMusicianSalaries': 'Sum of Musician Salaries',
        'events.dialog.view.paymentDoneToMusicians': 'Payment Done to Musicians',
        'events.dialog.view.noData': 'No data available',
        'common.close': 'Close',
      };
      return translations[key] || key;
    }),
    i18n: {
      language: 'en',
    },
  }),
}));

// Mock UI components
vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/app/components/ui/dialog', () => ({
  Dialog: ({ children, open }) => (open ? <div data-testid="dialog" data-open={open}>{children}</div> : null),
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon" />,
}));

describe('BillingSummaryPopup', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <BillingSummaryPopup
        open={false}
        onOpenChange={mockOnOpenChange}
        data={null}
        loading={false}
        error={null}
      />
    );

    expect(screen.queryByTestId('dialog')).toBeFalsy();
  });

  it('should render loading state', () => {
    render(
      <BillingSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={null}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByTestId('loader-icon')).toBeTruthy();
  });

  it('should render error state', () => {
    render(
      <BillingSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={null}
        loading={false}
        error="Failed to load billing summary"
      />
    );

    expect(screen.getByText('Failed to load billing summary')).toBeTruthy();
  });

  it('should render no data message when no data', () => {
    render(
      <BillingSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={null}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('No data available')).toBeTruthy();
  });

  it('should render billing summary data correctly', () => {
    const mockData = {
      event_name: 'Test Event',
      event_price: '400.00',
      payment_done: '200.00',
      remaining_payment: '200.00',
      sum_of_musician_salaries: '150.00',
      payment_done_to_musicians: '100.00',
    };

    render(
      <BillingSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockData}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('Test Event')).toBeTruthy();
    expect(screen.getAllByText('400.00')).toHaveLength(1); // Event Price - unique
    expect(screen.getAllByText('150.00')).toHaveLength(1); // Sum of Musician Salaries - unique
    expect(screen.getAllByText('100.00')).toHaveLength(1); // Payment Done to Musicians - unique
  });

  it('should render payment done in green when fully paid', () => {
    const mockData = {
      event_name: 'Test Event',
      event_price: '1000.00',
      payment_done: '1000.00',
      remaining_payment: '0.00',
      sum_of_musician_salaries: '500.00',
      payment_done_to_musicians: '500.00',
    };

    render(
      <BillingSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockData}
        loading={false}
        error={null}
      />
    );

    const paymentDoneElements = screen.getAllByText('1000.00');
    const paymentDoneElement = paymentDoneElements.find(el => 
      el.className && el.className.includes('text-green-600')
    );
    expect(paymentDoneElement).toBeTruthy();
  });

  it('should render payment done in orange when underpaid', () => {
    const mockData = {
      event_name: 'Test Event',
      event_price: '1000.00',
      payment_done: '400.00', // unique underpaid value
      remaining_payment: '600.00',
      sum_of_musician_salaries: '500.00',
      payment_done_to_musicians: '500.00',
    };

    render(
      <BillingSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockData}
        loading={false}
        error={null}
      />
    );

    const paymentDoneElements = screen.getAllByText('400.00');
    const paymentDoneElement = paymentDoneElements.find(el => 
      el.className && el.className.includes('text-amber-600')
    );
    expect(paymentDoneElement).toBeTruthy();
  });

  it('should render remaining payment in red when there is remaining balance', () => {
    const mockData = {
      event_name: 'Test Event',
      event_price: '1000.00',
      payment_done: '400.00',
      remaining_payment: '600.00', // unique remaining value
      sum_of_musician_salaries: '500.00',
      payment_done_to_musicians: '500.00',
    };

    render(
      <BillingSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockData}
        loading={false}
        error={null}
      />
    );

    const remainingPaymentElements = screen.getAllByText('600.00');
    const remainingPaymentElement = remainingPaymentElements.find(el => 
      el.className && el.className.includes('text-red-600')
    );
    expect(remainingPaymentElement).toBeTruthy();
  });

  it('should render payment done to musicians in green when fully paid to musicians', () => {
    const mockData = {
      event_name: 'Test Event',
      event_price: '1000.00',
      payment_done: '1000.00',
      remaining_payment: '0.00',
      sum_of_musician_salaries: '700.00', // unique value
      payment_done_to_musicians: '700.00', // matches salary
    };

    render(
      <BillingSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockData}
        loading={false}
        error={null}
      />
    );

    const paymentToMusiciansElements = screen.getAllByText('700.00');
    const paymentToMusiciansElement = paymentToMusiciansElements.find(el => 
      el.className && el.className.includes('text-green-600')
    );
    expect(paymentToMusiciansElement).toBeTruthy();
  });

  it('should render payment done to musicians in orange when underpaid to musicians', () => {
    const mockData = {
      event_name: 'Test Event',
      event_price: '1000.00',
      payment_done: '1000.00',
      remaining_payment: '0.00',
      sum_of_musician_salaries: '500.00',
      payment_done_to_musicians: '250.00',
    };

    render(
      <BillingSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockData}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('250.00')).toBeTruthy();
    const elements250 = screen.getAllByText('250.00');
    const amberElement = elements250.find(el => 
      el.className && el.className.includes('text-amber-600')
    );
    expect(amberElement).toBeTruthy();
  });
});