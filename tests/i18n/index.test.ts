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

// Mock react-i18next
vi.mock('react-i18next', () => ({
  initReactI18next: vi.fn(),
}));

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

describe('i18n Configuration', () => {
  it('should load translation files without errors', async () => {
    // Test that we can import the English translations
    const enTranslations = await import('@/i18n/locales/en.json');
    expect(enTranslations.default).toBeDefined();
    expect(enTranslations.default.common).toBeDefined();
    expect(enTranslations.default.auth).toBeDefined();

    // Test that we can import the Spanish translations
    const esTranslations = await import('@/i18n/locales/es.json');
    expect(esTranslations.default).toBeDefined();
    expect(esTranslations.default.common).toBeDefined();
    expect(esTranslations.default.auth).toBeDefined();
  });

  it('should have required translation keys in English', async () => {
    const enTranslations = await import('@/i18n/locales/en.json');

    // Check common keys
    expect(enTranslations.default.common.loading).toBe('Loading...');
    expect(enTranslations.default.common.save).toBe('Save');
    expect(enTranslations.default.common.cancel).toBe('Cancel');

    // Check auth keys
    expect(enTranslations.default.auth.login).toBe('Login');
    expect(enTranslations.default.auth.username).toBe('Username');
    expect(enTranslations.default.auth.password).toBe('Password');

    // Check navigation keys
    expect(enTranslations.default.navigation.home).toBe('Home');
    expect(enTranslations.default.navigation.profile).toBe('Profile');
  });

  it('should have required translation keys in Spanish', async () => {
    const esTranslations = await import('@/i18n/locales/es.json');

    // Check common keys
    expect(esTranslations.default.common.loading).toBe('Cargando...');
    expect(esTranslations.default.common.save).toBe('Guardar');
    expect(esTranslations.default.common.cancel).toBe('Cancelar');

    // Check auth keys
    expect(esTranslations.default.auth.login).toBe('Iniciar Sesión');
    expect(esTranslations.default.auth.username).toBe('Nombre de usuario');
    expect(esTranslations.default.auth.password).toBe('Contraseña');

    // Check navigation keys
    expect(esTranslations.default.navigation.home).toBe('Inicio');
    expect(esTranslations.default.navigation.profile).toBe('Perfil');
  });

  it('should have consistent translation structure between languages', async () => {
    const enTranslations = await import('@/i18n/locales/en.json');
    const esTranslations = await import('@/i18n/locales/es.json');

    // Check that both languages have the same top-level keys
    const enKeys = Object.keys(enTranslations.default).sort();
    const esKeys = Object.keys(esTranslations.default).sort();
    expect(enKeys).toEqual(esKeys);

    // Check that common section has same keys
    const enCommonKeys = Object.keys(enTranslations.default.common).sort();
    const esCommonKeys = Object.keys(esTranslations.default.common).sort();
    expect(enCommonKeys).toEqual(esCommonKeys);
  });

  it('should have event status translations', async () => {
    const enTranslations = await import('@/i18n/locales/en.json');
    const esTranslations = await import('@/i18n/locales/es.json');

    // Check English event status
    expect(enTranslations.default.events.status.PENDING).toBe('Pending');
    expect(enTranslations.default.events.status.CONFIRMED).toBe('Confirmed');
    expect(enTranslations.default.events.status.CANCELLED).toBe('Cancelled');

    // Check Spanish event status
    expect(esTranslations.default.events.status.PENDING).toBe('Pendiente');
    expect(esTranslations.default.events.status.CONFIRMED).toBe('Confirmado');
    expect(esTranslations.default.events.status.CANCELLED).toBe('Cancelado');
  });

  it('should have payment type translations', async () => {
    const enTranslations = await import('@/i18n/locales/en.json');
    const esTranslations = await import('@/i18n/locales/es.json');

    // Check English payment types
    expect(enTranslations.default.events.payment.ADVANCE).toBe('Advance Payment');
    expect(enTranslations.default.events.payment.REMAINING).toBe('Remaining Balance');
    expect(enTranslations.default.events.payment.TOTAL).toBe('Total Payment');

    // Check Spanish payment types
    expect(esTranslations.default.events.payment.ADVANCE).toBe('Pago Anticipado');
    expect(esTranslations.default.events.payment.REMAINING).toBe('Saldo Restante');
    expect(esTranslations.default.events.payment.TOTAL).toBe('Pago Total');
  });
});