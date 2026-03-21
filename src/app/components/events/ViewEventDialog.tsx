import { useState, useEffect } from 'react';
import { eventsApi } from '../../lib/api';
import type { Event } from '../../lib/types';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Loader2, Pencil, Calendar, MapPin, Clock, User } from 'lucide-react';

interface ViewEventDialogProps {
  eventId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (eventId: number) => void;
  canEditEvent?: boolean;
}

export function ViewEventDialog({ eventId, open, onOpenChange, onEdit, canEditEvent }: ViewEventDialogProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && eventId) {
      loadEvent();
    }
  }, [open, eventId]);

  const loadEvent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventsApi.getById(eventId);
      setEvent(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEdit = () => {
    if (onEdit && eventId) {
      onEdit(eventId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
          <DialogDescription>
            View event information
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading event...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : event ? (
          <div className="space-y-4">
            {/* Event Name */}
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{event.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                event.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.status}
              </span>
            </div>

            {/* Description */}
            {event.description && (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm">{event.description}</p>
              </div>
            )}

            {/* Date & Time */}
            <div className="flex items-start space-x-2">
              <Calendar className="h-4 w-4 mt-1 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-sm">
                  {formatDate(event.start_datetime)}
                  {event.start_datetime !== event.end_datetime && (
                    <> - {formatDate(event.end_datetime)}</>
                  )}
                </p>
              </div>
            </div>

            {/* Time */}
            {!event.is_all_day && (
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 mt-1 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-sm">
                    {formatDateTime(event.start_datetime).split(' ')[1]} - {formatDateTime(event.end_datetime).split(' ')[1]}
                  </p>
                </div>
              </div>
            )}

            {/* All Day */}
            {event.is_all_day && (
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 mt-1 text-gray-500" />
                <p className="text-sm">All day event</p>
              </div>
            )}

            {/* Place */}
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 mt-1 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-sm">{event.place}</p>
              </div>
            </div>

            {/* Created By */}
            {event.created_by && (
              <div className="flex items-start space-x-2">
                <User className="h-4 w-4 mt-1 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Created by</p>
                  <p className="text-sm">
                    {event.created_by.name} {event.created_by.lastname}
                  </p>
                  <p className="text-xs text-gray-500">{event.created_by.email}</p>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter>
          {onEdit && canEditEvent && (
            <Button type="button" onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
