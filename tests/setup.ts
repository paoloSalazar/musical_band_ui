import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage globally for all tests
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null),
    clear: vi.fn(() => null),
  },
  writable: true,
});

// Mock react-i18next globally for all component tests
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Return appropriate English translations for commonly used keys
      const translations: Record<string, string> = {
        // Common
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        
        // Events - Musician Payments
        'events.musicianPayments.addTitle': 'Record Musician Payment',
        'events.musicianPayments.addDescription': 'Record a payment for {{name}}',
        'events.musicianPayments.form.amount': 'Amount',
        'events.musicianPayments.form.paymentType': 'Payment Type',
        'events.musicianPayments.form.notes': 'Notes',
        'events.musicianPayments.form.save': 'Save Payment',
        'events.musicianPayments.paymentTypes.ADVANCE': 'ADVANCE',
        'events.musicianPayments.paymentTypes.REMAINING': 'REMAINING',
        'events.musicianPayments.paymentTypes.TOTAL': 'TOTAL',
        'events.musicianPayments.validation.invalidAmount': 'Please enter a valid amount',
        'events.musicianPayments.validation.advanceLimit': 'ADVANCE cannot exceed 50% of salary',
        'events.musicianPayments.validation.advanceTiming': 'ADVANCE payments can only be made before event start date. Event starts: {{eventStart}}, Current time: {{currentTime}}',
        'events.musicianPayments.messages.error': 'Failed to process payment',
        'events.musicianPayments.messages.remainingPaymentWithoutAdvance': 'Cannot create REMAINING payment without prior ADVANCE payments. Use TOTAL payment type instead.',
        
        // ViewMusicianPaymentsDialog
        'events.musicianPayments.viewTitle': 'Payments for {{name}}',
        'events.musicianPayments.viewDescription': 'View payment history and total amount paid to this musician',
        'events.musicianPayments.summary.salary': 'Assigned Salary',
        'events.musicianPayments.summary.totalPaid': 'Total Paid',
        'events.musicianPayments.history': 'Payment History',
        'events.musicianPayments.noPayments': 'No payments recorded yet',
      };
      
      // Return translation if found, otherwise return the key (for debugging)
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));
