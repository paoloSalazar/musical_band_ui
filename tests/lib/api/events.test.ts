/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventsApi, type PaginatedEventsResponse } from '@/app/lib/api/events';
import { apiClient } from '@/app/lib/api/client';
import type { Event, EventFormData, Payment, PaymentSummary, PaymentFormData, PaymentType } from '@/app/lib/types';

describe('eventsApi', () => {
  let mockGet: ReturnType<typeof vi.fn>;
  let mockPost: ReturnType<typeof vi.fn>;
  let mockPatch: ReturnType<typeof vi.fn>;
  let mockPut: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGet = vi.fn();
    mockPost = vi.fn();
    mockPatch = vi.fn();
    mockPut = vi.fn();
    mockDelete = vi.fn();
    
    (apiClient as any).get = mockGet;
    (apiClient as any).post = mockPost;
    (apiClient as any).patch = mockPatch;
    (apiClient as any).put = mockPut;
    (apiClient as any).delete = mockDelete;
  });

  describe('list', () => {
    it('should fetch paginated events with default pagination', async () => {
      const mockResponse = {
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          total_pages: 0,
        } as PaginatedEventsResponse,
        success: true,
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await eventsApi.list();

      expect(mockGet).toHaveBeenCalledWith('/events/?page=1&limit=10');
      expect(result.data.items).toEqual([]);
    });

    it('should fetch paginated events with custom pagination', async () => {
      const mockEvent: Event = {
        id: 1,
        name: 'Test Event',
        place: 'Test Place',
        start_datetime: '2026-04-01T10:00:00Z',
        end_datetime: '2026-04-01T12:00:00Z',
        is_all_day: false,
        user_id: 1,
        status: 'active',
        created_by: {
          user_id: 1,
          name: 'Test',
          lastname: 'User',
          email: 'test@example.com',
        },
      };

      const mockResponse = {
        data: {
          items: [mockEvent],
          total: 1,
          page: 2,
          limit: 5,
          total_pages: 1,
        } as PaginatedEventsResponse,
        success: true,
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await eventsApi.list(2, 5);

      expect(mockGet).toHaveBeenCalledWith('/events/?page=2&limit=5');
      expect(result.data.total).toBe(1);
    });
  });

  describe('listForCalendar', () => {
    it('should fetch events for calendar view', async () => {
      const mockEvent: Event = {
        id: 1,
        name: 'Event 1',
        place: 'Place 1',
        start_datetime: '2026-04-01T10:00:00Z',
        end_datetime: '2026-04-01T12:00:00Z',
        is_all_day: false,
        user_id: 1,
        status: 'active',
        created_by: {
          user_id: 1,
          name: 'Test',
          lastname: 'User',
          email: 'test@example.com',
        },
      };

      mockGet.mockResolvedValue({
        data: [mockEvent],
        success: true,
      });

      const result = await eventsApi.listForCalendar(2026, 4);

      expect(mockGet).toHaveBeenCalledWith('/events/calendar?year=2026&month=4');
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should fetch a single event by ID', async () => {
      const mockEvent: Event = {
        id: 1,
        name: 'Test Event',
        place: 'Test Place',
        start_datetime: '2026-04-01T10:00:00Z',
        end_datetime: '2026-04-01T12:00:00Z',
        is_all_day: false,
        user_id: 1,
        status: 'active',
        created_by: {
          user_id: 1,
          name: 'Test',
          lastname: 'User',
          email: 'test@example.com',
        },
      };

      mockGet.mockResolvedValue({
        data: mockEvent,
        success: true,
      });

      const result = await eventsApi.getById(1);

      expect(mockGet).toHaveBeenCalledWith('/events/1');
      expect(result.data.name).toBe('Test Event');
    });
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const eventData: EventFormData = {
        name: 'New Event',
        place: 'New Place',
        start_datetime: '2026-04-01T10:00:00Z',
        end_datetime: '2026-04-01T12:00:00Z',
        is_all_day: false,
        price: 50,
      };

      const createdEvent: Event = {
        id: 1,
        ...eventData,
        user_id: 1,
        status: 'active',
        created_by: {
          user_id: 1,
          name: 'Test',
          lastname: 'User',
          email: 'test@example.com',
        },
      };

      mockPost.mockResolvedValue({
        data: createdEvent,
        success: true,
      });

      const result = await eventsApi.create(eventData);

      expect(mockPost).toHaveBeenCalledWith('/events/', eventData);
      expect(result.data.id).toBe(1);
    });
  });

  describe('update', () => {
    it('should update an event (partial)', async () => {
      const updateData: Partial<EventFormData> = {
        name: 'Updated Title',
        price: 75,
      };

      const updatedEvent: Event = {
        id: 1,
        name: 'Updated Title',
        place: 'Test Place',
        start_datetime: '2026-04-01T10:00:00Z',
        end_datetime: '2026-04-01T12:00:00Z',
        is_all_day: false,
        price: 75,
        user_id: 1,
        status: 'active',
        created_by: {
          user_id: 1,
          name: 'Test',
          lastname: 'User',
          email: 'test@example.com',
        },
      };

      mockPatch.mockResolvedValue({
        data: updatedEvent,
        success: true,
      });

      const result = await eventsApi.update(1, updateData);

      expect(mockPatch).toHaveBeenCalledWith('/events/1', updateData);
      expect(result.data.name).toBe('Updated Title');
    });
  });

  describe('replace', () => {
    it('should replace an event (full update)', async () => {
      const eventData: EventFormData = {
        name: 'Replaced Event',
        place: 'New Place',
        start_datetime: '2026-04-01T10:00:00Z',
        end_datetime: '2026-04-02T12:00:00Z',
        is_all_day: false,
        price: 100,
      };

      mockPut.mockResolvedValue({
        data: { id: 1, ...eventData, user_id: 1, status: 'active', created_by: { user_id: 1, name: 'Test', lastname: 'User', email: 'test@example.com' } } as Event,
        success: true,
      });

      const result = await eventsApi.replace(1, eventData);

      expect(mockPut).toHaveBeenCalledWith('/events/1', eventData);
    });
  });

  describe('delete', () => {
    it('should delete an event', async () => {
      mockDelete.mockResolvedValue({
        data: true,
        success: true,
      });

      const result = await eventsApi.delete(1);

      expect(mockDelete).toHaveBeenCalledWith('/events/1');
      expect(result.data).toBe(true);
    });
  });

  describe('updatePrice', () => {
    it('should update only the event price', async () => {
      const mockEvent: Event = {
        id: 1,
        name: 'Test Event',
        place: 'Test Place',
        start_datetime: '2026-04-01T10:00:00Z',
        end_datetime: '2026-04-01T12:00:00Z',
        is_all_day: false,
        price: 200,
        user_id: 1,
        status: 'active',
        created_by: {
          user_id: 1,
          name: 'Test',
          lastname: 'User',
          email: 'test@example.com',
        },
      };

      mockPatch.mockResolvedValue({
        data: mockEvent,
        success: true,
      });

      const result = await eventsApi.updatePrice(1, 200);

      expect(mockPatch).toHaveBeenCalledWith('/events/1/price', { price: 200 });
      expect(result.data.price).toBe(200);
    });
  });

  describe('getPayments', () => {
    it('should fetch payments for an event', async () => {
      const mockPayments: Payment[] = [
        { id: 1, event_id: 1, user_id: 1, amount: '50', payment_type: 'ADVANCE' as PaymentType, payment_date: '2026-04-01' },
        { id: 2, event_id: 1, user_id: 1, amount: '25', payment_type: 'REMAINING' as PaymentType, payment_date: '2026-04-15' },
      ];

      mockGet.mockResolvedValue({
        data: mockPayments,
        success: true,
      });

      const result = await eventsApi.getPayments(1);

      expect(mockGet).toHaveBeenCalledWith('/events/1/payments');
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getPaymentSummary', () => {
    it('should fetch payment summary for an event', async () => {
      const mockSummary: PaymentSummary = {
        total_paid: '100',
        remaining_balance: '50',
        final_price: '150',
      };

      mockGet.mockResolvedValue({
        data: mockSummary,
        success: true,
      });

      const result = await eventsApi.getPaymentSummary(1);

      expect(mockGet).toHaveBeenCalledWith('/events/1/payments/summary');
      expect(result.data.total_paid).toBe('100');
    });
  });

  describe('createPayment', () => {
    it('should create a payment for an event', async () => {
      const paymentData: PaymentFormData = {
        event_id: 1,
        user_id: 1,
        amount: 50,
        payment_type: 'ADVANCE' as PaymentType,
        notes: 'Test payment',
      };

      const createdPayment: Payment = {
        id: 1,
        event_id: 1,
        user_id: 1,
        amount: '50',
        payment_type: 'ADVANCE',
        payment_date: '2026-04-01',
        notes: 'Test payment',
      };

      mockPost.mockResolvedValue({
        data: createdPayment,
        success: true,
      });

      const result = await eventsApi.createPayment(1, paymentData);

      expect(mockPost).toHaveBeenCalledWith('/events/1/payments', paymentData);
      expect(result.data.id).toBe(1);
    });
  });
});