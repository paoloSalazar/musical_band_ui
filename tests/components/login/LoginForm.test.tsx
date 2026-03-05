import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/app/components/login/LoginForm';

const mockOnLoginSuccess = vi.fn();

// Mock the authService module
const mockLogin = vi.fn();

vi.mock('@/app/lib/api', () => ({
  authService: {
    login: (...args: unknown[]) => mockLogin(...args),
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mockOnLoginSuccess.mockClear();
    mockLogin.mockClear();
  });

  it('renders the login form with all elements', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    expect(screen.getByText('The Electric Dreams')).toBeInTheDocument();
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error when submitting empty form', async () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter both email and password')).toBeInTheDocument();
    });
  });

  it('shows error for invalid credentials', async () => {
    // Mock failed login response
    mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));
    
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('successfully logs in with correct credentials', async () => {
    // Mock successful login response
    mockLogin.mockResolvedValueOnce({
      access_token: 'mock-token-123',
      token_type: 'Bearer',
      user: {
        id: 1,
        email: 'admin@electricdreams.com',
        name: 'Admin User',
        role: 'admin',
      },
    });
    
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@electricdreams.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('displays API configuration info', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    expect(screen.getByText('API Configuration:')).toBeInTheDocument();
    expect(screen.getByText(/http:\/\/localhost:8000\/api/)).toBeInTheDocument();
  });

  it('shows loading state when submitting', async () => {
    // Mock successful login response
    mockLogin.mockResolvedValueOnce({
      access_token: 'mock-token-123',
      token_type: 'Bearer',
      user: {
        id: 1,
        email: 'admin@electricdreams.com',
        name: 'Admin User',
        role: 'admin',
      },
    });
    
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@electricdreams.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(signInButton);
    
    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
