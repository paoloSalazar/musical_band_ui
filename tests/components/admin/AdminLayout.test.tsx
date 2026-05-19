/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminLayout } from '@/app/components/admin/AdminLayout';

// Mock react-i18next
const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock hooks
vi.mock('@/app/contexts/UserContext', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/app/components/ui/use-mobile', () => ({
  useIsMobile: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

import { useUser } from '@/app/contexts/UserContext';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import { useLocation } from 'react-router-dom';

const mockUseUser = useUser as vi.MockedFunction<typeof useUser>;
const mockUseIsMobile = useIsMobile as vi.MockedFunction<typeof useIsMobile>;
const mockUseLocation = useLocation as vi.MockedFunction<typeof useLocation>;

describe('AdminLayout Component', () => {
  const mockUser = {
    id: 1,
    name: 'Test Admin',
    email: 'admin@test.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the t function mock with interpolation support
    mockT.mockImplementation((key: string, options?: any) => {
      const translations = {
        'admin.title': 'Admin Panel',
        'admin.dashboard': 'Dashboard',
        'admin.users': 'Users',
        'admin.roles': 'User Roles',
        'admin.permissions': 'Permissions',
        'admin.rolePermissions': 'Role Permissions',
        'admin.home': 'Home',
        'admin.logged_in_as': 'Logged in as {{name}}',
      };

      let result = translations[key] || key;

      // Handle interpolation if options are provided
      if (options && typeof options === 'object') {
        Object.keys(options).forEach(param => {
          const placeholder = `{{${param}}}`;
          result = result.replace(placeholder, options[param]);
        });
      }

      return result;
    });
    mockUseUser.mockReturnValue({
      user: mockUser,
    } as any);
    mockUseLocation.mockReturnValue({
      pathname: '/admin',
    } as any);
  });

  it('should render the admin layout with header and navigation', () => {
    mockUseIsMobile.mockReturnValue(false);

    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Logged in as Test Admin')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('User Roles')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
    expect(screen.getByText('Role Permissions')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should highlight active navigation item based on current route', () => {
    mockUseIsMobile.mockReturnValue(false);
    mockUseLocation.mockReturnValue({
      pathname: '/admin/users',
    } as any);

    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );

    const usersLink = screen.getByText('Users');
    expect(usersLink.closest('a')).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('should show mobile menu button on mobile devices', () => {
    mockUseIsMobile.mockReturnValue(true);

    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('should open mobile menu when toggle is clicked', () => {
    mockUseIsMobile.mockReturnValue(true);

    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });

    // Initially, the sheet should not be open
    expect(menuButton).toHaveAttribute('data-state', 'closed');

    fireEvent.click(menuButton);

    // After clicking, the sheet should be open
    expect(menuButton).toHaveAttribute('data-state', 'open');
  });

  it('should hide desktop sidebar on mobile devices', () => {
    mockUseIsMobile.mockReturnValue(true);

    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );

    // Desktop sidebar should be hidden on mobile
    const sidebar = document.querySelector('.hidden.lg\\:block');
    expect(sidebar).toBeInTheDocument();
  });

  it('should show desktop sidebar on larger screens', () => {
    mockUseIsMobile.mockReturnValue(false);

    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );

    // Desktop sidebar should be visible (not hidden)
    const sidebar = document.querySelector('aside');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('hidden', 'lg:block');
  });

  it('should render outlet for child routes', () => {
    mockUseIsMobile.mockReturnValue(false);

    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );

    // The Outlet component should be rendered
    expect(document.querySelector('main')).toBeInTheDocument();
  });

  it('should handle home route active state correctly', () => {
    mockUseIsMobile.mockReturnValue(false);
    mockUseLocation.mockReturnValue({
      pathname: '/',
    } as any);

    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );

    const homeLink = screen.getByText('Home');
    expect(homeLink.closest('a')).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('should handle admin dashboard active state correctly', () => {
    mockUseIsMobile.mockReturnValue(false);
    mockUseLocation.mockReturnValue({
      pathname: '/admin',
    } as any);

    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink.closest('a')).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('should display user name in header when user is available', () => {
    mockUseIsMobile.mockReturnValue(false);

    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );

    expect(screen.getByText('Logged in as Test Admin')).toBeInTheDocument();
  });
});