import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../lib/api';
import type { Event } from '../../lib/types';
import { useUser } from '../../contexts/UserContext';
import { convertToUserTimeZone } from '../../lib/timezone';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Loader2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ViewEventDialog } from './ViewEventDialog';
import { EditEventDialog } from './EditEventDialog';
import { CreateEventDialog } from './CreateEventDialog';

interface CalendarViewProps {
  onEventUpdated?: () => void;
}

export function CalendarView({ onEventUpdated }: CalendarViewProps) {
  const { t, i18n } = useTranslation();
  const { user, hasPermission, hasRole } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dialog states
  const [viewEventId, setViewEventId] = useState<number>(0);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editEventId, setEditEventId] = useState<number>(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Check permissions
  const canEdit = hasPermission('write:events') || hasPermission('update:events');
  const isAdmin = hasRole('admin');

  // Check if user can edit an event (owns it or is admin)
  const canEditEvent = (event: Event) => {
    if (!user) return false;
    return event.user_id === user.id || isAdmin;
  };

  // Load events when year or month changes
  const loadEvents = useCallback(async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

    try {
      setIsLoading(true);
      setError(null);
      const response = await eventsApi.listForCalendar(year, month);
      setEvents(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('events.calendar.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(nextYear, nextMonth, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = convertToUserTimeZone(event.start_datetime);
      const eventEnd = convertToUserTimeZone(event.end_datetime);
      const checkDate = new Date(date);

      // Normalize times to compare dates only
      const eventStartDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const eventEndDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      const checkDateNorm = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());

      return checkDateNorm >= eventStartDate && checkDateNorm <= eventEndDate;
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format month and year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
  };

  // Handle event click
  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewEventId(event.id);
    setViewingEvent(event);
    setViewDialogOpen(true);
  };

  const handleEdit = (eventId: number) => {
    setEditEventId(eventId);
    setEditDialogOpen(true);
  };

  // Handle clicking on a date cell to create new event
  const handleDateClick = (date: Date) => {
    if (canEdit) {
      setSelectedDate(date.toISOString());
      setCreateDialogOpen(true);
    }
  };

  // Day names - translated
  const dayNames = [
    t('events.calendar.dayNames.sunday'),
    t('events.calendar.dayNames.monday'),
    t('events.calendar.dayNames.tuesday'),
    t('events.calendar.dayNames.wednesday'),
    t('events.calendar.dayNames.thursday'),
    t('events.calendar.dayNames.friday'),
    t('events.calendar.dayNames.saturday')
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">{t('events.calendar.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">{t('events.calendar.error')}</p>
            <p className="text-sm">{error}</p>
            <Button onClick={loadEvents} variant="outline" className="mt-4">
              {t('events.calendar.tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex">
              {t('events.calendar.today')}
            </Button>
          </div>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold capitalize text-center">
          {formatMonthYear(currentDate)}
        </h2>
        <div className="hidden sm:block" />
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7">
                {/* Day headers */}
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-gray-500 border-b"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day.date);
                  return (
                    <div
                      key={index}
                      onClick={() => canEdit && handleDateClick(day.date)}
                      className={`min-h-[100px] p-1 border-b border-r cursor-pointer hover:bg-gray-50 ${
                        !day.isCurrentMonth ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div
                        className={`text-sm font-medium p-1 ${
                          isToday(day.date)
                            ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center'
                            : day.isCurrentMonth
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }`}
                      >
                        {day.date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => handleEventClick(event, e)}
                            className={`text-xs p-1 rounded cursor-pointer truncate ${
                              event.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : event.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : event.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            title={event.name}
                          >
                            {event.name}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 pl-1">
                            {t('events.calendar.moreEvents', { count: dayEvents.length - 3 })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Event Dialog */}
      <ViewEventDialog
        eventId={viewEventId}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onEdit={canEdit ? handleEdit : undefined}
        canEditEvent={viewingEvent ? canEditEvent(viewingEvent) : false}
      />

      {/* Edit Event Dialog */}
      <EditEventDialog
        eventId={editEventId}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          loadEvents();
          if (onEventUpdated) {
            onEventUpdated();
          }
        }}
      />

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        initialDate={selectedDate || undefined}
        onSuccess={() => {
          loadEvents();
          if (onEventUpdated) {
            onEventUpdated();
          }
        }}
      />
    </div>
  );
}
