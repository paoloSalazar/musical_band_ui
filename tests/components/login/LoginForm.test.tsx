/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/app/components/login/LoginForm';
import { UserProvider } from '@/app/contexts/UserContext';

// Mock useUser and UserProvider
const mockLogin = vi.fn().mockResolvedValue(undefined);
const mockIsLoading = false;

vi.mock('@/app/contexts/UserContext', () => ({
  UserProvider: ({ children }) => <div data-testid="user-provider">{children}</div>,
  useUser: () => ({
    login: mockLogin,
    isLoading: mockIsLoading,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Music: () => <div data-testid="music-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
}));

// Mock react-i18next
const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
    mockLogin.mockResolvedValue(undefined);
    // Reset the t function mock
    mockT.mockImplementation((key: string) => key);
  });

  it('should render login form with all translated elements', () => {
    // Set up mock translations
    mockT.mockImplementation((key: string) => {
      const translations = {
        'login.title': 'The Electric Dreams',
        'login.subtitle': 'Admin Portal',
        'login.welcomeBack': 'Welcome Back',
        'login.description': 'Sign in to manage your band website',
        'login.email': 'Email',
        'login.password': 'Password',
        'login.signIn': 'Sign In',
        'login.signingIn': 'Signing in...',
        'login.footer': '© 2026 The Electric Dreams. All rights reserved.',
      };
      return translations[key] || key;
    });

    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    // Check main elements are rendered with translations
    expect(screen.getByText('The Electric Dreams')).toBeTruthy();
    expect(screen.getByText('Admin Portal')).toBeTruthy();
    expect(screen.getByText('Welcome Back')).toBeTruthy();
    expect(screen.getByText('Sign in to manage your band website')).toBeTruthy();

    // Check form elements
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeTruthy();
  });

  it('should call translation function with correct keys', () => {
    mockT.mockImplementation((key: string) => `translated-${key}`);

    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    // Check that t() was called with expected keys
    expect(mockT).toHaveBeenCalledWith('login.title');
    expect(mockT).toHaveBeenCalledWith('login.subtitle');
    expect(mockT).toHaveBeenCalledWith('login.welcomeBack');
    expect(mockT).toHaveBeenCalledWith('login.description');
    expect(mockT).toHaveBeenCalledWith('login.email');
    expect(mockT).toHaveBeenCalledWith('login.password');
    expect(mockT).toHaveBeenCalledWith('login.signIn');
    expect(mockT).toHaveBeenCalledWith('login.footer');
  });

  it('should update email and password fields on input', () => {
    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should show validation error when submitting empty form', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'login.signIn': 'Sign In',
        'login.validation.required': 'Please enter both email and password',
      };
      return translations[key] || key;
    });

    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter both email and password')).toBeTruthy();
    });

    // Login should not be called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call login function with correct credentials on valid submit', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'login.email': 'Email',
        'login.password': 'Password',
        'login.signIn': 'Sign In',
      };
      return translations[key] || key;
    });

    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for login to be called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show error message when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    mockT.mockImplementation((key: string) => {
      const translations = {
        'login.email': 'Email',
        'login.password': 'Password',
        'login.signIn': 'Sign In',
      };
      return translations[key] || key;
    });

    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeTruthy();
    });
  });

  it('should not clear error when user starts typing (error only clears on submit)', async () => {
    mockT.mockImplementation((key: string) => {
      const translations = {
        'login.email': 'Email',
        'login.signIn': 'Sign In',
        'login.validation.required': 'Please enter both email and password',
      };
      return translations[key] || key;
    });

    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    // Try to submit empty form to trigger error
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);

    // Error should appear
    await waitFor(() => {
      expect(screen.getByText('Please enter both email and password')).toBeTruthy();
    });

    // Now type in email field - error should NOT clear (per actual implementation)
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'a' } });

    // Error should still be present (the component only clears error on submit, not on change)
    expect(screen.queryByText('Please enter both email and password')).toBeTruthy();
  });
});