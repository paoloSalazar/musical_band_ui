/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EventMusicianManagement } from '@/app/components/events/EventMusicianManagement';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key, options) => {
      const translations = {
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.back': 'Back',
        'events.musicianManagement.title': 'Musicians for Event {{eventId}}',
        'events.musicianManagement.description': 'Manage musicians assigned to this event',
        'events.musicianManagement.assignedMusicians': 'Assigned Musicians',
        'events.musicianManagement.tableComingSoon': 'Musician table will be implemented here'
      };
      const translation = translations[key] || key;
      if (options && typeof translation === 'string' && translation.includes('{{eventId}}')) {
        return translation.replace('{{eventId}}', options.eventId || '');
      }
      return translation;
    }),
  }),
}));

// Mock useUser hook
const mockUser = {
  id: 1,
  name: 'Test User',
  hasRole: vi.fn(),
  hasPermission: vi.fn(),
};

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/app/contexts/UserContext', () => ({
  useUser: () => mockUser,
}));

// Mock API
vi.mock('@/app/lib/api', () => ({
  eventsApi: {
    getEventMusicians: vi.fn(),
  },
}));

import { eventsApi } from '@/app/lib/api';
import { useParams } from 'react-router-dom';

const mockEventsApi = vi.mocked(eventsApi);
const mockUseParams = vi.mocked(useParams);

describe('EventMusicianManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockUser.hasPermission.mockReturnValue(true); // Has permission by default
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  describe('initial render', () => {
    it('should show loading state initially', () => {
      mockUseParams.mockReturnValue({ eventId: '1' });
      mockEventsApi.getEventMusicians.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter(<EventMusicianManagement />);

      expect(screen.getByText('Loading...')).toBeTruthy();
    });

    it('should load musicians data on mount', async () => {
      mockUseParams.mockReturnValue({ eventId: '1' });
      const mockMusicians = [
        {
          id: 1,
          event_id: 1,
          musician_id: 5,
          role: 'Pianist',
          salary: 400.00,
          payment_status: 'PENDING' as const,
          musician_name: 'John',
          musician_lastname: 'Doe',
          created_at: '2026-04-10T09:00:00',
          updated_at: '2026-04-10T09:00:00'
        }
      ];

      mockEventsApi.getEventMusicians.mockResolvedValue({
        data: mockMusicians,
        success: true,
      });

      renderWithRouter(<EventMusicianManagement />);

      await waitFor(() => {
        expect(mockEventsApi.getEventMusicians).toHaveBeenCalledWith(1);
      });

      expect(screen.getByText('Assigned Musicians')).toBeTruthy();
      expect(screen.getByText('Loaded 1 musicians')).toBeTruthy();
    });

    it('should display correct title with event ID', async () => {
      mockUseParams.mockReturnValue({ eventId: '123' });
      mockEventsApi.getEventMusicians.mockResolvedValue({
        data: [],
        success: true,
      });

      renderWithRouter(<EventMusicianManagement />);

      await waitFor(() => {
        expect(screen.getByText('Musicians for Event 123')).toBeTruthy();
      });

      expect(screen.getByText('Manage musicians assigned to this event')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should display error message when API fails', async () => {
      mockUseParams.mockReturnValue({ eventId: '1' });
      mockEventsApi.getEventMusicians.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<EventMusicianManagement />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeTruthy();
      });

      expect(screen.getByText('API Error')).toBeTruthy();
    });
  });

  describe('authorization', () => {
    it('should redirect unauthorized users', () => {
      mockUser.hasPermission.mockReturnValue(false); // No permission

      renderWithRouter(<EventMusicianManagement />);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should allow authorized users to view the page', async () => {
      mockUseParams.mockReturnValue({ eventId: '1' });
      mockUser.hasPermission.mockReturnValue(true);
      mockEventsApi.getEventMusicians.mockResolvedValue({
        data: [],
        success: true,
      });

      renderWithRouter(<EventMusicianManagement />);

      await waitFor(() => {
        expect(screen.getByText('Assigned Musicians')).toBeTruthy();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('should navigate back to events page when back button is clicked', async () => {
      mockUseParams.mockReturnValue({ eventId: '1' });
      mockEventsApi.getEventMusicians.mockResolvedValue({
        data: [],
        success: true,
      });

      renderWithRouter(<EventMusicianManagement />);

      await waitFor(() => {
        expect(screen.getByText('Back')).toBeTruthy();
      });

      const backButton = screen.getByText('Back');
      backButton.click();

      expect(mockNavigate).toHaveBeenCalledWith('/events');
    });
  });

  describe('invalid parameters', () => {
    it('should not call API when eventId parameter is missing', () => {
      mockUseParams.mockReturnValue({}); // No eventId

      renderWithRouter(<EventMusicianManagement />);

      // Should not call the API
      expect(mockEventsApi.getEventMusicians).not.toHaveBeenCalled();
    });
  });
});