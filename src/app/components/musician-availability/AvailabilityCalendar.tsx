import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MusicianAvailability } from '../../lib/api/musicianAvailability';

interface AvailabilityCalendarProps {
  availability: MusicianAvailability[];
  onDateClick: (date: Date) => void;
  onDateSelect: (dates: Date[]) => void;
  selectedDates?: Date[];
  mode: 'single' | 'bulk';
  onMonthChange?: (month: Date) => void;
  initialMonth?: Date;
}

export function AvailabilityCalendar({
  availability,
  onDateClick,
  onDateSelect,
  selectedDates = [],
  mode,
  onMonthChange,
  initialMonth
}: AvailabilityCalendarProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (initialMonth) {
      const date = new Date(initialMonth);
      date.setDate(1);
      return date;
    }

    if (availability.length > 0) {
      const earliestUnavailable = availability.reduce((earliest, item) => {
        const itemDate = new Date(item.unavailable_date);
        return itemDate < earliest ? itemDate : earliest;
      }, new Date(availability[0].unavailable_date));
      const date = new Date(earliestUnavailable);
      date.setDate(1);
      return date;
    }

    const today = new Date();
    today.setDate(1);
    return today;
  });

  // Get unavailable dates as Set for quick lookup
  const unavailableDates = new Set(
    availability.map(item => item.unavailable_date)
  );

  // Check if a date is unavailable
  const isUnavailable = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return unavailableDates.has(dateString);
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return selectedDates.some(selectedDate =>
      selectedDate.toISOString().split('T')[0] === dateString
    );
  };

  // Generate calendar days for current month only
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const current = new Date(firstDay);

    while (current <= lastDay) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    if (isUnavailable(date)) return;

    if (mode === 'bulk') {
      // Bulk selection mode
      const isCurrentlySelected = isSelected(date);
      const dateString = date.toISOString().split('T')[0];
      const newSelection = isCurrentlySelected
        ? selectedDates.filter(d => d.toISOString().split('T')[0] !== dateString)
        : [...selectedDates, date];
      onDateSelect(newSelection);
    } else {
      // Single selection mode
      onDateClick(date);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      if (onMonthChange) {
        onMonthChange(newDate);
      }
      return newDate;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent, date: Date) => {
    const { key } = event;
    const isAvailable = !isUnavailable(date);

    if ((key === 'Enter' || key === ' ') && isAvailable) {
      event.preventDefault();
      handleDateClick(date);
    } else if (key.startsWith('Arrow') && isAvailable) {
      event.preventDefault();
      const currentIndex = gridDays.findIndex(d => d && d.toDateString() === date.toDateString());
      if (currentIndex === -1) return;

      let newIndex = currentIndex;
      switch (key) {
        case 'ArrowRight':
          newIndex = currentIndex + 1;
          break;
        case 'ArrowLeft':
          newIndex = currentIndex - 1;
          break;
        case 'ArrowDown':
          newIndex = currentIndex + 7;
          break;
        case 'ArrowUp':
          newIndex = currentIndex - 7;
          break;
      }

      // Find next valid index within bounds with a valid date
      while (newIndex >= 0 && newIndex < gridDays.length) {
        const nextDate = gridDays[newIndex];
        if (nextDate && !isUnavailable(nextDate)) {
          const nextButton = document.querySelector(`[data-date="${nextDate.toISOString().split('T')[0]}"]`) as HTMLElement;
          if (nextButton) {
            nextButton.focus();
          }
          break;
        }
        // Continue in the same direction
        if (key === 'ArrowRight' || key === 'ArrowDown') {
          newIndex++;
        } else {
          newIndex--;
        }
      }
    }
  };

  const calendarDays = generateCalendarDays();
  const monthNames = Array.isArray(t('musicianAvailability.calendar.months', { returnObjects: true })) ?
    t('musicianAvailability.calendar.months', { returnObjects: true }) : [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = Array.isArray(t('musicianAvailability.calendar.days', { returnObjects: true })) ?
    t('musicianAvailability.calendar.days', { returnObjects: true }) : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create grid with empty cells for days before the first day of month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

  const gridDays = [];
  // Add empty cells for days before the first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    gridDays.push(null);
  }
  // Add all the days of the month
  gridDays.push(...calendarDays);

  return (
    <div className="calendar-container bg-white rounded-lg shadow-sm border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-md"
          aria-label={t('musicianAvailability.calendar.previousMonth') === 'musicianAvailability.calendar.previousMonth' ? 'Previous month' : t('musicianAvailability.calendar.previousMonth')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <button
          type="button"
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-md"
          aria-label={t('musicianAvailability.calendar.nextMonth') === 'musicianAvailability.calendar.nextMonth' ? 'Next month' : t('musicianAvailability.calendar.nextMonth')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day: string) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((date, index) => {
          if (!date) {
            // Empty cell
            return <div key={`empty-${index}`} className="p-3"></div>;
          }

          const unavailable = isUnavailable(date);
          const selected = isSelected(date);
          const today = new Date().toDateString() === date.toDateString();

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleDateClick(date)}
              onKeyDown={(e) => handleKeyDown(e, date)}
              disabled={unavailable}
              data-date={date.toISOString().split('T')[0]}
              tabIndex={!unavailable ? 0 : -1}
              className={`
                p-3 text-sm rounded-md border transition-colors
                ${unavailable ? 'bg-red-100 text-red-800 cursor-not-allowed unavailable-date' : 'hover:bg-blue-50 cursor-pointer'}
                ${selected ? 'bg-blue-500 text-white selected-date' : ''}
                ${today && !selected ? 'ring-2 ring-blue-400' : ''}
                ${!unavailable && !selected ? 'available-date' : ''}
              `}
              aria-label={`${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} - ${
                unavailable ? (t('musicianAvailability.calendar.unavailable') === 'musicianAvailability.calendar.unavailable' ? 'Unavailable' : t('musicianAvailability.calendar.unavailable')) :
                selected ? (t('musicianAvailability.calendar.selected') === 'musicianAvailability.calendar.selected' ? 'Selected' : t('musicianAvailability.calendar.selected')) :
                (t('musicianAvailability.calendar.available') === 'musicianAvailability.calendar.available' ? 'Available' : t('musicianAvailability.calendar.available'))
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}