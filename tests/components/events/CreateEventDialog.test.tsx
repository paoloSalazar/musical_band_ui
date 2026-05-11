/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CreateEventDialog } from '@/app/components/events/CreateEventDialog';
import { UserProvider } from '@/app/contexts/UserContext';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  eventsApi: {
    create: vi.fn(),
  },
}));

// Mock timezone function
vi.mock('@/app/lib/timezone', () => ({
  convertToUTC: vi.fn((dateString) => `utc-${dateString}`),
}));

// Mock UI components
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

vi.mock('@/app/components/ui/input', () => ({
  Input: ({ value, onChange, disabled, ...props }) => (
    <input
      value={value}
      onChange={onChange}
      disabled={disabled}
      data-testid="input"
      {...props}
    />
  ),
}));

vi.mock('@/app/components/ui/label', () => ({
  Label: ({ children, ...props }) => <label {...props}>{children}</label>,
}));

vi.mock('@/app/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, disabled, ...props }) => (
    <textarea
      value={value}
      onChange={onChange}
      disabled={disabled}
      data-testid="textarea"
      {...props}
    />
  ),
}));

vi.mock('@/app/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, disabled, ...props }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      data-testid="checkbox"
      {...props}
    />
  ),
}));

vi.mock('@/app/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }) => (
    open ? (
      <div data-testid="dialog" data-open={open}>
        <button onClick={() => onOpenChange(false)} data-testid="close-dialog">
          Close
        </button>
        {children}
      </div>
    ) : null
  ),
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon" />,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key, options) => {
      // Return mocked translations for common keys
      const translations = {
        'events.create.title': 'Create New Event',
        'events.create.description': 'Add a new event to your schedule.',
        'events.create.failedToCreate': 'Failed to create event',
        'events.create.form.name': 'Name',
        'events.create.form.namePlaceholder': 'e.g., Cumpleaños de Maria',
        'events.create.form.place': 'Place',
        'events.create.form.placePlaceholder': 'e.g., Calle Calama y San Martin, Cochabamba',
        'events.create.form.description': 'Description',
        'events.create.form.descriptionPlaceholder': 'Event description...',
        'events.create.form.allDay': 'All Day',
        'events.create.form.allDayLabel': 'This is an all-day event',
        'events.create.form.startDate': 'Start Date',
        'events.create.form.startTime': 'Start Time',
        'events.create.form.endDate': 'End Date',
        'events.create.form.endTime': 'End Time',
        'events.create.validation.nameRequired': 'Name is required',
        'events.create.validation.placeRequired': 'Place is required',
        'events.create.validation.startDateRequired': 'Start date is required',
        'events.create.validation.startTimeRequired': 'Start time is required',
        'events.create.validation.endDateRequired': 'End date is required',
        'events.create.validation.endTimeRequired': 'End time is required',
        'events.create.validation.cannotCreateInPast': 'Cannot create events in the past',
        'events.create.validation.eventConflict': 'Event conflicts with existing event \'{{eventName}}\' on {{date}}',
        'events.create.buttons.cancel': 'Cancel',
        'events.create.buttons.createEvent': 'Create Event',
      };
      const translation = translations[key] || key;
      if (options && typeof translation === 'string') {
        return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => options[key] || match);
      }
      return translation;
    }),
  }),
}));

// Import after mocking to get the mocked version
import { eventsApi } from '@/app/lib/api';
import { convertToUTC } from '@/app/lib/timezone';

