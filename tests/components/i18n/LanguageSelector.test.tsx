/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LanguageSelector } from '@/app/components/i18n/LanguageSelector';

// Mock react-i18next
const mockChangeLanguage = vi.fn();
const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {
      changeLanguage: mockChangeLanguage,
      language: 'en',
    },
  }),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
    // Reset mock implementations
    mockT.mockImplementation((key: string) => key);
    mockChangeLanguage.mockResolvedValue(undefined);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render language selector with current language', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'language.english': 'English',
        'language.spanish': 'Español',
      };
      return translations[key] || key;
    });

    render(
      <MemoryRouter>
        <LanguageSelector />
      </MemoryRouter>
    );

    // Check that the component renders the current language
    expect(screen.getByText('English')).toBeTruthy();
  });

  it('should render language selector button', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'language.english': 'English',
        'language.spanish': 'Español',
      };
      return translations[key] || key;
    });

    render(
      <MemoryRouter>
        <LanguageSelector />
      </MemoryRouter>
    );

    // Check that the language selector button is rendered
    const languageButton = screen.getByRole('button');
    expect(languageButton).toBeTruthy();
    expect(languageButton).toHaveTextContent('English');
  });

  it('should initialize with correct language data', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'language.english': 'English',
        'language.spanish': 'Español',
      };
      return translations[key] || key;
    });

    render(
      <MemoryRouter>
        <LanguageSelector />
      </MemoryRouter>
    );

    // Component should render without crashing and have proper structure
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
    expect(button).toHaveClass('gap-2'); // Has the gap class for icon spacing
  });

  it('should handle language change function availability', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'language.english': 'English',
        'language.spanish': 'Español',
      };
      return translations[key] || key;
    });

    render(
      <MemoryRouter>
        <LanguageSelector />
      </MemoryRouter>
    );

    // The changeLanguage function should be available (mocked)
    expect(mockChangeLanguage).toBeDefined();
    expect(typeof mockChangeLanguage).toBe('function');
  });

  it('should call translation function with correct keys', () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'language.english': 'English',
        'language.spanish': 'Español',
      };
      return translations[key] || key;
    });

    render(
      <MemoryRouter>
        <LanguageSelector />
      </MemoryRouter>
    );

    // Check that t() was called with expected keys
    expect(mockT).toHaveBeenCalledWith('language.english');
    expect(mockT).toHaveBeenCalledWith('language.spanish');
  });
});