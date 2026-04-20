import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

// Simple cache for translation results to improve performance
const translationCache = new Map<string, string>();

// Listen for language changes and clear cache
i18n.on('languageChanged', () => {
  translationCache.clear();
});

/**
 * Internal helper function to perform translation with error handling and caching
 * @param key - The translation key
 * @param fallbackValue - The value to return if translation fails
 * @param context - Context for logging (e.g., 'event status', 'payment type')
 * @returns Translated string or fallback value
 */
function translateWithFallback(key: string, fallbackValue: string, context?: string): string {
  // Check cache first
  if (translationCache.has(key)) {
    return translationCache.get(key)!;
  }

  if (!i18n?.t) {
    return fallbackValue;
  }

  try {
    const translated = i18n.t(key);
    // If translation returns the key itself, translation is missing, or returns falsy values
    if (!translated || translated === key) {
      translationCache.set(key, fallbackValue);
      return fallbackValue;
    }
    translationCache.set(key, translated);
    return translated;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Failed to translate ${context || 'value'} "${key}":`, error);
    }
    return fallbackValue;
  }
}

/**
 * Translates event status values from backend enums to localized strings
 * @param status - The backend status enum value (PENDING, CONFIRMED, CANCELLED)
 * @returns Localized status string or original value if translation fails
 */
export function translateEventStatus(status: string): string {
  if (!status) {
    return status;
  }
  return translateWithFallback(`events.status.${status}`, status, 'event status');
}

/**
 * Translates payment type values from backend enums to localized strings
 * @param paymentType - The backend payment type enum value (ADVANCE, REMAINING, TOTAL)
 * @returns Localized payment type string or original value if translation fails
 */
export function translatePaymentType(paymentType: string): string {
  if (!paymentType) {
    return paymentType;
  }
  return translateWithFallback(`events.payment.${paymentType}`, paymentType, 'payment type');
}

/**
 * Translates user role names from backend values to localized strings
 * @param role - The backend role name (admin, member, etc.)
 * @returns Localized role name or original value if translation fails
 */
export function translateUserRole(role: string): string {
  if (!role) {
    return role;
  }
  return translateWithFallback(`roles.${role}`, role, 'user role');
}

/**
 * Translates permission names from backend values to localized strings
 * @param permission - The backend permission name
 * @returns Localized permission name or original value if translation fails
 */
export function translatePermission(permission: string): string {
  if (!permission) {
    return permission;
  }
  return translateWithFallback(`permissions.${permission}`, permission, 'permission');
}

/**
 * Generic function to translate any backend data value using a custom key prefix
 * @param value - The backend value to translate
 * @param keyPrefix - The translation key prefix (e.g., 'events.status', 'roles')
 * @returns Localized string or original value if translation fails
 */
export function translateBackendData(value: string, keyPrefix: string): string {
  if (!value || !keyPrefix) {
    return value;
  }
  return translateWithFallback(`${keyPrefix}.${value}`, value, `backend data with prefix ${keyPrefix}`);
}

/**
 * Checks if a translation key exists
 * @param key - The translation key to check
 * @returns true if the translation exists and is different from the key
 */
export function hasTranslation(key: string): boolean {
  if (!key || !i18n?.t) {
    return false;
  }

  try {
    const translated = i18n.t(key);
    return translated !== key && !!translated;
  } catch {
    return false;
  }
}

/**
 * Clears the translation cache. Useful for testing or when translations change dynamically.
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Gets cache statistics for debugging purposes
 * @returns Object with cache size and hit information
 */
export function getTranslationCacheStats(): { size: number } {
  return {
    size: translationCache.size,
  };
}

/**
 * React hook that provides reactive translation utilities
 * Components using these functions will re-render when language changes
 */
export function useTranslationUtils() {
  const { t } = useTranslation();

  const translateEventStatus = (status: string): string => {
    if (!status) return status;
    return translateWithFallback(`events.status.${status}`, status, 'event status');
  };

  const translatePaymentType = (paymentType: string): string => {
    if (!paymentType) return paymentType;
    return translateWithFallback(`events.payment.${paymentType}`, paymentType, 'payment type');
  };

  const translateUserRole = (role: string): string => {
    if (!role) return role;
    return translateWithFallback(`roles.${role}`, role, 'user role');
  };

  const translatePermission = (permission: string): string => {
    if (!permission) return permission;
    return translateWithFallback(`permissions.${permission}`, permission, 'permission');
  };

  const translateBackendData = (value: string, keyPrefix: string): string => {
    if (!value || !keyPrefix) return value;
    return translateWithFallback(`${keyPrefix}.${value}`, value, `backend data with prefix ${keyPrefix}`);
  };

  return {
    translateEventStatus,
    translatePaymentType,
    translateUserRole,
    translatePermission,
    translateBackendData,
  };
}