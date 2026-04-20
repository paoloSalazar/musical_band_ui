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

// Initialize i18n with error handling
try {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: 'en', // default language
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
    });

  // Log successful initialization in development
  if (process.env.NODE_ENV === 'development') {
    console.log('i18n initialized successfully');
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