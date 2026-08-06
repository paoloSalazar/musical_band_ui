import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
};

// Get initial language from localStorage or default to 'en'
const getInitialLanguage = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 'en';
  }

  try {
    const stored = localStorage.getItem('i18nextLng');
    if (stored && (stored === 'en' || stored === 'es')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Found stored language in localStorage:', stored);
      }
      return stored;
    }
  } catch (error) {
    // localStorage might not be available in some environments
    console.warn('Could not access localStorage for language detection:', error);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('No stored language found, using default: en');
  }
  return 'en'; // default fallback
};

// Initialize i18n with error handling
try {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: getInitialLanguage(), // Use stored language or default
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      resources,
      // Additional options for better error handling
      returnEmptyString: false,
      returnNull: false,
      compatibilityJSON: 'v3',
      // Language detector configuration - simplified since we handle persistence manually
      detection: {
        // Order of detection methods
        order: ['localStorage', 'navigator'],
        // Keys to lookup language from
        lookupLocalStorage: 'i18nextLng',
        // Don't cache automatically since we handle it manually
        caches: [],
        // Check whitelist for security
        checkWhitelist: true,
        // Only allow these languages
        whitelist: ['en', 'es'],
      },
    });

  // Log successful initialization in development
  if (process.env.NODE_ENV === 'development') {
    console.log('i18n initialized successfully');
    console.log('Initial language set to:', getInitialLanguage());
    console.log('Current i18n.language:', i18n.language);
    console.log('localStorage i18nextLng:', localStorage.getItem('i18nextLng'));
  }
} catch (error) {
  console.error('Failed to initialize i18n:', error);
  // Fallback: initialize with minimal config
  i18n.init({
    lng: 'en',
    resources: {
      en: {
        translation: {
          error: 'Translation error',
          loading: 'Loading...',
        },
      },
    },
  });
}

export default i18n;