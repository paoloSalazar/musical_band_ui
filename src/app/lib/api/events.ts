/**
 * Events API Service
 * API functions for managing events
 */

import { apiClient, type ApiResponse } from './client';
import type { Event, EventFormData } from '../types';

/**
 * Events API
 * Endpoints: /api/events/
 */
export const eventsApi = {
  /**
   * Get all events
   * GET /api/events/
   */
  list: async (): Promise<ApiResponse<Event[]>> => {
    return apiClient.get<Event[]>('/events/');
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
};
