/**
 * Musician Availability API Service
 * API functions for managing musician availability
 */

import { apiClient, type ApiResponse } from './client';

export interface MusicianAvailability {
  id: number;
  musician_id: number;
  unavailable_date: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAvailabilityRequest {
  musician_id: number;
  unavailable_date: string;
  reason: string;
}

export type BulkAvailabilityRequest = Array<{
  musician_id: number;
  unavailable_date: string;
  reason: string;
}>

export interface UpdateAvailabilityRequest {
  unavailable_date?: string;
  reason?: string;
}

/**
 * Musician Availability API
 * Endpoints: /api/musician-availability/
 */
export const musicianAvailabilityApi = {
  /**
   * Get availability for a musician
   * GET /api/musician-availability/{musician_id}
   */
  getByMusician: async (musicianId: number): Promise<ApiResponse<MusicianAvailability[]>> => {
    return apiClient.get<MusicianAvailability[]>(`/musician-availability/${musicianId}`);
  },

  /**
   * Check if musician is available on a specific date
   * GET /api/musician-availability/check/{musician_id}/{date}
   */
  checkAvailability: async (musicianId: number, date: string): Promise<ApiResponse<boolean>> => {
    return apiClient.get<boolean>(`/musician-availability/check/${musicianId}/${date}`);
  },

  /**
   * Create a new availability entry
   * POST /api/musician-availability
   */
  create: async (data: CreateAvailabilityRequest): Promise<ApiResponse<MusicianAvailability>> => {
    return apiClient.post<MusicianAvailability>('/musician-availability', data);
  },

  /**
   * Create bulk availability entries
   * POST /api/musician-availability/bulk
   */
  createBulk: async (data: BulkAvailabilityRequest): Promise<ApiResponse<MusicianAvailability[]>> => {
    return apiClient.post<MusicianAvailability[]>('/musician-availability/bulk', data);
  },

  /**
   * Update an availability entry
   * PATCH /api/musician-availability/{availability_id}
   */
  update: async (id: number, data: UpdateAvailabilityRequest): Promise<ApiResponse<MusicianAvailability>> => {
    return apiClient.patch<MusicianAvailability>(`/musician-availability/${id}`, data);
  },

  /**
   * Delete an availability entry
   * DELETE /api/musician-availability/{availability_id}
   */
  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/musician-availability/${id}`);
  },

  /**
   * Delete availability by musician and date
   * DELETE /api/musician-availability/{musician_id}/{date}
   */
  deleteByDate: async (musicianId: number, date: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/musician-availability/${musicianId}/${date}`);
  },
};