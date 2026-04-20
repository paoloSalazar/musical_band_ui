/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '@/app/components/home/HomePage';
import { UserProvider } from '@/app/contexts/UserContext';

// Mock useUser and UserProvider
const mockLogout = vi.fn();

vi.mock('@/app/contexts/UserContext', () => ({
  UserProvider: ({ children }) => <div data-testid="user-provider">{children}</div>,
  useUser: () => ({
    user: {
      id: '1',
      name: 'John',
      lastname: 'Doe',
      role: 'admin',
      permissions: ['read:events', 'read:users', 'read:user_roles']
    },
    logout: mockLogout,
    hasPermission: vi.fn((permission) => {
      const userPermissions = ['read:events', 'read:users', 'read:user_roles'];
      return userPermissions.includes(permission);
    }),
    hasRole: vi.fn((roles) => {
      const userRole = 'admin';
      if (Array.isArray(roles)) {
        return roles.includes(userRole);
      }
      return userRole === roles;
    }),
  }),
}));

// Mock react-i18next
const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockT.mockImplementation((key: string) => {
      const translations = {
        'home.title': 'The Electric Dreams',
        'home.subtitle': 'Rock band creating unforgettable music experiences since 2015',
        'home.profile': 'My Profile',
        'home.logout': 'Logout',
        'home.welcome': 'Welcome to Admin Dashboard',
        'home.description': 'Manage your band website from here',
        'home.cards.members.title': 'Band Members',
        'home.cards.members.description': 'Manage band member profiles and bios',
        'home.cards.members.button': 'Manage Members',
        'home.cards.events.title': 'Events',
        'home.cards.events.description': 'Schedule and manage upcoming shows',
        'home.cards.events.button': 'Manage Events',
        'home.cards.admin.title': 'Admin Panel',
        'home.cards.admin.description': 'User management and permissions',
        'home.cards.admin.button': 'Manage Admin',
        'home.stats.members.title': 'Total Band Members',
        'home.stats.members.description': 'Active members',
        'home.stats.events.title': 'Upcoming Events',
        'home.stats.events.description': 'Scheduled shows',
        'home.stats.admins.title': 'Admin Users',
        'home.stats.admins.description': 'Active administrators',
        'home.debug.title': 'Debug: Your Permissions',
        'home.debug.role': 'Role:',
      };
      return translations[key] || key;
    });
  });

  it('should render homepage with all translated elements', () => {
    render(
      <MemoryRouter>
        <UserProvider>
          <HomePage onLogout={() => {}} />
        </UserProvider>
      </MemoryRouter>
    );

    // Check hero section translations
    expect(screen.getByText('The Electric Dreams')).toBeTruthy();
    expect(screen.getByText('Rock band creating unforgettable music experiences since 2015')).toBeTruthy();
    expect(screen.getByText('My Profile')).toBeTruthy();
    expect(screen.getByText('Logout')).toBeTruthy();

    // Check main content translations
    expect(screen.getByText('Welcome to Admin Dashboard')).toBeTruthy();
    expect(screen.getByText('Manage your band website from here')).toBeTruthy();

    // Check card translations
    expect(screen.getByText('Band Members')).toBeTruthy();
    expect(screen.getByText('Manage band member profiles and bios')).toBeTruthy();
    expect(screen.getByText('Manage Members')).toBeTruthy();

    expect(screen.getByText('Events')).toBeTruthy();
    expect(screen.getByText('Schedule and manage upcoming shows')).toBeTruthy();
    expect(screen.getByText('Manage Events')).toBeTruthy();

    expect(screen.getByText('Admin Panel')).toBeTruthy();
    expect(screen.getByText('User management and permissions')).toBeTruthy();
    expect(screen.getByText('Manage Admin')).toBeTruthy();

    // Check stats translations
    expect(screen.getByText('Total Band Members')).toBeTruthy();
    expect(screen.getByText('Active members')).toBeTruthy();
    expect(screen.getByText('Upcoming Events')).toBeTruthy();
    expect(screen.getByText('Scheduled shows')).toBeTruthy();
    expect(screen.getByText('Admin Users')).toBeTruthy();
    expect(screen.getByText('Active administrators')).toBeTruthy();
  });

  it('should call translation function with correct keys', () => {
    render(
      <MemoryRouter>
        <UserProvider>
          <HomePage onLogout={() => {}} />
        </UserProvider>
      </MemoryRouter>
    );

    // Check that t() was called with expected keys
    expect(mockT).toHaveBeenCalledWith('home.title');
    expect(mockT).toHaveBeenCalledWith('home.subtitle');
    expect(mockT).toHaveBeenCalledWith('home.profile');
    expect(mockT).toHaveBeenCalledWith('home.logout');
    expect(mockT).toHaveBeenCalledWith('home.welcome');
    expect(mockT).toHaveBeenCalledWith('home.description');

    // Check card translations
    expect(mockT).toHaveBeenCalledWith('home.cards.members.title');
    expect(mockT).toHaveBeenCalledWith('home.cards.members.description');
    expect(mockT).toHaveBeenCalledWith('home.cards.members.button');
    expect(mockT).toHaveBeenCalledWith('home.cards.events.title');
    expect(mockT).toHaveBeenCalledWith('home.cards.events.description');
    expect(mockT).toHaveBeenCalledWith('home.cards.events.button');
    expect(mockT).toHaveBeenCalledWith('home.cards.admin.title');
    expect(mockT).toHaveBeenCalledWith('home.cards.admin.description');
    expect(mockT).toHaveBeenCalledWith('home.cards.admin.button');

    // Check stats translations
    expect(mockT).toHaveBeenCalledWith('home.stats.members.title');
    expect(mockT).toHaveBeenCalledWith('home.stats.members.description');
    expect(mockT).toHaveBeenCalledWith('home.stats.events.title');
    expect(mockT).toHaveBeenCalledWith('home.stats.events.description');
    expect(mockT).toHaveBeenCalledWith('home.stats.admins.title');
    expect(mockT).toHaveBeenCalledWith('home.stats.admins.description');
  });

  it('should display user information', () => {
    render(
      <MemoryRouter>
        <UserProvider>
          <HomePage onLogout={() => {}} />
        </UserProvider>
      </MemoryRouter>
    );

    // Check user info is displayed
    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('admin')).toBeTruthy();
  });

  it('should handle logout button click', () => {
    render(
      <MemoryRouter>
        <UserProvider>
          <HomePage onLogout={() => {}} />
        </UserProvider>
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should show debug information in development mode', () => {
    // Mock NODE_ENV to be development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <MemoryRouter>
        <UserProvider>
          <HomePage onLogout={() => {}} />
        </UserProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Debug: Your Permissions')).toBeTruthy();
    expect(screen.getByText('Role: admin')).toBeTruthy();

    // Check permissions are displayed
    expect(screen.getByText('read:events')).toBeTruthy();
    expect(screen.getByText('read:users')).toBeTruthy();
    expect(screen.getByText('read:user_roles')).toBeTruthy();

    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  it('should not show debug information in production mode', () => {
    // Mock NODE_ENV to be production
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <MemoryRouter>
        <UserProvider>
          <HomePage onLogout={() => {}} />
        </UserProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText('Debug: Your Permissions')).not.toBeInTheDocument();

    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });
});