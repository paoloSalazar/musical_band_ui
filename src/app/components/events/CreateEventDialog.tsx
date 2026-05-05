import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../lib/api';
import type { Event, EventFormData } from '../../lib/types';
import type { ApiError } from '../../lib/api/client';
import { convertToUTC } from '../../lib/timezone';
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
  const { t } = useTranslation();
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
      setError(t('events.create.validation.nameRequired'));
      return;
    }
    if (!place.trim()) {
      setError(t('events.create.validation.placeRequired'));
      return;
    }
    if (!startDate) {
      setError(t('events.create.validation.startDateRequired'));
      return;
    }
    if (!isAllDay && !startTime) {
      setError(t('events.create.validation.startTimeRequired'));
      return;
    }
    if (!endDate) {
      setError(t('events.create.validation.endDateRequired'));
      return;
    }
    if (!isAllDay && !endTime) {
      setError(t('events.create.validation.endTimeRequired'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const startDateTime = isAllDay
        ? `${startDate}T00:00:00Z`
        : convertToUTC(`${startDate}T${startTime}:00`);

      const endDateTime = isAllDay
        ? `${endDate}T23:59:59Z`
        : convertToUTC(`${endDate}T${endTime}:00`);

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
      setError(apiError.detail || apiError.message || t('events.create.failedToCreate'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('events.create.title')}</DialogTitle>
          <DialogDescription>
            {t('events.create.description')}
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
                {t('events.create.form.name')} *
              </Label>
              <Input
                id="create-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('events.create.form.namePlaceholder')}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>

            {/* Place */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-place" className="text-right">
                {t('events.create.form.place')} *
              </Label>
              <Input
                id="create-place"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder={t('events.create.form.placePlaceholder')}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-description" className="text-right">
                {t('events.create.form.description')}
              </Label>
              <Textarea
                id="create-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('events.create.form.descriptionPlaceholder')}
                className="col-span-3"
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* All Day */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-allday" className="text-right">
                {t('events.create.form.allDay')}
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="create-allday"
                  checked={isAllDay}
                  onCheckedChange={(checked) => setIsAllDay(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="create-allday" className="text-sm font-normal">
                  {t('events.create.form.allDayLabel')}
                </Label>
              </div>
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-start-date" className="text-right">
                {t('events.create.form.startDate')} *
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
                  {t('events.create.form.startTime')} *
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
                {t('events.create.form.endDate')} *
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
                  {t('events.create.form.endTime')} *
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
              {t('events.create.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('events.create.buttons.createEvent')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