describe('CreateEventDialog', () => {
  const mockEvent = {
    id: 1,
    name: 'Test Event',
    place: 'Test Venue',
    description: 'Test description',
    start_datetime: '2026-01-15T10:00:00Z',
    end_datetime: '2026-01-15T12:00:00Z',
    is_all_day: false,
    price: null,
    status: 'PENDING',
    user_id: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    eventsApi.create.mockResolvedValue({
      data: mockEvent,
    });
    convertToUTC.mockImplementation((dateString) => `utc-${dateString}`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <UserProvider>
        <CreateEventDialog open={true} onOpenChange={() => {}} />
      </UserProvider>
    );

    expect(screen.getByTestId('dialog')).toBeTruthy();
    expect(screen.getByText('Create New Event')).toBeTruthy();
    expect(screen.getByText('Add a new event to your schedule.')).toBeTruthy();
  });

  it('should not render dialog when closed', () => {
    render(
      <UserProvider>
        <CreateEventDialog open={false} onOpenChange={() => {}} />
      </UserProvider>
    );

    expect(screen.queryByTestId('dialog')).toBeFalsy();
  });

  it('should pre-fill dates when initialDate is provided', () => {
    render(
      <UserProvider>
        <CreateEventDialog
          open={true}
          onOpenChange={() => {}}
          initialDate="2026-01-15T10:00:00Z"
        />
      </UserProvider>
    );

    // Check that date inputs are pre-filled
    const dateInputs = screen.getAllByDisplayValue('2026-01-15');
    expect(dateInputs.length).toBe(2); // start and end date
  });

  it('should show all required form fields', () => {
    render(
      <UserProvider>
        <CreateEventDialog open={true} onOpenChange={() => {}} />
      </UserProvider>
    );

    expect(screen.getByText('Name *')).toBeTruthy();
    expect(screen.getByText('Place *')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByText('All Day')).toBeTruthy();
    expect(screen.getByText('Start Date *')).toBeTruthy();
    expect(screen.getByText('End Date *')).toBeTruthy();
  });

  it('should show time fields when not all-day', () => {
    render(
      <UserProvider>
        <CreateEventDialog open={true} onOpenChange={() => {}} />
      </UserProvider>
    );

    expect(screen.getByText('Start Time *')).toBeTruthy();
    expect(screen.getByText('End Time *')).toBeTruthy();
  });

  it('should hide time fields when all-day is checked', () => {
    render(
      <UserProvider>
        <CreateEventDialog open={true} onOpenChange={() => {}} />
      </UserProvider>
    );

    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    expect(screen.queryByText('Start Time *')).toBeFalsy();
    expect(screen.queryByText('End Time *')).toBeFalsy();
  });

  it('should validate required fields', async () => {
    render(
      <UserProvider>
        <CreateEventDialog open={true} onOpenChange={() => {}} />
      </UserProvider>
    );

    const submitButton = screen.getByText('Create Event');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeTruthy();
    });
  });

  it('should validate all required fields', async () => {
    render(
      <UserProvider>
        <CreateEventDialog open={true} onOpenChange={() => {}} />
      </UserProvider>
    );

    // Fill in name only
    const nameInput = screen.getByPlaceholderText('e.g., Cumpleaños de Maria');
    fireEvent.change(nameInput, { target: { value: 'Test Event' } });

    const submitButton = screen.getByText('Create Event');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Place is required')).toBeTruthy();
    });
  });

  it('should create event successfully with valid data', async () => {
    const mockOnSuccess = vi.fn();
    const mockOnOpenChange = vi.fn();

    render(
      <UserProvider>
        <CreateEventDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      </UserProvider>
    );

    // Fill in all required fields using specific IDs
    const nameInput = screen.getByPlaceholderText('e.g., Cumpleaños de Maria');
    const placeInput = screen.getByPlaceholderText('e.g., Calle Calama y San Martin, Cochabamba');
    const descriptionInput = screen.getByPlaceholderText('Event description...');

    fireEvent.change(nameInput, { target: { value: 'Test Event' } });
    fireEvent.change(placeInput, { target: { value: 'Test Venue' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    // Use getByDisplayValue with empty string and specific selectors
    const startDateInput = document.getElementById('create-start-date') as HTMLInputElement;
    const endDateInput = document.getElementById('create-end-date') as HTMLInputElement;
    const startTimeInput = document.getElementById('create-start-time') as HTMLInputElement;
    const endTimeInput = document.getElementById('create-end-time') as HTMLInputElement;

    fireEvent.change(startDateInput, { target: { value: '2026-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2026-01-15' } });
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    fireEvent.change(endTimeInput, { target: { value: '12:00' } });

    const submitButton = screen.getByText('Create Event');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventsApi.create).toHaveBeenCalledWith({
        name: 'Test Event',
        place: 'Test Venue',
        description: 'Test description',
        start_datetime: 'utc-2026-01-15T10:00:00',
        end_datetime: 'utc-2026-01-15T12:00:00',
        is_all_day: false,
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(mockEvent);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should create all-day event correctly', async () => {
    const mockOnSuccess = vi.fn();

    render(
      <UserProvider>
        <CreateEventDialog
          open={true}
          onOpenChange={() => {}}
          onSuccess={mockOnSuccess}
        />
      </UserProvider>
    );

    // Fill in required fields
    const nameInput = screen.getByPlaceholderText('e.g., Cumpleaños de Maria');
    const placeInput = screen.getByPlaceholderText('e.g., Calle Calama y San Martin, Cochabamba');
    const startDateInput = document.getElementById('create-start-date') as HTMLInputElement;
    const endDateInput = document.getElementById('create-end-date') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Test Event' } });
    fireEvent.change(placeInput, { target: { value: 'Test Venue' } });
    fireEvent.change(startDateInput, { target: { value: '2026-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2026-01-15' } });

    // Check all-day
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    const submitButton = screen.getByText('Create Event');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventsApi.create).toHaveBeenCalledWith({
        name: 'Test Event',
        place: 'Test Venue',
        description: undefined,
        start_datetime: '2026-01-15T00:00:00Z',
        end_datetime: '2026-01-15T23:59:59Z',
        is_all_day: true,
      });
    });
  });

  it('should handle API errors', async () => {
    eventsApi.create.mockRejectedValue({
      detail: 'Event creation failed',
    });

    render(
      <UserProvider>
        <CreateEventDialog open={true} onOpenChange={() => {}} />
      </UserProvider>
    );

    // Fill in minimal required fields
    const nameInput = screen.getByPlaceholderText('e.g., Cumpleaños de Maria');
    const placeInput = screen.getByPlaceholderText('e.g., Calle Calama y San Martin, Cochabamba');
    const startDateInput = document.getElementById('create-start-date') as HTMLInputElement;
    const endDateInput = document.getElementById('create-end-date') as HTMLInputElement;
    const startTimeInput = document.getElementById('create-start-time') as HTMLInputElement;
    const endTimeInput = document.getElementById('create-end-time') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Test Event' } });
    fireEvent.change(placeInput, { target: { value: 'Test Venue' } });
    fireEvent.change(startDateInput, { target: { value: '2026-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2026-01-15' } });
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    fireEvent.change(endTimeInput, { target: { value: '12:00' } });

    const submitButton = screen.getByText('Create Event');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Event creation failed')).toBeTruthy();
    });

    expect(eventsApi.create).toHaveBeenCalled();
  });

  it('should translate "Cannot create events in the past" API error', async () => {
    eventsApi.create.mockRejectedValue({
      detail: 'Cannot create events in the past',
    });

    render(
      <UserProvider>
        <CreateEventDialog open={true} onOpenChange={() => {}} />
      </UserProvider>
    );

    // Fill in minimal required fields with a past date
    const nameInput = screen.getByPlaceholderText('e.g., Cumpleaños de Maria');
    const placeInput = screen.getByPlaceholderText('e.g., Calle Calama y San Martin, Cochabamba');
    const startDateInput = document.getElementById('create-start-date') as HTMLInputElement;
    const endDateInput = document.getElementById('create-end-date') as HTMLInputElement;
    const startTimeInput = document.getElementById('create-start-time') as HTMLInputElement;
    const endTimeInput = document.getElementById('create-end-time') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Past Event' } });
    fireEvent.change(placeInput, { target: { value: 'Test Venue' } });
    fireEvent.change(startDateInput, { target: { value: '2020-01-15' } }); // Past date
    fireEvent.change(endDateInput, { target: { value: '2020-01-15' } });
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    fireEvent.change(endTimeInput, { target: { value: '12:00' } });

    const submitButton = screen.getByText('Create Event');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Cannot create events in the past')).toBeTruthy();
    });

    expect(eventsApi.create).toHaveBeenCalled();
  });



  it('should reset form when dialog closes', () => {
    render(
      <UserProvider>
        <CreateEventDialog open={true} onOpenChange={() => {}} />
      </UserProvider>
    );

    // Fill in some data
    const nameInput = screen.getByPlaceholderText('e.g., Cumpleaños de Maria');
    fireEvent.change(nameInput, { target: { value: 'Test Event' } });

    // Close dialog
    const closeButton = screen.getByTestId('close-dialog');
    fireEvent.click(closeButton);

    // Reopen dialog
    render(
      <UserProvider>
        <CreateEventDialog open={true} onOpenChange={() => {}} />
      </UserProvider>
    );

    // Check form is reset
    expect(nameInput.value).toBe('');
  });

  it('should show loading state during submission', async () => {
    render(
      <UserProvider>
        <CreateEventDialog open={true} onOpenChange={() => {}} />
      </UserProvider>
    );

    // Fill in required fields quickly
    const nameInput = screen.getByPlaceholderText('e.g., Cumpleaños de Maria');
    const placeInput = screen.getByPlaceholderText('e.g., Calle Calama y San Martin, Cochabamba');
    const startDateInput = document.getElementById('create-start-date') as HTMLInputElement;
    const endDateInput = document.getElementById('create-end-date') as HTMLInputElement;
    const startTimeInput = document.getElementById('create-start-time') as HTMLInputElement;
    const endTimeInput = document.getElementById('create-end-time') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Test Event' } });
    fireEvent.change(placeInput, { target: { value: 'Test Venue' } });
    fireEvent.change(startDateInput, { target: { value: '2026-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2026-01-15' } });
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    fireEvent.change(endTimeInput, { target: { value: '12:00' } });

    const submitButton = screen.getByText('Create Event');
    fireEvent.click(submitButton);

    // Should show loading spinner
    expect(screen.getByTestId('loader-icon')).toBeTruthy();
    expect(submitButton).toBeDisabled();
  });

  it('should handle empty description', async () => {
    const mockOnSuccess = vi.fn();

    render(
      <UserProvider>
        <CreateEventDialog
          open={true}
          onOpenChange={() => {}}
          onSuccess={mockOnSuccess}
        />
      </UserProvider>
    );

    // Fill in required fields but leave description empty
    const nameInput = screen.getByPlaceholderText('e.g., Cumpleaños de Maria');
    const placeInput = screen.getByPlaceholderText('e.g., Calle Calama y San Martin, Cochabamba');
    const startDateInput = document.getElementById('create-start-date') as HTMLInputElement;
    const endDateInput = document.getElementById('create-end-date') as HTMLInputElement;
    const startTimeInput = document.getElementById('create-start-time') as HTMLInputElement;
    const endTimeInput = document.getElementById('create-end-time') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Test Event' } });
    fireEvent.change(placeInput, { target: { value: 'Test Venue' } });
    fireEvent.change(startDateInput, { target: { value: '2026-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2026-01-15' } });
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    fireEvent.change(endTimeInput, { target: { value: '12:00' } });

    const submitButton = screen.getByText('Create Event');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventsApi.create).toHaveBeenCalledWith({
        name: 'Test Event',
        place: 'Test Venue',
        description: undefined,
        start_datetime: 'utc-2026-01-15T10:00:00',
        end_datetime: 'utc-2026-01-15T12:00:00',
        is_all_day: false,
      });
    });
  });
});