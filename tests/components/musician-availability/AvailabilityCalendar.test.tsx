/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvailabilityCalendar } from '@/app/components/musician-availability/AvailabilityCalendar';

describe('AvailabilityCalendar', () => {
  const mockAvailability = [
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
      unavailable_date: '2026-04-23',
      reason: 'Family vacation',
      created_at: '2026-04-15T11:00:00',
      updated_at: '2026-04-15T11:00:00'
    }
  ];

  const defaultProps = {
    availability: mockAvailability,
    onDateClick: vi.fn(),
    onDateSelect: vi.fn(),
    selectedDates: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render the calendar component', () => {
      render(<AvailabilityCalendar {...defaultProps} />);
      expect(document.querySelector('.calendar-container')).toBeInTheDocument();
    });

    it('should display month and year header', () => {
      render(<AvailabilityCalendar {...defaultProps} />);
      // This test will fail initially - component needs to be implemented
      expect(screen.getByText(/April 2026/)).toBeInTheDocument();
    });

    it('should show day headers', () => {
      render(<AvailabilityCalendar {...defaultProps} />);
      // This test will fail initially - component needs to be implemented
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });
  });

  describe('availability display', () => {
    it('should mark unavailable dates visually', () => {
      render(<AvailabilityCalendar {...defaultProps} />);
      // This test will fail initially - component needs to be implemented
      const unavailableDates = screen.getAllByText('22').concat(screen.getAllByText('23'));
      unavailableDates.forEach(date => {
        expect(date.closest('.unavailable-date')).toBeInTheDocument();
      });
    });

    it('should show available dates as selectable', () => {
      render(<AvailabilityCalendar {...defaultProps} />);
      // This test will fail initially - component needs to be implemented
      const availableDate = screen.getByText('20');
      expect(availableDate.closest('.available-date')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onDateClick when clicking an available date', () => {
      const onDateClick = vi.fn();
      render(<AvailabilityCalendar {...defaultProps} onDateClick={onDateClick} />);

      // This test will fail initially - component needs to be implemented
      const availableDate = screen.getByText('20');
      fireEvent.click(availableDate);

      expect(onDateClick).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should call onDateSelect when selecting multiple dates in bulk mode', () => {
      const onDateSelect = vi.fn();
      const selectedDates = [new Date('2026-04-20'), new Date('2026-04-21')];

      render(
        <AvailabilityCalendar
          {...defaultProps}
          onDateSelect={onDateSelect}
          selectedDates={selectedDates}
        />
      );

      // This test will fail initially - component needs to be implemented
      const date20 = screen.getByText('20');
      const date21 = screen.getByText('21');

      fireEvent.click(date20);
      fireEvent.click(date21);

      expect(onDateSelect).toHaveBeenCalled();
    });

    it('should not allow clicking unavailable dates', () => {
      const onDateClick = vi.fn();
      render(<AvailabilityCalendar {...defaultProps} onDateClick={onDateClick} />);

      // This test will fail initially - component needs to be implemented
      const unavailableDate = screen.getByText('22');
      fireEvent.click(unavailableDate);

      expect(onDateClick).not.toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('should have previous month button', () => {
      render(<AvailabilityCalendar {...defaultProps} />);
      // This test will fail initially - component needs to be implemented
      const prevButton = screen.getByLabelText('Previous month');
      expect(prevButton).toBeInTheDocument();
    });

    it('should have next month button', () => {
      render(<AvailabilityCalendar {...defaultProps} />);
      // This test will fail initially - component needs to be implemented
      const nextButton = screen.getByLabelText('Next month');
      expect(nextButton).toBeInTheDocument();
    });

    it('should change month when navigation buttons are clicked', () => {
      render(<AvailabilityCalendar {...defaultProps} />);
      // This test will fail initially - component needs to be implemented
      const nextButton = screen.getByLabelText('Next month');
      fireEvent.click(nextButton);

      expect(screen.getByText(/May 2026/)).toBeInTheDocument();
    });
  });

  describe('selection modes', () => {
    it('should highlight selected dates in bulk mode', () => {
      const selectedDates = [new Date('2026-04-20')];
      render(<AvailabilityCalendar {...defaultProps} selectedDates={selectedDates} />);

      // This test will fail initially - component needs to be implemented
      const selectedDate = screen.getByText('20');
      expect(selectedDate.closest('.selected-date')).toBeInTheDocument();
    });

    it('should allow toggling date selection in bulk mode', () => {
      const selectedDates = [new Date('2026-04-20')];
      const onDateSelect = vi.fn();

      render(
        <AvailabilityCalendar
          {...defaultProps}
          selectedDates={selectedDates}
          onDateSelect={onDateSelect}
        />
      );

      // This test will fail initially - component needs to be implemented
      const date20 = screen.getByText('20');
      fireEvent.click(date20);

      expect(onDateSelect).toHaveBeenCalledWith([]);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for dates', () => {
      render(<AvailabilityCalendar {...defaultProps} />);
      // This test will fail initially - component needs to be implemented
      const dateButton = screen.getByLabelText('April 20, 2026 - Available');
      expect(dateButton).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<AvailabilityCalendar {...defaultProps} />);
      // This test will fail initially - component needs to be implemented
      const firstDate = screen.getByLabelText('April 1, 2026 - Available');
      firstDate.focus();

      fireEvent.keyDown(firstDate, { key: 'ArrowRight' });
      expect(screen.getByLabelText('April 2, 2026 - Available')).toHaveFocus();
    });
  });
});