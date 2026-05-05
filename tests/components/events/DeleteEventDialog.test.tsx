/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DeleteEventDialog } from '@/app/components/events/DeleteEventDialog';

// Mock the API
vi.mock('@/app/lib/api', () => ({
  eventsApi: {
    delete: vi.fn(),
  },
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
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key, options) => {
      // Return mocked translations for common keys
      const translations = {
        'events.delete.title': 'Delete Event',
        'events.delete.description': 'Are you sure you want to delete this event? This action cannot be undone.',
        'events.delete.failedToDelete': 'Failed to delete event',
        'events.delete.eventLabel': 'Event: {{eventName}}',
        'events.delete.warning': 'This will permanently delete the event and all its information.',
        'events.delete.buttons.cancel': 'Cancel',
        'events.delete.buttons.deleteEvent': 'Delete Event',
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

describe('DeleteEventDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventsApi.delete.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByTestId('dialog')).toBeTruthy();
    expect(screen.getByTestId('alert-triangle-icon')).toBeTruthy();
    expect(screen.getByText('Are you sure you want to delete this event? This action cannot be undone.')).toBeTruthy();
    expect(screen.getByText('Event: Test Event')).toBeTruthy();
  });

  it('should not render dialog when closed', () => {
    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={false}
        onOpenChange={() => {}}
      />
    );

    expect(screen.queryByTestId('dialog')).toBeFalsy();
  });

  it('should show warning icon and message', () => {
    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByTestId('alert-triangle-icon')).toBeTruthy();
    expect(screen.getByText('This will permanently delete the event and all its information.')).toBeTruthy();
  });

  it('should have Cancel and Delete Event buttons', () => {
    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByTestId('button-destructive-default')).toBeTruthy();
  });

  it('should call onOpenChange with false when Cancel is clicked', () => {
    const mockOnOpenChange = vi.fn();

    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onOpenChange with false when close button is clicked', () => {
    const mockOnOpenChange = vi.fn();

    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const closeButton = screen.getByTestId('close-dialog');
    fireEvent.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should delete event successfully', async () => {
    const mockOnSuccess = vi.fn();
    const mockOnOpenChange = vi.fn();

    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const deleteButton = screen.getByTestId('button-destructive-default');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(eventsApi.delete).toHaveBeenCalledWith(1);
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show loading state during deletion', async () => {
    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    const deleteButton = screen.getByTestId('button-destructive-default');
    fireEvent.click(deleteButton);

    // Should show loading spinner
    expect(screen.getByTestId('loader-icon')).toBeTruthy();
    expect(deleteButton).toBeDisabled();

    // Wait for the operation to complete
    await waitFor(() => {
      expect(eventsApi.delete).toHaveBeenCalledWith(1);
    });
  });

  it('should handle API errors', async () => {
    eventsApi.delete.mockRejectedValue({
      detail: 'Deletion failed',
    });

    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    const deleteButton = screen.getByTestId('button-destructive-default');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Deletion failed')).toBeTruthy();
    });

    expect(eventsApi.delete).toHaveBeenCalled();
    // Dialog should remain open on error
    expect(screen.getByTestId('dialog')).toBeTruthy();
  });

  it('should disable buttons during loading', () => {
    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    const deleteButton = screen.getByTestId('button-destructive-default');
    const cancelButton = screen.getByText('Cancel');

    // Initially buttons should be enabled
    expect(deleteButton).not.toBeDisabled();
    expect(cancelButton).not.toBeDisabled();

    fireEvent.click(deleteButton);

    // During loading, buttons should be disabled
    expect(deleteButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should handle different event names', () => {
    const testCases = [
      'Birthday Party',
      'Concert Event',
      'Meeting',
      'Special Occasion',
    ];

    testCases.forEach((eventName) => {
      const { rerender } = render(
        <DeleteEventDialog
          eventId={1}
          eventName={eventName}
          open={true}
          onOpenChange={() => {}}
        />
      );

      expect(screen.getByText(`Event: ${eventName}`)).toBeTruthy();

      rerender(
        <DeleteEventDialog
          eventId={1}
          eventName="Different Event"
          open={true}
          onOpenChange={() => {}}
        />
      );
    });
  });

  it('should call eventsApi.delete with correct eventId', async () => {
    const testEventIds = [1, 42, 100, 999];

    for (const eventId of testEventIds) {
      eventsApi.delete.mockClear();

      const { unmount } = render(
        <DeleteEventDialog
          eventId={eventId}
          eventName="Test Event"
          open={true}
          onOpenChange={() => {}}
        />
      );

      const deleteButton = screen.getByTestId('button-destructive-default');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(eventsApi.delete).toHaveBeenCalledWith(eventId);
      });

      // Clean up to avoid multiple dialogs
      unmount();
    }
  });

  it('should handle generic API error', async () => {
    eventsApi.delete.mockRejectedValue(new Error('Network error'));

    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    const deleteButton = screen.getByTestId('button-destructive-default');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeTruthy();
    });
  });

  it('should handle API error with message property', async () => {
    eventsApi.delete.mockRejectedValue({
      message: 'Custom error message',
    });

    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    const deleteButton = screen.getByTestId('button-destructive-default');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Custom error message')).toBeTruthy();
    });
  });

  it('should clear error when retrying after failure', async () => {
    eventsApi.delete.mockRejectedValueOnce({
      detail: 'First error',
    }).mockResolvedValueOnce({});

    render(
      <DeleteEventDialog
        eventId={1}
        eventName="Test Event"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // First attempt - should fail
    const deleteButton = screen.getByTestId('button-destructive-default');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeTruthy();
    });

    // Second attempt - should succeed
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('First error')).toBeFalsy();
    });

    expect(eventsApi.delete).toHaveBeenCalledTimes(2);
  });
});