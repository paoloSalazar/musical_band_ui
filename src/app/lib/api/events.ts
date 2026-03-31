/**
 * Events API Service
 * API functions for managing events
 */

import { apiClient, type ApiResponse } from './client';
import type { Event, EventFormData, Payment, PaymentSummary, PaymentFormData } from '../types';

/**
 * Paginated events response for table view
 */
export interface PaginatedEventsResponse {
  items: Event[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Events API
 * Endpoints: /api/events/
 */
export const eventsApi = {
  /**
   * Get paginated events (for table view)
   * GET /api/events/?page=1&limit=10
   */
  list: async (page = 1, limit = 10): Promise<ApiResponse<PaginatedEventsResponse>> => {
    return apiClient.get<PaginatedEventsResponse>(`/events/?page=${page}&limit=${limit}`);
  },

  /**
   * Get events for calendar view (filtered by year and month)
   * GET /api/events/calendar?year=2026&month=3
   */
  listForCalendar: async (year: number, month: number): Promise<ApiResponse<Event[]>> => {
    return apiClient.get<Event[]>(`/events/calendar?year=${year}&month=${month}`);
  },

  /**
   * Get an event by ID
   * GET /api/events/{id}
   */
  getById: async (id: number): Promise<ApiResponse<Event>> => {
    return apiClient.get<Event>(`/events/${id}`);
  },

  /**
   * Create a new event
   * POST /api/events/
   */
  create: async (data: EventFormData): Promise<ApiResponse<Event>> => {
    return apiClient.post<Event>('/events/', data);
  },

  /**
   * Update an event (partial update)
   * PATCH /api/events/{id}
   */
  update: async (id: number, data: Partial<EventFormData>): Promise<ApiResponse<Event>> => {
    return apiClient.patch<Event>(`/events/${id}`, data);
  },

  /**
   * Replace an event (full update)
   * PUT /api/events/{id}
   */
  replace: async (id: number, data: EventFormData): Promise<ApiResponse<Event>> => {
    return apiClient.put<Event>(`/events/${id}`, data);
  },

  /**
   * Delete an event
   * DELETE /api/events/{id}
   */
  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/events/${id}`);
  },

  /**
   * Update event price only
   * PATCH /api/events/{id}/price
   */
  updatePrice: async (id: number, price: number): Promise<ApiResponse<Event>> => {
    return apiClient.patch<Event>(`/events/${id}/price`, { price });
  },

  /**
   * Get payments for an event
   * GET /api/events/{event_id}/payments
   */
  getPayments: async (eventId: number): Promise<ApiResponse<Payment[]>> => {
    return apiClient.get<Payment[]>(`/events/${eventId}/payments`);
  },

  /**
   * Get payment summary for an event
   * GET /api/events/{event_id}/payments/summary
   */
  getPaymentSummary: async (eventId: number): Promise<ApiResponse<PaymentSummary>> => {
    return apiClient.get<PaymentSummary>(`/events/${eventId}/payments/summary`);
  },

  /**
   * Create a payment for an event
   * POST /api/events/{event_id}/payments
   */
  createPayment: async (eventId: number, data: Omit<PaymentFormData, 'event_id'>): Promise<ApiResponse<Payment>> => {
    return apiClient.post<Payment>(`/events/${eventId}/payments`, data);
  },
};
