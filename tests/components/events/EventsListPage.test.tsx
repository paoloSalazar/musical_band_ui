/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { EventsListPage } from '@/app/components/events/EventsListPage';
import { UserProvider } from '@/app/contexts/UserContext';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  eventsApi: {
    list: vi.fn(),
  },
}));

// Import after mocking to get the mocked version
import { eventsApi } from '@/app/lib/api';
const mockEventsApi = eventsApi;

// Mock timezone functions
vi.mock('@/app/lib/timezone', () => ({
  formatDateTimeHumanReadable: vi.fn((date) => `formatted-${date}`),
  formatDate: vi.fn((date) => `date-${date}`),
  formatTime: vi.fn((date) => `time-${date}`),
  formatDateTime: vi.fn((date) => `datetime-${date}`),
  formatDateHumanReadable: vi.fn((date, lang) => `formatted-date-human-${date}-${lang}`),
  formatTimeHumanReadable: vi.fn((date, lang) => `formatted-time-human-${date}-${lang}`),
  formatDateTimeHumanReadableLocalized: vi.fn((date, lang) => `formatted-datetime-localized-${date}-${lang}`),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key, options) => {
      // Return mocked translations for common keys
      const translations = {
        'events.list.title': 'All Events',
        'events.list.totalEvents': 'Total: {{total}} event(s) - Page {{current}} of {{totalPages}}',
        'events.list.createEvent': 'Create Event',
        'events.list.noEvents': 'No events found',
        'events.list.noEventsMessage': 'Create your first event to get started',
        'events.list.table.name': 'Name',
        'events.list.table.place': 'Place',
        'events.list.table.startDate': 'Start Date',
        'events.list.table.endDate': 'End Date',
        'events.list.table.price': 'Price',
        'events.list.table.status': 'Status',
        'events.list.table.actions': 'Actions',
        'events.list.actions.view': 'View Details',
        'events.list.actions.edit': 'Edit',
        'events.list.actions.delete': 'Delete',
        'events.list.loading': 'Loading events...',
        'events.list.error': 'Error loading events',
        'events.list.tryAgain': 'Try Again',
        'events.list.pagination.showing': 'Showing {{from}} to {{to}} of {{total}} events',
        'events.list.pagination.previous': 'Previous',
        'events.list.pagination.next': 'Next',
        'events.list.failedToLoad': 'Failed to load events',
        'events.status.PENDING': 'PENDING',
        'events.status.CONFIRMED': 'CONFIRMED',
        'events.status.CANCELLED': 'CANCELLED',
      };
      const translation = translations[key] || key;
      if (options && typeof translation === 'string') {
        return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => options[key] || match);
      }
      return translation;
    }),
    i18n: {
      language: 'en',
    },
  }),
}));

// Mock useUser hook
const mockUser = {
  id: 1,
  name: 'Test User',
  hasPermission: vi.fn(),
  hasRole: vi.fn(),
};

vi.mock('@/app/contexts/UserContext', () => ({
  UserProvider: ({ children }) => <div data-testid="user-provider">{children}</div>,
  useUser: () => ({
    user: mockUser,
    hasPermission: mockUser.hasPermission,
    hasRole: mockUser.hasRole,
  }),
}));

// Mock UI components
vi.mock('@/app/components/ui/table', () => ({
  Table: ({ children }) => <table data-testid="table">{children}</table>,
  TableBody: ({ children }) => <tbody>{children}</tbody>,
  TableCell: ({ children }) => <td>{children}</td>,
  TableHead: ({ children }) => <th>{children}</th>,
  TableHeader: ({ children }) => <thead>{children}</thead>,
  TableRow: ({ children }) => <tr>{children}</tr>,
}));

vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-${props.variant || 'default'}-${props.size || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/app/components/ui/card', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }) => <div data-testid="card-title">{children}</div>,
}));

