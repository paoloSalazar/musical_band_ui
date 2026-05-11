/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the apiClient before importing anything that uses it
vi.mock('@/app/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { musicianAvailabilityApi } from '@/app/lib/api/musicianAvailability';
import { apiClient } from '@/app/lib/api/client';

describe('musicianAvailabilityApi', () => {
  let mockGet: ReturnType<typeof vi.fn>;
  let mockPost: ReturnType<typeof vi.fn>;
  let mockPatch: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGet = vi.fn();
    mockPost = vi.fn();
    mockPatch = vi.fn();
    mockDelete = vi.fn();

    (apiClient as any).get = mockGet;
    (apiClient as any).post = mockPost;
    (apiClient as any).patch = mockPatch;
    (apiClient as any).delete = mockDelete;
  });

  describe('getByMusician', () => {
    it('should fetch availability for a musician', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            musician_id: 5,
            unavailable_date: '2026-04-22',
            reason: 'Holiday trip',
            created_at: '2026-04-15T10:30:00',
            updated_at: '2026-04-15T10:30:00'
          }
        ],
        success: true
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.getByMusician(5);

      expect(mockGet).toHaveBeenCalledWith('/musician-availability/5');
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty availability list', async () => {
      const mockResponse = {
        data: [],
        success: true
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.getByMusician(10);

      expect(mockGet).toHaveBeenCalledWith('/musician-availability/10');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkAvailability', () => {
    it('should check if musician is available on a date', async () => {
      const mockResponse = {
        data: true,
        success: true
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.checkAvailability(5, '2026-04-22');

      expect(mockGet).toHaveBeenCalledWith('/musician-availability/check/5/2026-04-22');
      expect(result).toEqual(mockResponse);
    });

    it('should return false when musician is unavailable', async () => {
      const mockResponse = {
        data: false,
        success: true
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.checkAvailability(5, '2026-04-22');

      expect(mockGet).toHaveBeenCalledWith('/musician-availability/check/5/2026-04-22');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new availability entry', async () => {
      const availabilityData = {
        musician_id: 5,
        unavailable_date: '2026-04-22',
        reason: 'Holiday trip'
      };

      const mockResponse = {
        data: {
          id: 3,
          musician_id: 5,
          unavailable_date: '2026-04-22',
          reason: 'Holiday trip',
          created_at: '2026-04-15T11:00:00',
          updated_at: '2026-04-15T11:00:00'
        },
        success: true
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.create(availabilityData);

      expect(mockPost).toHaveBeenCalledWith('/musician-availability', availabilityData);
      expect(result).toEqual(mockResponse);
    });

    it('should create availability without reason', async () => {
      const availabilityData = {
        musician_id: 5,
        unavailable_date: '2026-04-22',
        reason: ''
      };

      const mockResponse = {
        data: {
          id: 4,
          musician_id: 5,
          unavailable_date: '2026-04-22',
          reason: '',
          created_at: '2026-04-15T11:15:00',
          updated_at: '2026-04-15T11:15:00'
        },
        success: true
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.create(availabilityData);

      expect(mockPost).toHaveBeenCalledWith('/musician-availability', availabilityData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createBulk', () => {
    it('should create multiple availability entries', async () => {
      const bulkData = [
        {
          musician_id: 5,
          unavailable_date: '2026-04-23',
          reason: 'Family vacation'
        },
        {
          musician_id: 5,
          unavailable_date: '2026-04-24',
          reason: 'Family vacation'
        }
      ];

      const mockResponse = {
        data: [
          {
            id: 4,
            musician_id: 5,
            unavailable_date: '2026-04-23',
            reason: 'Family vacation',
            created_at: '2026-04-15T11:15:00',
            updated_at: '2026-04-15T11:15:00'
          },
          {
            id: 5,
            musician_id: 5,
            unavailable_date: '2026-04-24',
            reason: 'Family vacation',
            created_at: '2026-04-15T11:15:00',
            updated_at: '2026-04-15T11:15:00'
          }
        ],
        success: true
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.createBulk(bulkData);

      expect(mockPost).toHaveBeenCalledWith('/musician-availability/bulk', bulkData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty bulk array', async () => {
      const bulkData: any[] = [];

      const mockResponse = {
        data: [],
        success: true
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.createBulk(bulkData);

      expect(mockPost).toHaveBeenCalledWith('/musician-availability/bulk', bulkData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an availability entry', async () => {
      const updateData = {
        reason: 'Rescheduled vacation'
      };

      const mockResponse = {
        data: {
          id: 1,
          musician_id: 5,
          unavailable_date: '2026-04-19',
          reason: 'Rescheduled vacation',
          created_at: '2026-04-15T10:30:00',
          updated_at: '2026-04-15T11:30:00'
        },
        success: true
      };

      mockPatch.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.update(1, updateData);

      expect(mockPatch).toHaveBeenCalledWith('/musician-availability/1', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should update availability date', async () => {
      const updateData = {
        unavailable_date: '2026-04-25'
      };

      const mockResponse = {
        data: {
          id: 1,
          musician_id: 5,
          unavailable_date: '2026-04-25',
          reason: 'Holiday trip',
          created_at: '2026-04-15T10:30:00',
          updated_at: '2026-04-15T11:30:00'
        },
        success: true
      };

      mockPatch.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.update(1, updateData);

      expect(mockPatch).toHaveBeenCalledWith('/musician-availability/1', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete an availability entry', async () => {
      const mockResponse = {
        data: { message: 'Availability deleted successfully' },
        success: true
      };

      mockDelete.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.delete(1);

      expect(mockDelete).toHaveBeenCalledWith('/musician-availability/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteByDate', () => {
    it('should delete availability by musician and date', async () => {
      const mockResponse = {
        data: { message: 'Availability deleted successfully' },
        success: true
      };

      mockDelete.mockResolvedValue(mockResponse);

      const result = await musicianAvailabilityApi.deleteByDate(5, '2026-04-18');

      expect(mockDelete).toHaveBeenCalledWith('/musician-availability/5/2026-04-18');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle API errors for getByMusician', async () => {
      const error = new Error('API Error');
      mockGet.mockRejectedValue(error);

      await expect(musicianAvailabilityApi.getByMusician(5)).rejects.toThrow('API Error');
      expect(mockGet).toHaveBeenCalledWith('/musician-availability/5');
    });

    it('should handle API errors for create', async () => {
      const error = new Error('Validation Error');
      const availabilityData = {
        musician_id: 5,
        unavailable_date: '2026-04-22',
        reason: 'Holiday trip'
      };

      mockPost.mockRejectedValue(error);

      await expect(musicianAvailabilityApi.create(availabilityData)).rejects.toThrow('Validation Error');
      expect(mockPost).toHaveBeenCalledWith('/musician-availability', availabilityData);
    });

    it('should handle API errors for update', async () => {
      const error = new Error('Not Found');
      const updateData = { reason: 'Updated reason' };

      mockPatch.mockRejectedValue(error);

      await expect(musicianAvailabilityApi.update(1, updateData)).rejects.toThrow('Not Found');
      expect(mockPatch).toHaveBeenCalledWith('/musician-availability/1', updateData);
    });

    it('should handle API errors for delete', async () => {
      const error = new Error('Delete Error');
      mockDelete.mockRejectedValue(error);

      await expect(musicianAvailabilityApi.delete(1)).rejects.toThrow('Delete Error');
      expect(mockDelete).toHaveBeenCalledWith('/musician-availability/1');
    });
  });
});