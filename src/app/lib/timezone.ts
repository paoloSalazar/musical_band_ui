/**
 * Timezone utilities for converting UTC datetimes to user's local timezone
 */

import { format as formatTz, toZonedTime, fromZonedTime } from 'date-fns-tz';

// Cache the timezone to avoid repeated detection
let cachedTimezone: string | null = null;

/**
 * Get the user's current timezone
 * Uses the browser's timezone or falls back to UTC
 */
export function getUserTimeZone(): string {
  if (cachedTimezone) {
    return cachedTimezone;
  }
  try {
    // Try to get the timezone from Intl API
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      cachedTimezone = tz;
      return tz;
    }
  } catch {
    // Intl API not available
  }
  
  // Fallback: try to detect from browser settings
  try {
    // Attempt to use offset - this is a rough fallback
    new Date().getTimezoneOffset();
    cachedTimezone = 'UTC';
  } catch {
    cachedTimezone = 'UTC';
  }
  
  return cachedTimezone;
}

/**
 * Convert a UTC datetime string to user's local timezone
 * @param utcDateString - ISO 8601 UTC datetime string (e.g., "2026-03-23T13:00:00Z")
 * @returns Date object in user's local timezone
 */
export function convertToUserTimeZone(utcDateString: string): Date {
  if (!utcDateString) {
    return new Date();
  }
  
  // Ensure the string has timezone info (add 'Z' if missing)
  let dateStr = utcDateString;
  if (!utcDateString.endsWith('Z') && !utcDateString.includes('+') && !utcDateString.includes('-', 10)) {
    // No timezone info - assume UTC
    dateStr = utcDateString + 'Z';
  }
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // Invalid date - return current date
    return new Date();
  }
  
  return toZonedTime(date, getUserTimeZone());
}

/**
 * Format a UTC datetime string to display in user's local timezone
 * @param utcDateString - ISO 8601 UTC datetime string
 * @param formatString - Format string (default: "yyyy-MM-dd HH:mm")
 * @returns Formatted datetime string in user's timezone
 */
export function formatDateTime(utcDateString: string, formatString = 'yyyy-MM-dd HH:mm'): string {
  if (!utcDateString) {
    return '';
  }
  
  try {
    const zonedDate = convertToUserTimeZone(utcDateString);
    return formatTz(zonedDate, formatString, { timeZone: getUserTimeZone() });
  } catch (error) {
    // Fallback: just return the original string if formatting fails
    console.warn('[timezone] Error formatting date:', error);
    return utcDateString;
  }
}

/**
 * Format a UTC datetime string to display date only
 * @param utcDateString - ISO 8601 UTC datetime string
 * @returns Formatted date string (e.g., "2026-03-23")
 */
export function formatDate(utcDateString: string): string {
  return formatDateTime(utcDateString, 'yyyy-MM-dd');
}

/**
 * Format a UTC datetime string to display time only
 * @param utcDateString - ISO 8601 UTC datetime string
 * @returns Formatted time string (e.g., "09:00")
 */
export function formatTime(utcDateString: string): string {
  return formatDateTime(utcDateString, 'HH:mm');
}

/**
 * Format a UTC datetime string to display date and time in human-readable format
 * @param utcDateString - ISO 8601 UTC datetime string
 * @returns Formatted datetime string (e.g., "Mar 23, 2026 at 9:00 AM")
 */
function getLocale(locale?: string): string {
  if (locale) {
    return locale;
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }

  return 'en';
}

export function formatDateTimeHumanReadable(utcDateString: string, locale?: string): string {
  if (!utcDateString) {
    return '';
  }

  try {
    const zonedDate = convertToUserTimeZone(utcDateString);
    return zonedDate.toLocaleString(getLocale(locale), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch (error) {
    console.warn('[timezone] Error formatting human readable datetime:', error);
    return utcDateString;
  }
}

/**
 * Convert a local datetime from the UI back to UTC for API submission
 * @param localDateString - Local datetime string from form input
 * @returns UTC datetime string in ISO 8601 format
 */
export function convertToUTC(localDateString: string): string {
  if (!localDateString) {
    return '';
  }
  const localDate = new Date(localDateString);
  const utcDate = fromZonedTime(localDate, getUserTimeZone());
  return utcDate.toISOString();
}

/**
 * Get current datetime in user's timezone as ISO string (without timezone info)
 * Useful for form inputs
 * @returns Local datetime string in "yyyy-MM-ddTHH:mm" format
 */
export function getCurrentLocalDateTime(): string {
  const now = new Date();
  const zonedDate = toZonedTime(now, getUserTimeZone());
  return formatTz(zonedDate, "yyyy-MM-dd'T'HH:mm", { timeZone: getUserTimeZone() });
}

/**
 * Get current date in user's timezone as ISO string
 * @returns Local date string in "yyyy-MM-dd" format
 */
export function getCurrentLocalDate(): string {
  const now = new Date();
  const zonedDate = toZonedTime(now, getUserTimeZone());
  return formatTz(zonedDate, 'yyyy-MM-dd', { timeZone: getUserTimeZone() });
}

/**
 * Get current time in user's timezone as ISO string
 * @returns Local time string in "HH:mm" format
 */
export function getCurrentLocalTime(): string {
  const now = new Date();
  const zonedDate = toZonedTime(now, getUserTimeZone());
  return formatTz(zonedDate, 'HH:mm', { timeZone: getUserTimeZone() });
}

/**
 * Format a UTC datetime string to display date in human-readable format
 * @param utcDateString - ISO 8601 UTC datetime string
 * @param locale - Locale for formatting (defaults to current i18n language)
 * @returns Formatted date string (e.g., "March 23, 2026" or "23 de marzo de 2026")
 */
export function formatDateHumanReadable(utcDateString: string, locale?: string): string {
  if (!utcDateString) {
    return '';
  }

  try {
    const zonedDate = convertToUserTimeZone(utcDateString);
    return zonedDate.toLocaleDateString(getLocale(locale), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.warn('[timezone] Error formatting human readable date:', error);
    return utcDateString;
  }
}

/**
 * Format a UTC datetime string to display date and time in human-readable format
 * @param utcDateString - ISO 8601 UTC datetime string
 * @param locale - Locale for formatting (defaults to current i18n language)
 * @returns Formatted datetime string (e.g., "March 23, 2026, 2:30 PM")
 */
export function formatDateTimeHumanReadableLocalized(utcDateString: string, locale?: string): string {
  if (!utcDateString) {
    return '';
  }

  try {
    const zonedDate = convertToUserTimeZone(utcDateString);
    return zonedDate.toLocaleString(getLocale(locale), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch (error) {
    console.warn('[timezone] Error formatting human readable datetime:', error);
    return utcDateString;
  }
}

/**
 * Format a UTC datetime string to display time only in human-readable format
 * @param utcDateString - ISO 8601 UTC datetime string
 * @param locale - Locale for formatting (defaults to current i18n language)
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTimeHumanReadable(utcDateString: string, locale?: string): string {
  if (!utcDateString) {
    return '';
  }

  try {
    const zonedDate = convertToUserTimeZone(utcDateString);
    return zonedDate.toLocaleTimeString(getLocale(locale), {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch (error) {
    console.warn('[timezone] Error formatting human readable time:', error);
    return utcDateString;
  }
}
