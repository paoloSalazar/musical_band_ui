import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventMusicianTable } from '@/app/components/events/EventMusicianTable';
import type { EventMusician } from '@/app/lib/types';
import { UserProvider } from '@/app/contexts/UserContext';

// Mock useUser to return admin
vi.mock('@/app/contexts/UserContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useUser: () => ({
      user: { id: 1, name: 'Admin' },
      hasRole: (role: string) => role === 'admin',
      hasPermission: () => true,
    }),
  };
});

const mockMusicians: EventMusician[] = [
  {
    id: 1,
    event_id: 10,
    musician_id: 5,
    role: 'Guitarist',
    salary: 1000,
    payment_status: 'PENDING',
    musician_name: 'John',
    musician_lastname: 'Doe',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
];

describe('EventMusicianTable - Payment Actions', () => {
  it('should render Record Payment and View Payments buttons for admins', () => {
    const onRecordPayment = vi.fn();
    const onViewPayments = vi.fn();

    render(
      <EventMusicianTable
        musicians={mockMusicians}
        onRecordPayment={onRecordPayment}
        onViewPayments={onViewPayments}
      />
    );

    expect(screen.getByLabelText(/record payment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/view payments/i)).toBeInTheDocument();
  });

  it('should call onRecordPayment when Record Payment button is clicked', () => {
    const onRecordPayment = vi.fn();
    const onViewPayments = vi.fn();

    render(
      <EventMusicianTable
        musicians={mockMusicians}
        onRecordPayment={onRecordPayment}
        onViewPayments={onViewPayments}
      />
    );

    const recordBtn = screen.getByLabelText(/record payment/i);
    fireEvent.click(recordBtn);

    expect(onRecordPayment).toHaveBeenCalledWith(5); // musician_id
  });
});
