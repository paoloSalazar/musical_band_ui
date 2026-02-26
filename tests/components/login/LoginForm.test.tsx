import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/app/components/login/LoginForm';

describe('LoginForm', () => {
  it('renders the login form with all elements', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('The Electric Dreams')).toBeInTheDocument();
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error when submitting empty form', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<LoginForm />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter both email and password')).toBeInTheDocument();
    });
    
    alertSpy.mockRestore();
  });

  it('shows error for invalid credentials', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
    
    alertSpy.mockRestore();
  });

  it('successfully logs in with correct credentials', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@electricdreams.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Login successful!');
    });
    
    alertSpy.mockRestore();
  });

  it('displays demo credentials info', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument();
    expect(screen.getByText('admin@electricdreams.com')).toBeInTheDocument();
    expect(screen.getByText('admin123')).toBeInTheDocument();
  });

  it('shows loading state when submitting', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@electricdreams.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(signInButton);
    
    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
    
    alertSpy.mockRestore();
  });
});
