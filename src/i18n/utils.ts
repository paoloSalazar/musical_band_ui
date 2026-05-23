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
 * Translates API error messages by matching common patterns and extracting dynamic values
 * @param errorMessage - The raw error message from the API
 * @param context - Context for logging (e.g., 'user creation', 'login')
 * @returns Translated error message with proper interpolation
 */
export function translateApiError(errorMessage: string, context?: string): string {
  if (!errorMessage) return errorMessage;

  // Check if i18n is available
  if (!i18n?.t) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('i18n not available for API error translation, returning original message');
    }
    return errorMessage;
  }

  // Common API error patterns with regex to extract dynamic values
  const errorPatterns = [
    {
      regex: /^Cannot create events in the past$/i,
      key: 'events.create.validation.cannotCreateInPast',
      extractor: () => ({})
    },
    {
      regex: /^Event conflicts with existing event '(.+)' on (\d{4}-\d{2}-\d{2})$/i,
      key: 'events.create.validation.eventConflict',
      extractor: (match: RegExpMatchArray) => {
        const eventName = match[1];
        const dateString = match[2];
        // Format date to human readable format
        try {
          const date = new Date(dateString + 'T00:00:00');
          const formattedDate = date.toLocaleDateString(i18n.language || 'en', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          return { eventName, date: formattedDate };
        } catch (error) {
          // Fallback to original date string if formatting fails
          return { eventName, date: dateString };
        }
      }
    },
    {
      regex: /^User (.+@.+\..+) already exists$/i,
      key: 'users.errors.userAlreadyExists',
      extractor: (match: RegExpMatchArray) => ({ email: match[1] })
    },
    {
      regex: /^Email (.+@.+\..+) is already in use$/i,
      key: 'users.errors.emailAlreadyInUse',
      extractor: (match: RegExpMatchArray) => ({ email: match[1] })
    },
    {
      regex: /^Invalid email address: (.+@.+\..+)$/i,
      key: 'users.errors.invalidEmail',
      extractor: (match: RegExpMatchArray) => ({ email: match[1] })
    },
    {
      regex: /^User with ID (\d+) not found$/i,
      key: 'users.errors.userNotFound',
      extractor: (match: RegExpMatchArray) => ({ id: match[1] })
    },
    {
      regex: /^Role (.+) not found$/i,
      key: 'users.errors.roleNotFound',
      extractor: (match: RegExpMatchArray) => ({ role: match[1] })
    },
    {
      regex: /^Role (.+) already exists$/i,
      key: 'roles.errors.roleAlreadyExists',
      extractor: (match: RegExpMatchArray) => ({ name: match[1] })
    },
    {
      regex: /^Role (.+) is currently in use and cannot be deleted$/i,
      key: 'roles.errors.roleInUse',
      extractor: (match: RegExpMatchArray) => ({ name: match[1] })
    },
    {
      regex: /^This user cannot be deleted because they have created (\d+) events?\. Please reassign or delete these events first\.$/i,
      key: 'users.errors.cannotDeleteUserWithAssociations',
      extractor: (match: RegExpMatchArray) => ({ count: parseInt(match[1], 10) })
    },
    {
      regex: /^This user cannot be deleted because they have (\d+) (.+)\. Please remove (this|these) (.+) first\.$/i,
      key: 'users.errors.cannotDeleteUserWithPaymentRecords',
      extractor: (match: RegExpMatchArray) => {
        const count = parseInt(match[1], 10);
        const rawType = match[2];
        const determinerKey = match[3]; // "this" or "these"
        const typeKey = rawType.replace(/\s+/g, '_').toLowerCase();
        const translatedType = i18n.t(`types.${typeKey}`, { defaultValue: rawType });
        const determiner = i18n.t(`common.${determinerKey}`, { defaultValue: determinerKey });
        return { count, type: translatedType, determiner };
      }
    },
    {
      regex: /^This role cannot be deleted because (\d+) user(?:s)? (?:is|are) assigned to it\. Please reassign (this|these) user(?:s)? to another role first\.$/i,
      key: 'roles.errors.cannotDeleteRoleWithUsers',
      extractor: (match: RegExpMatchArray) => {
        const count = parseInt(match[1], 10);
        const determinerKey = match[2]; // "this" or "these"
        const nounKey = count === 1 ? 'user' : 'users';
        const verbKey = count === 1 ? 'is' : 'are';
        const noun = i18n.t(`common.${nounKey}`, { defaultValue: nounKey });
        const determiner = i18n.t(`common.${determinerKey}`, { defaultValue: determinerKey });
        const verb = i18n.t(`common.verbs.${verbKey}`, { defaultValue: verbKey });
        const plural = count === 1 ? '' : 's';
        return { count, noun, determiner, verb, plural };
      }
    },
    {
      regex: /^Permission (.+) already exists$/i,
      key: 'permissions.errors.permissionAlreadyExists',
      extractor: (match: RegExpMatchArray) => ({ name: match[1] })
    },
    {
      regex: /^Permission (.+) not found$/i,
      key: 'permissions.errors.permissionNotFound',
      extractor: (match: RegExpMatchArray) => ({ name: match[1] })
    },
    {
      regex: /^Permission (.+) is currently in use and cannot be deleted$/i,
      key: 'permissions.errors.permissionInUse',
      extractor: (match: RegExpMatchArray) => ({ name: match[1] })
    },
    {
      regex: /^This permission cannot be deleted because it is assigned to (\d+) role \('([^']+)'\)\. Please remove this permission from the role first\.$/i,
      key: 'permissions.errors.cannotDeletePermissionWithRoles',
      extractor: (match: RegExpMatchArray) => {
        const count = parseInt(match[1], 10);
        const role = match[2];
        const roles = translateUserRole(role);
        const determiner = 'this';
        const verb = 'is';
        const plural = '';
        return { count, roles, determiner, verb, plural };
      }
    },
    {
      regex: /^Este permiso no puede ser eliminado porque está asignado a (\d+) rol \('([^']+)'\)\. Por favor, elimine este permiso del rol primero\.$/i,
      key: 'permissions.errors.cannotDeletePermissionWithRoles',
      extractor: (match: RegExpMatchArray) => {
        const count = parseInt(match[1], 10);
        const role = match[2];
        const roles = translateUserRole(role);
        const determiner = 'este';
        const verb = 'está';
        const plural = '';
        return { count, roles, determiner, verb, plural };
      }
    },
    {
      regex: /^Este permiso no puede ser eliminado porque están asignados a (\d+) roles \((.+)\)\. Por favor, elimine este permiso de estos roles primero\.$/i,
      key: 'permissions.errors.cannotDeletePermissionWithRoles',
      extractor: (match: RegExpMatchArray) => {
        const count = parseInt(match[1], 10);
        const rolesString = match[2];
        const roles = rolesString.split(',').map(r => translateUserRole(r.trim().replace(/'/g, ''))).join(', ');
        const determiner = 'estos';
        const verb = 'están';
        const plural = 'es';
        return { count, roles, determiner, verb, plural };
      }
    },
    {
      regex: /^This permission cannot be deleted because it is assigned to (\d+) roles \('([^']+)'\)\. Please remove this permission from the roles first\.$/i,
      key: 'permissions.errors.cannotDeletePermissionWithRoles',
      extractor: (match: RegExpMatchArray) => ({ count: parseInt(match[1], 10), role: match[2] })
    },
    {
      regex: /^Musician is already assigned to this event$/i,
      key: 'events.musicianManagement.assignDialog.alreadyAssigned',
      extractor: () => ({})
    },
    {
      regex: /^The musician is not available for the dates of this event$/i,
      key: 'events.musicianManagement.assignDialog.notAvailable',
      extractor: () => ({})
    },
    {
      regex: /^This musician assignment cannot be deleted because there (is|are) (\d+) payment records? for this musician and event\.$/i,
      key: 'events.musicianManagement.deleteDialog.cannotDeleteWithPayments',
      extractor: (match: RegExpMatchArray) => {
        const count = parseInt(match[2], 10);
        const isSingular = count === 1;
        const determinerKey = isSingular ? 'this' : 'these';
        const recordKey = isSingular ? 'paymentRecord' : 'paymentRecords';
        const verbKey = isSingular ? 'is' : 'are';
        const verb = i18n.t(`common.verbs.${verbKey}`, { defaultValue: isSingular ? 'is' : 'are' });
        const record = i18n.t(`common.${recordKey}`, { defaultValue: isSingular ? 'payment record' : 'payment records' });
        const determiner = i18n.t(`common.${determinerKey}`, { defaultValue: isSingular ? 'this' : 'these' });
        return { count, verb, record, determiner };
      }
    },
    {
      regex: /^Cannot mark date unavailable – assigned to event '(.+)' on (this date|\d{4}-\d{2}-\d{2})$/i,
      key: 'musicianAvailability.messages.assignedToEvent',
      extractor: (match: RegExpMatchArray) => {
        const eventName = match[1];
        const datePart = match[2];
        if (datePart === 'this date') {
          return { eventName, date: 'this date' };
        }
        // Format date to human readable format
        try {
          const date = new Date(datePart + 'T00:00:00');
          const formattedDate = date.toLocaleDateString(i18n.language || 'en', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          return { eventName, date: formattedDate };
        } catch {
          return { eventName, date: datePart };
        }
      }
    }
  ];

  // Try to match against known error patterns
  for (const pattern of errorPatterns) {
    const match = errorMessage.match(pattern.regex);
    if (match) {
      const params = pattern.extractor(match);
      try {
        const translated = i18n.t(pattern.key, params);
        if (translated !== pattern.key) {
          return translated;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to translate API error "${errorMessage}" with key "${pattern.key}":`, error);
        }
      }
    }
  }

  // Fallback: try to translate common generic error messages
  const genericErrors = [
    { pattern: /^Permission denied$/i, key: 'users.errors.permissionDenied' },
    { pattern: /^Cannot delete your own account$/i, key: 'users.errors.cannotDeleteOwnAccount' },
    { pattern: /^This user cannot be deleted because they have associated events, musician assignments, or payment records\. Please remove these associations first or contact an administrator\.$/i, key: 'users.errors.cannotDeleteUserWithAssociations' },
    { pattern: /^Validation error$/i, key: 'users.errors.validationError' },
    { pattern: /^Network error$/i, key: 'users.errors.networkError' },
    { pattern: /^Server error$/i, key: 'users.errors.serverError' }
  ];

  for (const { pattern, key } of genericErrors) {
    if (pattern.test(errorMessage)) {
      try {
        const translated = i18n.t(key);
        if (translated !== key) {
          return translated;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to translate generic error "${errorMessage}" with key "${key}":`, error);
        }
      }
    }
  }

  // If no pattern matches, return the original message
  if (process.env.NODE_ENV === 'development') {
    console.warn(`No translation found for API error "${errorMessage}" in context "${context || 'unknown'}"`);
  }
  return errorMessage;
}

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase
 * Useful for proper names and titles
 * @param value - The string to capitalize
 * @returns The capitalized string or original value if empty
 */
export function capitalizeFirstLetter(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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

  const translateApiErrorMessage = (errorMessage: string, context?: string): string => {
    return translateApiError(errorMessage, context);
  };

  return {
    translateEventStatus,
    translatePaymentType,
    translateUserRole,
    translatePermission,
    translateBackendData,
    translateApiErrorMessage,
  };
}