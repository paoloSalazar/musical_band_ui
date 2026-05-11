/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventsPage } from '@/app/components/events/EventsPage';
import { UserProvider } from '@/app/contexts/UserContext';

// Mock useUser hook
const mockUser = { name: 'Test User' };
vi.mock('@/app/contexts/UserContext', () => ({
  UserProvider: ({ children }) => <div data-testid="user-provider">{children}</div>,
  useUser: () => ({
    user: mockUser,
  }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key, options) => {
      // Return mocked translations for common keys
      const translations = {
        'events.page.title': 'Events',
        'events.page.loggedInAs': 'Logged in as: {{name}}',
        'events.page.description': 'Manage your band events and schedule',
        'events.page.views.list': 'List View',
        'events.page.views.calendar': 'Calendar View',
      };
      const translation = translations[key] || key;
      if (options && typeof translation === 'string') {
        return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => options[key] || match);
      }
      return translation;
    }),
  }),
}));

// Mock UI components
vi.mock('@/app/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }) => (
    <div data-testid="tabs" data-value={value} onClick={() => onValueChange?.('calendar')}>
      {children}
    </div>
  ),
  TabsList: ({ children }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }) => (
    <button data-testid={`tab-${value}`} type="button">
      {children}
    </button>
  ),
}));

// Mock child components
vi.mock('@/app/components/events/EventsListPage', () => ({
  EventsListPage: ({ onEventUpdated }) => (
    <div data-testid="events-list-page">
      <button data-testid="trigger-update" onClick={onEventUpdated}>
        Update Event
      </button>
    </div>
  ),
}));

vi.mock('@/app/components/events/CalendarView', () => ({
  CalendarView: ({ onEventUpdated }) => (
    <div data-testid="calendar-view">
      <button data-testid="trigger-update" onClick={onEventUpdated}>
        Update Event
      </button>
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  List: () => <div data-testid="list-icon" />,
}));

describe('EventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the events page with user name and default list view', () => {
    render(
      <UserProvider>
        <EventsPage />
      </UserProvider>
    );

    // Check header elements
    expect(screen.getByText('Events')).toBeTruthy();
    expect(screen.getByText('Logged in as: Test User')).toBeTruthy();
    expect(screen.getByText('Manage your band events and schedule')).toBeTruthy();

    // Check tabs are rendered
    expect(screen.getByTestId('tab-list')).toBeTruthy();
    expect(screen.getByTestId('tab-calendar')).toBeTruthy();

    // Check default view is list
    expect(screen.getByTestId('events-list-page')).toBeTruthy();
    expect(screen.queryByTestId('calendar-view')).toBeFalsy();
  });

  it('should switch to calendar view when calendar tab is clicked', () => {
    render(
      <UserProvider>
        <EventsPage />
      </UserProvider>
    );

    const tabs = screen.getByTestId('tabs');
    fireEvent.click(tabs);

    // Should now show calendar view
    expect(screen.getByTestId('calendar-view')).toBeTruthy();
    expect(screen.queryByTestId('events-list-page')).toBeFalsy();
  });

  it('should refresh list view when event is updated', () => {
    render(
      <UserProvider>
        <EventsPage />
      </UserProvider>
    );

    const updateButton = screen.getByTestId('trigger-update');
    fireEvent.click(updateButton);

    // Component should re-render with new key
    expect(screen.getByTestId('events-list-page')).toBeTruthy();
  });

  it('should refresh calendar view when event is updated', () => {
    render(
      <UserProvider>
        <EventsPage />
      </UserProvider>
    );

    // Switch to calendar view
    const tabs = screen.getByTestId('tabs');
    fireEvent.click(tabs);

    const updateButton = screen.getByTestId('trigger-update');
    fireEvent.click(updateButton);

    // Component should re-render with new key
    expect(screen.getByTestId('calendar-view')).toBeTruthy();
  });
});