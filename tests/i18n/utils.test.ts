/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock i18next
vi.mock('i18next', () => ({
  default: {
    init: vi.fn(),
    use: vi.fn().mockReturnThis(),
    t: vi.fn(),
  },
}));

// Mock i18next browser language detector
vi.mock('i18next-browser-languagedetector', () => ({
  default: vi.fn(),
}));

import i18n from 'i18next';
import { translateEventStatus, translatePaymentType, translateUserRole, clearTranslationCache } from '@/i18n/utils';
import i18n from 'i18next';

describe('Translation Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearTranslationCache();
    // Reset the mock implementation
    (i18n.t as any).mockImplementation((key: string) => key);
  });

  describe('translateEventStatus', () => {
    it('should translate PENDING status correctly', () => {
      (i18n.t as any).mockReturnValue('Pendiente');

      const result = translateEventStatus('PENDING');
      expect(i18n.t).toHaveBeenCalledWith('events.status.PENDING');
      expect(result).toBe('Pendiente');
    });

    it('should translate CONFIRMED status correctly', () => {
      (i18n.t as any).mockReturnValue('Confirmado');

      const result = translateEventStatus('CONFIRMED');
      expect(i18n.t).toHaveBeenCalledWith('events.status.CONFIRMED');
      expect(result).toBe('Confirmado');
    });

    it('should translate CANCELLED status correctly', () => {
      (i18n.t as any).mockReturnValue('Cancelado');

      const result = translateEventStatus('CANCELLED');
      expect(i18n.t).toHaveBeenCalledWith('events.status.CANCELLED');
      expect(result).toBe('Cancelado');
    });

    it('should return original value when translation key does not exist', () => {
      (i18n.t as any).mockReturnValue('UNKNOWN_STATUS');

      const result = translateEventStatus('UNKNOWN_STATUS');
      expect(i18n.t).toHaveBeenCalledWith('events.status.UNKNOWN_STATUS');
      expect(result).toBe('UNKNOWN_STATUS');
    });

    it('should handle invalid status gracefully', () => {
      const result = translateEventStatus('INVALID');
      expect(i18n.t).toHaveBeenCalledWith('events.status.INVALID');
      expect(result).toBe('INVALID');
    });
  });

  describe('translatePaymentType', () => {
    it('should translate ADVANCE payment type correctly', () => {
      (i18n.t as any).mockReturnValue('Pago Anticipado');

      const result = translatePaymentType('ADVANCE');
      expect(i18n.t).toHaveBeenCalledWith('events.payment.ADVANCE');
      expect(result).toBe('Pago Anticipado');
    });

    it('should translate REMAINING payment type correctly', () => {
      (i18n.t as any).mockReturnValue('Saldo Restante');

      const result = translatePaymentType('REMAINING');
      expect(i18n.t).toHaveBeenCalledWith('events.payment.REMAINING');
      expect(result).toBe('Saldo Restante');
    });

    it('should translate TOTAL payment type correctly', () => {
      (i18n.t as any).mockReturnValue('Pago Total');

      const result = translatePaymentType('TOTAL');
      expect(i18n.t).toHaveBeenCalledWith('events.payment.TOTAL');
      expect(result).toBe('Pago Total');
    });

    it('should return original value when translation key does not exist', () => {
      (i18n.t as any).mockReturnValue('UNKNOWN_PAYMENT');

      const result = translatePaymentType('UNKNOWN_PAYMENT');
      expect(i18n.t).toHaveBeenCalledWith('events.payment.UNKNOWN_PAYMENT');
      expect(result).toBe('UNKNOWN_PAYMENT');
    });
  });

  describe('translateUserRole', () => {
    it('should translate admin role correctly', () => {
      (i18n.t as any).mockReturnValue('Administrador');

      const result = translateUserRole('admin');
      expect(i18n.t).toHaveBeenCalledWith('roles.admin');
      expect(result).toBe('Administrador');
    });

    it('should translate member role correctly', () => {
      (i18n.t as any).mockReturnValue('Miembro');

      const result = translateUserRole('member');
      expect(i18n.t).toHaveBeenCalledWith('roles.member');
      expect(result).toBe('Miembro');
    });

    it('should return original value when translation key does not exist', () => {
      (i18n.t as any).mockReturnValue('custom_role');

      const result = translateUserRole('custom_role');
      expect(i18n.t).toHaveBeenCalledWith('roles.custom_role');
      expect(result).toBe('custom_role');
    });

    it('should handle empty string gracefully', () => {
      const result = translateUserRole('');
      expect(i18n.t).not.toHaveBeenCalled();
      expect(result).toBe('');
    });

    it('should handle undefined role gracefully', () => {
      const result = translateUserRole(undefined as any);
      expect(i18n.t).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('missing translation handling', () => {
    it('should return original value when translation returns the key', () => {
      // When i18n.t returns the key itself, it means translation is missing
      (i18n.t as any).mockImplementation((key: string) => key);

      const statusResult = translateEventStatus('PENDING');
      expect(statusResult).toBe('PENDING');

      const paymentResult = translatePaymentType('ADVANCE');
      expect(paymentResult).toBe('ADVANCE');

      const roleResult = translateUserRole('admin');
      expect(roleResult).toBe('admin');
    });

    it('should handle i18n.t returning undefined', () => {
      clearTranslationCache();
      (i18n.t as any).mockReturnValue(undefined);

      const result = translateEventStatus('PENDING');
      expect(i18n.t).toHaveBeenCalledWith('events.status.PENDING');
      expect(result).toBe('PENDING');
    });

    it('should handle i18n.t returning null', () => {
      clearTranslationCache();
      (i18n.t as any).mockReturnValue(null);

      const result = translateEventStatus('PENDING');
      expect(i18n.t).toHaveBeenCalledWith('events.status.PENDING');
      expect(result).toBe('PENDING');
    });
  });

  describe('error handling', () => {
    it('should handle i18n.t throwing an error', () => {
      clearTranslationCache();
      (i18n.t as any).mockImplementation(() => {
        throw new Error('Translation error');
      });

      const result = translateEventStatus('PENDING');
      expect(result).toBe('PENDING');
    });

    it('should handle i18n.t being undefined', () => {
      clearTranslationCache();
      // Temporarily replace i18n.t with undefined
      const originalT = i18n.t;
      (i18n as any).t = undefined;

      const result = translateEventStatus('PENDING');
      expect(result).toBe('PENDING');

      // Restore
      (i18n as any).t = originalT;
    });
  });
});