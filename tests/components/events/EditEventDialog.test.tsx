/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { EditEventDialog } from '@/app/components/events/EditEventDialog';
import { UserProvider } from '@/app/contexts/UserContext';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  eventsApi: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock timezone functions
vi.mock('@/app/lib/timezone', () => ({
  convertToUserTimeZone: vi.fn((dateString) => new Date(dateString)),
  convertToUTC: vi.fn((dateString) => `utc-${dateString}`),
  formatDateTime: vi.fn((dateString, format) => {
    if (format === 'yyyy-MM-dd') return '2026-01-15';
    if (format === 'HH:mm') return '10:00';
    return dateString;
  }),
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

// Import after mocking to get the mocked version
import { eventsApi } from '@/app/lib/api';
import { convertToUserTimeZone, convertToUTC, formatDateTime } from '@/app/lib/timezone';

describe('EditEventDialog', () => {
  const mockEvent = {
    id: 1,
    name: 'Test Event',
    place: 'Test Venue',
    description: 'Test description',
    start_datetime: '2026-01-15T10:00:00Z',
    end_datetime: '2026-01-15T12:00:00Z',
    is_all_day: false,
    price: 25.50,
    status: 'CONFIRMED',
    user_id: 1,
  };

  const updatedEvent = {
    ...mockEvent,
    name: 'Updated Event',
    place: 'Updated Venue',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    eventsApi.getById.mockResolvedValue({
      data: mockEvent,
    });
    eventsApi.update.mockResolvedValue({
      data: updatedEvent,
    });
    convertToUserTimeZone.mockReturnValue(new Date('2026-01-15T10:00:00Z'));
    convertToUTC.mockImplementation((dateString) => `utc-${dateString}`);
    formatDateTime.mockImplementation((dateString, format) => {
      if (format === 'yyyy-MM-dd') return '2026-01-15';
      if (format === 'HH:mm') return '10:00';
      return dateString;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    expect(screen.getByTestId('dialog')).toBeTruthy();
    expect(screen.getByText('Edit Event')).toBeTruthy();
    expect(screen.getByText('Update event information.')).toBeTruthy();
  });

  it('should not render dialog when closed', () => {
    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={false}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    expect(screen.queryByTestId('dialog')).toBeFalsy();
  });

  it('should show loading state when loading event data', () => {
    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    expect(screen.getByTestId('loader-icon')).toBeTruthy();
    expect(screen.getByText('Loading event...')).toBeTruthy();
  });

  it('should load and pre-fill event data', async () => {
    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Event')).toBeTruthy();
    });

    expect(eventsApi.getById).toHaveBeenCalledWith(1);
    expect(screen.getByDisplayValue('Test Venue')).toBeTruthy();
    expect(screen.getByDisplayValue('Test description')).toBeTruthy();
    expect(formatDateTime).toHaveBeenCalledWith('2026-01-15T10:00:00Z', 'yyyy-MM-dd');
    expect(formatDateTime).toHaveBeenCalledWith('2026-01-15T10:00:00Z', 'HH:mm');
  });

  it('should show all required form fields', async () => {
    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Name *')).toBeTruthy();
    });

    expect(screen.getByText('Place *')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByText('All Day')).toBeTruthy();
    expect(screen.getByText('Start Date *')).toBeTruthy();
    expect(screen.getByText('End Date *')).toBeTruthy();
  });

  it('should show time fields when not all-day', async () => {
    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Start Time *')).toBeTruthy();
    });

    expect(screen.getByText('End Time *')).toBeTruthy();
  });

  it('should hide time fields when all-day is checked', async () => {
    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Start Time *')).toBeTruthy();
    });

    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    expect(screen.queryByText('Start Time *')).toBeFalsy();
    expect(screen.queryByText('End Time *')).toBeFalsy();
  });

  it('should validate required fields', async () => {
    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Event')).toBeTruthy();
    });

    // Clear name field
    const nameInput = document.getElementById('edit-name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '' } });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeTruthy();
    });
  });

  it('should update event successfully with valid data', async () => {
    const mockOnSuccess = vi.fn();
    const mockOnOpenChange = vi.fn();

    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      </UserProvider>
    );

    // Wait for form to be populated with event data
    await waitFor(() => {
      expect(document.getElementById('edit-name')!.value).toBe('Test Event');
    });

    // Update form fields
    const nameInput = document.getElementById('edit-name') as HTMLInputElement;
    const placeInput = document.getElementById('edit-place') as HTMLInputElement;
    const descriptionInput = document.getElementById('edit-description') as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: 'Updated Event' } });
    fireEvent.change(placeInput, { target: { value: 'Updated Venue' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventsApi.update).toHaveBeenCalledWith(1, {
        name: 'Updated Event',
        place: 'Updated Venue',
        description: 'Updated description',
        start_datetime: 'utc-2026-01-15T10:00:00',
        end_datetime: 'utc-2026-01-15T10:00:00', // end time matches start time when not modified
        is_all_day: false,
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(updatedEvent);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should update all-day event correctly', async () => {
    const allDayEvent = { ...mockEvent, is_all_day: true };
    eventsApi.getById.mockResolvedValue({
      data: allDayEvent,
    });

    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Event')).toBeTruthy();
    });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventsApi.update).toHaveBeenCalledWith(1, {
        name: 'Test Event',
        place: 'Test Venue',
        description: 'Test description',
        start_datetime: '2026-01-15T08:00:00Z',
        end_datetime: '2026-01-15T23:00:00Z',
        is_all_day: true,
      });
    });
  });

  it('should handle API errors', async () => {
    eventsApi.update.mockRejectedValue({
      detail: 'Update failed',
    });

    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Event')).toBeTruthy();
    });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeTruthy();
    });

    expect(eventsApi.update).toHaveBeenCalled();
  });

  it('should handle load event error', async () => {
    eventsApi.getById.mockRejectedValue(new Error('Load failed'));

    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Load failed')).toBeTruthy();
    });
  });

  it('should reset form when dialog closes', async () => {
    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Event')).toBeTruthy();
    });

    // Update form
    const nameInput = document.getElementById('edit-name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Modified Event' } });

    // Close dialog
    const closeButton = screen.getByTestId('close-dialog');
    fireEvent.click(closeButton);

    // Reopen dialog - should reload original data
    eventsApi.getById.mockResolvedValue({
      data: mockEvent,
    });

    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Event')).toBeTruthy();
    });
  });

  it('should show loading state during submission', async () => {
    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Event')).toBeTruthy();
    });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    // Should show loading spinner
    expect(screen.getByTestId('loader-icon')).toBeTruthy();
    expect(submitButton).toBeDisabled();
  });

  it('should handle empty description', async () => {
    const mockOnSuccess = vi.fn();

    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
          onSuccess={mockOnSuccess}
        />
      </UserProvider>
    );

    // Wait for form to be populated with event data
    await waitFor(() => {
      expect(document.getElementById('edit-name')!.value).toBe('Test Event');
    });

    // Clear description
    const descriptionInput = document.getElementById('edit-description') as HTMLTextAreaElement;
    fireEvent.change(descriptionInput, { target: { value: '' } });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventsApi.update).toHaveBeenCalledWith(1, {
        name: 'Test Event',
        place: 'Test Venue',
        description: undefined,
        start_datetime: 'utc-2026-01-15T10:00:00',
        end_datetime: 'utc-2026-01-15T10:00:00', // end time matches start time when not modified
        is_all_day: false,
      });
    });
  });

  it('should handle event without description', async () => {
    const eventWithoutDesc = { ...mockEvent, description: undefined };
    eventsApi.getById.mockResolvedValue({
      data: eventWithoutDesc,
    });

    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Event')).toBeTruthy();
    });

    const descriptionInput = document.getElementById('edit-description') as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe('');
  });

  it('should convert datetime correctly for all-day events', async () => {
    const allDayEvent = { ...mockEvent, is_all_day: true };
    eventsApi.getById.mockResolvedValue({
      data: allDayEvent,
    });

    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Event')).toBeTruthy();
    });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(eventsApi.update).toHaveBeenCalledWith(1, expect.objectContaining({
        start_datetime: '2026-01-15T08:00:00Z',
        end_datetime: '2026-01-15T23:00:00Z',
      }));
    });
  });

  it('should call onSuccess callback when update succeeds', async () => {
    const mockOnSuccess = vi.fn();

    render(
      <UserProvider>
        <EditEventDialog
          eventId={1}
          open={true}
          onOpenChange={() => {}}
          onSuccess={mockOnSuccess}
        />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Event')).toBeTruthy();
    });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(updatedEvent);
    });
  });
});