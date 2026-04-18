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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
    mockLogin.mockResolvedValue(undefined);
  });

  it('should render login form with all elements', () => {
    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    // Check main elements are rendered
    expect(screen.getByText('The Electric Dreams')).toBeTruthy();
    expect(screen.getByText('Admin Portal')).toBeTruthy();
    expect(screen.getByText('Welcome Back')).toBeTruthy();
    expect(screen.getByText('Sign in to manage your band website')).toBeTruthy();
    
    // Check form elements
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
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
    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter both email and password/i)).toBeTruthy();
    });

    // Login should not be called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call login function with correct credentials on valid submit', async () => {
    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

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
    
    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeTruthy();
    });
  });

  it('should not clear error when user starts typing (error only clears on submit)', async () => {
    render(
      <UserProvider>
        <LoginForm />
      </UserProvider>
    );

    // Try to submit empty form to trigger error
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Error should appear
    await waitFor(() => {
      expect(screen.getByText(/please enter both email and password/i)).toBeTruthy();
    });

    // Now type in email field - error should NOT clear (per actual implementation)
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'a' } });

    // Error should still be present (the component only clears error on submit, not on change)
    expect(screen.queryByText(/please enter both email and password/i)).toBeTruthy();
  });
});