import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../lib/api';
import type { Event } from '../../lib/types';
import { useUser } from '../../contexts/UserContext';
import { formatDateTimeHumanReadable, formatDateHumanReadable, formatDateTimeHumanReadableLocalized } from '../../lib/timezone';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Calendar,
  Plus,
} from 'lucide-react';
import { ViewEventDialog } from './ViewEventDialog';
import { EditEventDialog } from './EditEventDialog';
import { DeleteEventDialog } from './DeleteEventDialog';
import { CreateEventDialog } from './CreateEventDialog';

interface EventsListPageProps {
  onEditEvent?: (eventId: number) => void;
  onEventUpdated?: () => void;
}

export function EventsListPage({ onEditEvent, onEventUpdated }: EventsListPageProps) {
  const { t, i18n } = useTranslation();
  const { user, hasPermission, hasRole } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [viewEventId, setViewEventId] = useState<number>(0);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editEventId, setEditEventId] = useState<number>(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<number>(0);
  const [deleteEventName, setDeleteEventName] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Check permissions
  const canEdit = hasPermission('write:events') || hasPermission('update:events');
  const isAdmin = hasRole('admin');
  
  // Admin can only edit price, not create/edit/delete events
  const canCreateEvent = canEdit && !isAdmin;
  const canEditEventAction = canEdit && !isAdmin;
  const canDeleteEvent = isAdmin;

  useEffect(() => {
    loadEvents();
  }, [currentPage, pageSize]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventsApi.list(currentPage, pageSize);
      setEvents(response.data.items);
      setTotal(response.data.total);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('events.list.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  // Sort events by start_datetime ascending
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      return new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime();
    });
  }, [events]);

  // Check if user can edit an event (owns it or is admin)
  const canEditEvent = (event: Event) => {
    if (!user) return false;
    // User can edit if they own the event OR they are an admin
    return event.user_id === user.id || isAdmin;
  };

  const formatDateTime = (dateString: string) => {
    return formatDateTimeHumanReadable(dateString, i18n.language);
  };

  const handleView = (event: Event) => {
    setViewEventId(event.id);
    setViewingEvent(event);
    setViewDialogOpen(true);
  };

  const handleEdit = (eventId: number) => {
    setEditEventId(eventId);
    setEditDialogOpen(true);
    if (onEditEvent) {
      onEditEvent(eventId);
    }
  };

  const handleDelete = (event: Event) => {
    setDeleteEventId(event.id);
    setDeleteEventName(event.name);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">{t('events.list.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">{t('events.list.error')}</p>
            <p className="text-sm">{error}</p>
            <Button onClick={loadEvents} variant="outline" className="mt-4">
              {t('events.list.tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Events Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                {t('events.list.title')}
              </CardTitle>
              <CardDescription>
                {t('events.list.totalEvents', { total, current: currentPage, totalPages })}
              </CardDescription>
            </div>
            {canCreateEvent && (
              <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('events.list.createEvent')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>{t('events.list.noEvents')}</p>
              <p className="text-sm">{t('events.list.noEventsMessage')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('events.list.table.name')}</TableHead>
                      <TableHead>{t('events.list.table.place')}</TableHead>
                      <TableHead>{t('events.list.table.startDate')}</TableHead>
                      <TableHead>{t('events.list.table.endDate')}</TableHead>
                      <TableHead>{t('events.list.table.price')}</TableHead>
                      <TableHead>{t('events.list.table.status')}</TableHead>
                      <TableHead className="text-right">{t('events.list.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell className="text-gray-600">
                          {event.place}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {event.is_all_day ? formatDateHumanReadable(event.start_datetime, i18n.language) : formatDateTimeHumanReadableLocalized(event.start_datetime, i18n.language)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {event.is_all_day ? formatDateHumanReadable(event.end_datetime, i18n.language) : formatDateTimeHumanReadableLocalized(event.end_datetime, i18n.language)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {event.price !== undefined && event.price !== null ? `${event.price.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            event.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                             {t(`events.status.${event.status}`)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               title={t('events.list.actions.view')}
                               onClick={() => handleView(event)}
                             >
                               <Eye className="h-4 w-4" />
                             </Button>
                            {canEditEventAction && canEditEvent(event) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title={t('events.list.actions.edit')}
                                onClick={() => handleEdit(event.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canDeleteEvent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title={t('events.list.actions.delete')}
                                onClick={() => handleDelete(event)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    {t('events.list.pagination.showing', {
                      from: ((currentPage - 1) * pageSize) + 1,
                      to: Math.min(currentPage * pageSize, total),
                      total
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      {t('events.list.pagination.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      {t('events.list.pagination.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Event Dialog */}
      <ViewEventDialog
        eventId={viewEventId}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onEdit={canEditEventAction ? handleEdit : undefined}
        canEditEvent={viewingEvent ? canEditEvent(viewingEvent) : false}
        showEditButton={!isAdmin}
        onPriceUpdate={(event) => {
          // Update the event in the local list
          setEvents(prev => prev.map(e => e.id === event.id ? event : e));
          if (viewingEvent && viewingEvent.id === event.id) {
            setViewingEvent(event);
          }
        }}
      />

      {/* Edit Event Dialog */}
      {canEditEventAction && (
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
      )}

      {/* Delete Event Dialog */}
      {canDeleteEvent && (
        <DeleteEventDialog
          eventId={deleteEventId}
          eventName={deleteEventName}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={() => {
            loadEvents();
            if (onEventUpdated) {
              onEventUpdated();
            }
          }}
        />
      )}

      {/* Create Event Dialog */}
      {canCreateEvent && (
        <CreateEventDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            loadEvents();
            if (onEventUpdated) {
              onEventUpdated();
            }
          }}
        />
      )}
    </div>
  );
}