// Mock dialog components
vi.mock('@/app/components/events/ViewEventDialog', () => ({
  ViewEventDialog: ({ open, onOpenChange }) => (
    <div data-testid="view-event-dialog" data-open={open}>
      View Dialog
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
}));

vi.mock('@/app/components/events/EditEventDialog', () => ({
  EditEventDialog: ({ open, onOpenChange, onSuccess }) => (
    <div data-testid="edit-event-dialog" data-open={open}>
      Edit Dialog
      <button onClick={onSuccess}>Success</button>
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
}));

vi.mock('@/app/components/events/DeleteEventDialog', () => ({
  DeleteEventDialog: ({ open, onOpenChange, onSuccess }) => (
    <div data-testid="delete-event-dialog" data-open={open}>
      Delete Dialog
      <button onClick={onSuccess}>Success</button>
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
}));

vi.mock('@/app/components/events/CreateEventDialog', () => ({
  CreateEventDialog: ({ open, onOpenChange, onSuccess }) => (
    <div data-testid="create-event-dialog" data-open={open}>
      Create Dialog
      <button onClick={onSuccess}>Success</button>
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Pencil: () => <div data-testid="pencil-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
}));

describe('EventsListPage', () => {
  const mockEvents = [
    {
      id: 1,
      name: 'Test Event 1',
      place: 'Test Venue',
      start_datetime: '2026-01-15T10:00:00Z',
      end_datetime: '2026-01-15T12:00:00Z',
      price: 25.50,
      status: 'CONFIRMED',
      user_id: 1,
      is_all_day: false,
    },
    {
      id: 2,
      name: 'Test Event 2',
      place: 'Another Venue',
      start_datetime: '2026-01-20T14:00:00Z',
      end_datetime: '2026-01-20T16:00:00Z',
      price: null,
      status: 'PENDING',
      user_id: 2,
      is_all_day: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockEventsApi.list.mockResolvedValue({
      data: {
        items: mockEvents,
        total: 2,
        total_pages: 1,
      },
    });
    mockUser.hasPermission.mockReturnValue(true);
    mockUser.hasRole.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loading state initially', () => {
    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    expect(screen.getByTestId('loader-icon')).toBeTruthy();
    expect(screen.getByText('Loading events...')).toBeTruthy();
  });

  it('should load and display events successfully', async () => {
    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('All Events')).toBeTruthy();
    });

    expect(mockEventsApi.list).toHaveBeenCalledWith(1, 10);
    expect(screen.getByText('Test Event 1')).toBeTruthy();
    expect(screen.getByText('Test Event 2')).toBeTruthy();
    expect(screen.getByText('Total: 2 event(s) - Page 1 of 1')).toBeTruthy();
  });

  it('should display events sorted by start datetime', async () => {
    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeTruthy();
    });

    const rows = screen.getAllByTestId(/^table$/).find(el => el.tagName === 'TABLE')?.querySelectorAll('tr');
    // Events should be sorted by start_datetime (Event 1 comes before Event 2)
    expect(screen.getAllByText('Test Event 1')[0]).toBeTruthy();
    expect(screen.getAllByText('Test Event 2')[0]).toBeTruthy();
  });

  it('should show error state when API fails', async () => {
    mockEventsApi.list.mockRejectedValue(new Error('API Error'));

    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading events')).toBeTruthy();
    });

    expect(screen.getByText('API Error')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('should show empty state when no events', async () => {
    mockEventsApi.list.mockResolvedValue({
      data: {
        items: [],
        total: 0,
        total_pages: 0,
      },
    });

    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No events found')).toBeTruthy();
    });

    expect(screen.getByText('Create your first event to get started')).toBeTruthy();
  });

  it('should display event details correctly', async () => {
    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeTruthy();
    });

    // Check event data display
    expect(screen.getByText('Test Venue')).toBeTruthy();
    expect(screen.getByText('formatted-datetime-localized-2026-01-15T10:00:00Z-en')).toBeTruthy();
    expect(screen.getByText('25.50')).toBeTruthy();
    expect(screen.getByText('CONFIRMED')).toBeTruthy();
    expect(screen.getByText('PENDING')).toBeTruthy();
  });

  it('should show create event button for users with permissions', async () => {
    mockUser.hasRole.mockReturnValue(false); // Not admin
    mockUser.hasPermission.mockReturnValue(true);

    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('All Events')).toBeTruthy();
    });

    expect(screen.getByText('Create Event')).toBeTruthy();
  });

  it('should hide create event button for admin users', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin
    mockUser.hasPermission.mockReturnValue(true);

    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('All Events')).toBeTruthy();
    });

    expect(screen.queryByText('Create Event')).toBeFalsy();
  });

  it('should open view dialog when view button is clicked', async () => {
    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeTruthy();
    });

    const viewButtons = screen.getAllByTestId('eye-icon');
    fireEvent.click(viewButtons[0].parentElement!);

    expect(screen.getByTestId('view-event-dialog')).toHaveAttribute('data-open', 'true');
  });

  it('should open edit dialog when edit button is clicked for owned event', async () => {
    mockUser.hasRole.mockReturnValue(false); // Not admin
    mockUser.hasPermission.mockReturnValue(true);

    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeTruthy();
    });

    const editButtons = screen.getAllByTestId('pencil-icon');
    fireEvent.click(editButtons[0].parentElement!);

    expect(screen.getByTestId('edit-event-dialog')).toHaveAttribute('data-open', 'true');
  });

  it('should show delete button for admin users', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin

    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeTruthy();
    });

    expect(screen.getAllByTestId('trash-icon')).toHaveLength(2);
  });

  it('should hide edit button for admin users', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin

    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeTruthy();
    });

    expect(screen.queryByTestId('pencil-icon')).toBeFalsy();
  });

  it('should call onEventUpdated when event is edited successfully', async () => {
    mockUser.hasRole.mockReturnValue(false);
    mockUser.hasPermission.mockReturnValue(true);

    const mockOnEventUpdated = vi.fn();

    render(
      <UserProvider>
        <EventsListPage onEventUpdated={mockOnEventUpdated} />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeTruthy();
    });

    // Open edit dialog
    const editButtons = screen.getAllByTestId('pencil-icon');
    fireEvent.click(editButtons[0].parentElement!);

    // Click success button in edit dialog
    const editDialog = screen.getByTestId('edit-event-dialog');
    const successButton = editDialog.querySelector('button');
    if (successButton && successButton.textContent === 'Success') {
      fireEvent.click(successButton);
    }

    expect(mockOnEventUpdated).toHaveBeenCalled();
  });

  it('should call onEventUpdated when event is deleted successfully', async () => {
    mockUser.hasRole.mockReturnValue(true); // Admin

    const mockOnEventUpdated = vi.fn();

    render(
      <UserProvider>
        <EventsListPage onEventUpdated={mockOnEventUpdated} />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeTruthy();
    });

    // Open delete dialog
    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0].parentElement!);

    // Click success button in delete dialog
    const deleteDialog = screen.getByTestId('delete-event-dialog');
    const successButton = deleteDialog.querySelector('button');
    if (successButton && successButton.textContent === 'Success') {
      fireEvent.click(successButton);
    }

    expect(mockOnEventUpdated).toHaveBeenCalled();
  });

  it('should call onEventUpdated when event is created successfully', async () => {
    mockUser.hasRole.mockReturnValue(false);
    mockUser.hasPermission.mockReturnValue(true);

    const mockOnEventUpdated = vi.fn();

    render(
      <UserProvider>
        <EventsListPage onEventUpdated={mockOnEventUpdated} />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('All Events')).toBeTruthy();
    });

    // Click create button
    const createButton = screen.getByText('Create Event');
    fireEvent.click(createButton);

    // Click success button in create dialog
    const createDialog = screen.getByTestId('create-event-dialog');
    const successButton = createDialog.querySelector('button');
    if (successButton && successButton.textContent === 'Success') {
      fireEvent.click(successButton);
    }

    expect(mockOnEventUpdated).toHaveBeenCalled();
  });

  it('should handle pagination correctly', async () => {
    mockEventsApi.list.mockResolvedValue({
      data: {
        items: mockEvents,
        total: 25,
        total_pages: 3,
      },
    });

    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('All Events')).toBeTruthy();
    });

    expect(screen.getByText('Showing 1 to 10 of 25 events')).toBeTruthy();
    expect(screen.getByText('Next')).toBeTruthy();

    // Click next button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockEventsApi.list).toHaveBeenCalledWith(2, 10);
  });

  it('should disable previous button on first page', async () => {
    mockEventsApi.list.mockResolvedValue({
      data: {
        items: mockEvents,
        total: 25,
        total_pages: 3,
      },
    });

    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('All Events')).toBeTruthy();
    });

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });

  it('should disable previous button on first page', async () => {
    mockEventsApi.list.mockResolvedValue({
      data: {
        items: mockEvents,
        total: 25,
        total_pages: 3,
      },
    });

    render(
      <UserProvider>
        <EventsListPage />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('All Events')).toBeTruthy();
    });

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });
});