/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MusicianAvailabilityPage } from '@/app/components/musician-availability/MusicianAvailabilityPage';

// Mock react-i18next
const mockT = vi.fn((key: string, options?: any) => {
  // Translation mappings
  const translations: Record<string, string> = {
    'musicianAvailability.title': 'My Availability',
    'musicianAvailability.subtitle': 'Manage your unavailable dates',
    'musicianAvailability.calendar.today': 'Today',
    'musicianAvailability.calendar.available': 'Available',
    'musicianAvailability.calendar.unavailable': 'Unavailable',
    'musicianAvailability.calendar.selectDate': 'Select date',
    'musicianAvailability.form.date': 'Date',
    'musicianAvailability.form.reason': 'Reason (optional)',
    'musicianAvailability.form.reasonPlaceholder': 'e.g., Vacation, Family event, etc.',
    'musicianAvailability.form.addSingle': 'Add Unavailable Date',
    'musicianAvailability.form.addBulk': 'Add Multiple Dates',
    'musicianAvailability.form.edit': 'Edit Availability',
    'musicianAvailability.form.save': 'Save Changes',
    'musicianAvailability.form.cancel': 'Cancel',
    'musicianAvailability.actions.edit': 'Edit',
    'musicianAvailability.actions.delete': 'Delete',
    'musicianAvailability.actions.confirmDelete': 'Remove this unavailable date?',
    'musicianAvailability.messages.added': 'Availability updated successfully',
    'musicianAvailability.messages.deleted': 'Availability removed successfully',
    'musicianAvailability.messages.error': 'Failed to update availability',
    'musicianAvailability.messages.pastDateError': 'Cannot set past dates as unavailable',
    'musicianAvailability.messages.duplicateError': 'This date is already marked as unavailable',
    'musicianAvailability.empty.title': 'No unavailable dates',
    'musicianAvailability.empty.description': 'You haven\'t set any unavailable dates yet.',
  };

  // Check if we have a translation
  if (translations[key]) {
    let result = translations[key];
    // Handle interpolation
    if (options && typeof options === 'object') {
      Object.keys(options).forEach(optKey => {
        result = result.replace(`{{${optKey}}}`, options[optKey]);
      });
    }
    return result;
  }

  // Handle interpolation for keys without translations
  if (options && typeof options === 'object') {
    let result = key;
    Object.keys(options).forEach(optKey => {
      result = result.replace(`{{${optKey}}}`, options[optKey]);
    });
    return result;
  }

  return key;
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock the musician availability API
vi.mock('@/app/lib/api', () => ({
  musicianAvailabilityApi: {
    getByMusician: vi.fn(),
    getByMusicianAndMonth: vi.fn(),
  },
}));

import { musicianAvailabilityApi } from '@/app/lib/api';

const mockMusicianAvailabilityApi = musicianAvailabilityApi as any;

describe('MusicianAvailabilityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  describe('initial render', () => {
    it('should render the page title and subtitle', () => {
      renderWithRouter(<MusicianAvailabilityPage musicianId={1} />);

      expect(screen.getByText('My Availability')).toBeInTheDocument();
      expect(screen.getByText('Manage your unavailable dates')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      // Mock the API to never resolve (loading state)
      mockMusicianAvailabilityApi.getByMusician.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<MusicianAvailabilityPage musicianId={1} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('data loading', () => {
    it('should load availability data on mount', async () => {
      const mockAvailability = [
        {
          id: 1,
          musician_id: 1,
          unavailable_date: '2026-04-22',
          reason: 'Holiday trip',
          created_at: '2026-04-15T10:30:00',
          updated_at: '2026-04-15T10:30:00'
        }
      ];

      mockMusicianAvailabilityApi.getByMusician.mockResolvedValue({
        data: mockAvailability,
        success: true
      });

      renderWithRouter(<MusicianAvailabilityPage musicianId={1} />);

      await waitFor(() => {
        expect(mockMusicianAvailabilityApi.getByMusician).toHaveBeenCalledWith(1);
      });
    });

    it('should display availability list when data is loaded', async () => {
      const mockAvailability = [
        {
          id: 1,
          musician_id: 1,
          unavailable_date: '2026-05-22',
          reason: 'Holiday trip',
          created_at: '2026-05-15T10:30:00',
          updated_at: '2026-05-15T10:30:00'
        }
      ];

      mockMusicianAvailabilityApi.getByMusician.mockResolvedValue({
        data: mockAvailability,
        success: true
      });

      mockMusicianAvailabilityApi.getByMusicianAndMonth.mockResolvedValue({
        data: {
          musician_id: 1,
          year: 2026,
          month: 5,
          unavailable_dates: mockAvailability
        },
        success: true
      });

      renderWithRouter(<MusicianAvailabilityPage musicianId={1} />);

      await waitFor(() => {
        // Wait for the data to be loaded and rendered
        expect(mockMusicianAvailabilityApi.getByMusician).toHaveBeenCalledWith(1);
        expect(mockMusicianAvailabilityApi.getByMusicianAndMonth).toHaveBeenCalledWith(1, 2026, 5);
      });

      // Check that the availability list is rendered
      expect(screen.getByText('Holiday trip')).toBeInTheDocument();
    });

    it('should show empty state when no availability is set', async () => {
      mockMusicianAvailabilityApi.getByMusician.mockResolvedValue({
        data: [],
        success: true
      });

      mockMusicianAvailabilityApi.getByMusicianAndMonth.mockResolvedValue({
        data: {
          musician_id: 1,
          year: 2026,
          month: 5,
          unavailable_dates: []
        },
        success: true
      });

      renderWithRouter(<MusicianAvailabilityPage musicianId={1} />);

      await waitFor(() => {
        expect(screen.getByText('No unavailable dates')).toBeInTheDocument();
        expect(screen.getByText('You haven\'t set any unavailable dates yet.')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should display error message when API fails', async () => {
      mockMusicianAvailabilityApi.getByMusician.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<MusicianAvailabilityPage musicianId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to update availability')).toBeInTheDocument();
      });
    });
  });

  describe('month-based filtering', () => {
    it('should load month-specific availability data', async () => {
      const mockFullAvailability = [
        {
          id: 1,
          musician_id: 1,
          unavailable_date: '2026-04-22',
          reason: 'Holiday trip',
          created_at: '2026-04-15T10:30:00',
          updated_at: '2026-04-15T10:30:00'
        },
        {
          id: 2,
          musician_id: 1,
          unavailable_date: '2026-05-10',
          reason: 'Family event',
          created_at: '2026-04-15T10:30:00',
          updated_at: '2026-04-15T10:30:00'
        }
      ];

      const mockMonthAvailability = [
        {
          id: 2,
          musician_id: 1,
          unavailable_date: '2026-05-10',
          reason: 'Family event',
          created_at: '2026-04-15T10:30:00',
          updated_at: '2026-04-15T10:30:00'
        }
      ];

      mockMusicianAvailabilityApi.getByMusician.mockResolvedValue({
        data: mockFullAvailability,
        success: true
      });

      mockMusicianAvailabilityApi.getByMusicianAndMonth.mockResolvedValue({
        data: {
          musician_id: 1,
          year: 2026,
          month: 5,
          unavailable_dates: mockMonthAvailability
        },
        success: true
      });

      renderWithRouter(<MusicianAvailabilityPage musicianId={1} />);

      await waitFor(() => {
        expect(mockMusicianAvailabilityApi.getByMusician).toHaveBeenCalledWith(1);
        expect(mockMusicianAvailabilityApi.getByMusicianAndMonth).toHaveBeenCalledWith(1, 2026, 5);
      });

      // Should only show May availability in the list
      expect(screen.getByText('Family event')).toBeInTheDocument();
      expect(screen.queryByText('Holiday trip')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should open add availability dialog when add button is clicked', async () => {
      mockMusicianAvailabilityApi.getByMusician.mockResolvedValue({
        data: [],
        success: true
      });

      mockMusicianAvailabilityApi.getByMusicianAndMonth.mockResolvedValue({
        data: {
          musician_id: 1,
          year: 2026,
          month: 5,
          unavailable_dates: []
        },
        success: true
      });

      renderWithRouter(<MusicianAvailabilityPage musicianId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Add Unavailable Date')).toBeInTheDocument();
      });

      // This test will fail initially - we need to implement the component
      // For now, we're just setting up the test structure
    });

    it('should open bulk availability dialog when bulk add button is clicked', async () => {
      mockMusicianAvailabilityApi.getByMusician.mockResolvedValue({
        data: [],
        success: true
      });

      mockMusicianAvailabilityApi.getByMusicianAndMonth.mockResolvedValue({
        data: {
          musician_id: 1,
          year: 2026,
          month: 5,
          unavailable_dates: []
        },
        success: true
      });

      renderWithRouter(<MusicianAvailabilityPage musicianId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Add Multiple Dates')).toBeInTheDocument();
      });

      // This test will fail initially - we need to implement the component
    });
  });
});