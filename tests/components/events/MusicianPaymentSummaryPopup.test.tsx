/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MusicianPaymentSummaryPopup } from '@/app/components/events/MusicianPaymentSummaryPopup';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key) => {
      const translations: Record<string, string> = {
        'events.dialog.view.musicianPaymentSummaryTitle': 'Musician Payment Summary',
        'events.musicianManagement.table.musician': 'Musician',
        'events.musicianManagement.table.role': 'Role',
        'events.musicianManagement.table.salary': 'Salary',
        'events.dialog.view.paymentDone': 'Payment Done',
        'events.dialog.view.remainingPayment': 'Remaining Payment',
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

describe('MusicianPaymentSummaryPopup', () => {
  const mockOnOpenChange = vi.fn();

  const mockMusicianData = [
    {
      musician_name: 'John Doe',
      role: 'Violinist',
      salary: '500.00',
      payment_done: '250.00',
      remaining_payment: '250.00',
    },
    {
      musician_name: 'Jane Smith',
      role: 'Pianist',
      salary: '300.00',
      payment_done: '300.00',
      remaining_payment: '0.00',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <MusicianPaymentSummaryPopup
        open={false}
        onOpenChange={mockOnOpenChange}
        data={[]}
        loading={false}
        error={null}
      />
    );

    expect(screen.queryByTestId('dialog')).toBeFalsy();
  });

  it('should render loading state', () => {
    render(
      <MusicianPaymentSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={[]}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByTestId('loader-icon')).toBeTruthy();
  });

  it('should render error state', () => {
    render(
      <MusicianPaymentSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={[]}
        loading={false}
        error="Failed to load musician payment summary"
      />
    );

    expect(screen.getByText('Failed to load musician payment summary')).toBeTruthy();
  });

  it('should render no data message when no data', () => {
    render(
      <MusicianPaymentSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={[]}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('No data available')).toBeTruthy();
  });

  it('should render musician payment summary table with data', () => {
    render(
      <MusicianPaymentSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockMusicianData}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('Jane Smith')).toBeTruthy();
    expect(screen.getByText('Violinist')).toBeTruthy();
    expect(screen.getByText('Pianist')).toBeTruthy();
  });

  it('should render payment done in orange when underpaid', () => {
    render(
      <MusicianPaymentSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockMusicianData}
        loading={false}
        error={null}
      />
    );

    const paymentDoneElements = screen.getAllByText('250.00');
    const paymentDoneElement = paymentDoneElements.find(el => 
      el.className && el.className.includes('bg-amber-100')
    );
    expect(paymentDoneElement).toBeTruthy();
  });

  it('should render payment done in green when fully paid', () => {
    render(
      <MusicianPaymentSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockMusicianData}
        loading={false}
        error={null}
      />
    );

    const paymentDoneElements = screen.getAllByText('300.00');
    const paymentDoneElement = paymentDoneElements.find(el => 
      el.className && el.className.includes('bg-green-100')
    );
    expect(paymentDoneElement).toBeTruthy();
  });

  it('should render remaining payment in red when there is remaining balance', () => {
    render(
      <MusicianPaymentSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockMusicianData}
        loading={false}
        error={null}
      />
    );

    const remainingPaymentElements = screen.getAllByText('250.00');
    const remainingPaymentElement = remainingPaymentElements.find(el => 
      el.className && el.className.includes('bg-red-100')
    );
    expect(remainingPaymentElement).toBeTruthy();
  });

  it('should render remaining payment in gray when fully paid', () => {
    render(
      <MusicianPaymentSummaryPopup
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockMusicianData}
        loading={false}
        error={null}
      />
    );

    // 0.00 should have gray background for remaining payment
    const zeroElements = screen.getAllByText('0.00');
    const grayElement = zeroElements.find(el => 
      el.className && el.className.includes('bg-gray-100')
    );
    expect(grayElement).toBeTruthy();
  });
});