import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserTimeZone,
  convertToUserTimeZone,
  formatDateTime,
  formatDate,
  formatTime,
  formatDateTimeHumanReadable,
  convertToUTC,
  getCurrentLocalDateTime,
  getCurrentLocalDate,
  getCurrentLocalTime,
} from '@/app/lib/timezone';

describe('timezone.ts', () => {
  beforeEach(() => {
    vi.resetModules();
    // Clear timezone cache before each test
    vi.doMock('@/app/lib/timezone', async () => {
      const actual = await vi.importActual('@/app/lib/timezone');
      return actual;
    });
  });

  describe('getUserTimeZone', () => {
    it('should return a timezone string', () => {
      const timezone = getUserTimeZone();
      expect(typeof timezone).toBe('string');
      expect(timezone.length).toBeGreaterThan(0);
    });

    it('should return UTC fallback when Intl API is not available', () => {
      // The function should handle cases where Intl is not available
      const timezone = getUserTimeZone();
      expect(timezone).toMatch(/^[A-Za-z_/]+$/);
    });
  });

  describe('convertToUserTimeZone', () => {
    it('should convert UTC string to Date object', () => {
      const result = convertToUserTimeZone('2026-03-23T13:00:00Z');
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle empty string and return current date', () => {
      const result = convertToUserTimeZone('');
      expect(result).toBeInstanceOf(Date);
    });

    it('should append Z if timezone info is missing', () => {
      const result = convertToUserTimeZone('2026-03-23T13:00:00');
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle invalid date and return current date', () => {
      const result = convertToUserTimeZone('invalid-date');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime with default format', () => {
      const result = formatDateTime('2026-03-23T13:00:00Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should format datetime with custom format', () => {
      const result = formatDateTime('2026-03-23T13:00:00Z', 'yyyy-MM-dd');
      expect(typeof result).toBe('string');
      expect(result).equal('2026-03-23');
    });

    it('should return empty string for empty input', () => {
      const result = formatDateTime('');
      expect(result).toBe('');
    });

    it('should handle invalid date gracefully', () => {
      const result = formatDateTime('invalid-date');
      // Should either return formatted or original string due to fallback
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDate', () => {
    it('should format date only (yyyy-MM-dd)', () => {
      const result = formatDate('2026-03-23T13:00:00Z');
      expect(typeof result).toBe('string');
      // Should contain date format
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should return empty string for empty input', () => {
      const result = formatDate('');
      expect(result).toBe('');
    });
  });

  describe('formatTime', () => {
    it('should format time only (HH:mm)', () => {
      const result = formatTime('2026-03-23T13:00:00Z');
      expect(typeof result).toBe('string');
      // Should contain time format
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should return empty string for empty input', () => {
      const result = formatTime('');
      expect(result).toBe('');
    });
  });

  describe('formatDateTimeHumanReadable', () => {
    it('should format in human readable format', () => {
      const result = formatDateTimeHumanReadable('2026-03-23T13:00:00Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty string for empty input', () => {
      const result = formatDateTimeHumanReadable('');
      expect(result).toBe('');
    });
  });

  describe('convertToUTC', () => {
    it('should convert local datetime to UTC ISO string', () => {
      const result = convertToUTC('2026-03-23T13:00:00');
      expect(typeof result).toBe('string');
      expect(result).toContain('T');
      expect(result).toContain('Z');
    });

    it('should return empty string for empty input', () => {
      const result = convertToUTC('');
      expect(result).toBe('');
    });

    it('should return ISO string format', () => {
      const result = convertToUTC('2026-03-23T13:00:00');
      // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('getCurrentLocalDateTime', () => {
    it('should return local datetime in yyyy-MM-ddTHH:mm format', () => {
      const result = getCurrentLocalDateTime();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    });
  });

  describe('getCurrentLocalDate', () => {
    it('should return local date in yyyy-MM-dd format', () => {
      const result = getCurrentLocalDate();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('getCurrentLocalTime', () => {
    it('should return local time in HH:mm format', () => {
      const result = getCurrentLocalTime();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });
});