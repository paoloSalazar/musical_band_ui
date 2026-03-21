import { useState, useEffect } from 'react';
import { eventsApi } from '../../lib/api';
import type { Event, EventFormData } from '../../lib/types';
import type { ApiError } from '../../lib/api/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Loader2 } from 'lucide-react';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (event: Event) => void;
  initialDate?: string; // ISO date string for pre-filling start date
}

export function CreateEventDialog({ open, onOpenChange, onSuccess, initialDate }: CreateEventDialogProps) {
  // Pre-fill dates when initialDate is provided
  useEffect(() => {
    if (open && initialDate) {
      const date = new Date(initialDate);
      const dateStr = date.toISOString().split('T')[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
    }
  }, [open, initialDate]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);

  const resetForm = () => {
    setName('');
    setPlace('');
    setDescription('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setIsAllDay(false);
    setError(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!place.trim()) {
      setError('Place is required');
      return;
    }
    if (!startDate) {
      setError('Start date is required');
      return;
    }
    if (!isAllDay && !startTime) {
      setError('Start time is required');
      return;
    }
    if (!endDate) {
      setError('End date is required');
      return;
    }
    if (!isAllDay && !endTime) {
      setError('End time is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const startDateTime = isAllDay
        ? `${startDate}T00:00:00`
        : `${startDate} ${startTime}`;

      const endDateTime = isAllDay
        ? `${endDate}T23:59:59`
        : `${endDate} ${endTime}`;

      const eventData: EventFormData = {
        name: name.trim(),
        place: place.trim(),
        description: description.trim() || undefined,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        is_all_day: isAllDay,
      };

      const response = await eventsApi.create(eventData);

      handleOpenChange(false);

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || apiError.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add a new event to your schedule.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-name" className="text-right">
                Name *
              </Label>
              <Input
                id="create-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cumpleaños de Maria"
                className="col-span-3"
                disabled={isLoading}
              />
            </div>

            {/* Place */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-place" className="text-right">
                Place *
              </Label>
              <Input
                id="create-place"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="e.g., Calle Calama y San Martin, Cochabamba"
                className="col-span-3"
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="create-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event description..."
                className="col-span-3"
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* All Day */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-allday" className="text-right">
                All Day
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="create-allday"
                  checked={isAllDay}
                  onCheckedChange={(checked) => setIsAllDay(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="create-allday" className="text-sm font-normal">
                  This is an all-day event
                </Label>
              </div>
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-start-date" className="text-right">
                Start Date *
              </Label>
              <Input
                id="create-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>

            {/* Start Time */}
            {!isAllDay && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-start-time" className="text-right">
                  Start Time *
                </Label>
                <Input
                  id="create-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* End Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-end-date" className="text-right">
                End Date *
              </Label>
              <Input
                id="create-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>

            {/* End Time */}
            {!isAllDay && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-end-time" className="text-right">
                  End Time *
                </Label>
                <Input
                  id="create-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
