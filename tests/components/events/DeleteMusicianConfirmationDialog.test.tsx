/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteMusicianConfirmationDialog } from '@/app/components/events/DeleteMusicianConfirmationDialog';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key, options) => {
      if (key === 'events.musicianManagement.deleteDialog.message' && options?.name) {
        return `Are you sure you want to remove ${options.name} from this event?`;
      }
      const map: Record<string, string> = {
        'events.musicianManagement.deleteDialog.title': 'Delete Musician Assignment',
        'events.musicianManagement.deleteDialog.cancel': 'Cancel',
        'events.musicianManagement.deleteDialog.delete': 'Delete',
      };
      return map[key] || key;
    }),
  }),
}));

describe('DeleteMusicianConfirmationDialog', () => {
  const mockAssignment = {
    id: 1,
    event_id: 3,
    musician_id: 5,
    role: 'Pianist',
    salary: 400.00,
    payment_status: 'PENDING' as const,
    musician_name: 'John',
    musician_lastname: 'Doe',
    created_at: '2026-04-10T09:00:00',
    updated_at: '2026-04-10T09:00:00',
  };

  const mockOnConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <DeleteMusicianConfirmationDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        assignment={mockAssignment}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText('Delete Musician Assignment')).not.toBeInTheDocument();
  });

  it('should render dialog with assignment details when open is true', async () => {
    render(
      <DeleteMusicianConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        assignment={mockAssignment}
        onConfirm={mockOnConfirm}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Delete Musician Assignment')).toBeInTheDocument();
    });
    expect(screen.getByText('Are you sure you want to remove John Doe (Pianist) from this event?')).toBeInTheDocument();
  });

  it('should call onConfirm and onOpenChange when Delete button is clicked', () => {
    render(
      <DeleteMusicianConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        assignment={mockAssignment}
        onConfirm={mockOnConfirm}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledWith(mockAssignment.musician_id);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onOpenChange when Cancel button is clicked', () => {
    render(
      <DeleteMusicianConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        assignment={mockAssignment}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should handle null assignment gracefully', async () => {
    render(
      <DeleteMusicianConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        assignment={null}
        onConfirm={mockOnConfirm}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Delete Musician Assignment')).toBeInTheDocument();
    });
    expect(screen.getByText('Are you sure you want to remove this musician from this event?')).toBeInTheDocument();
  });
});