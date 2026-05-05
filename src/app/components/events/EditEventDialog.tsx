import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../lib/api';
import type { Event, EventFormData } from '../../lib/types';
import type { ApiError } from '../../lib/api/client';
import { convertToUserTimeZone, convertToUTC, formatDateTime } from '../../lib/timezone';
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

interface EditEventDialogProps {
  eventId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (event: Event) => void;
}

export function EditEventDialog({ eventId, open, onOpenChange, onSuccess }: EditEventDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);

  useEffect(() => {
    if (open && eventId) {
      loadEvent();
    }
  }, [open, eventId]);

  const loadEvent = async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      const response = await eventsApi.getById(eventId);
      const event = response.data;

      setName(event.name);
      setPlace(event.place);
      setDescription(event.description || '');

      // Parse start datetime
      const startDt = convertToUserTimeZone(event.start_datetime);
      setStartDate(formatDateTime(event.start_datetime, 'yyyy-MM-dd'));
      setStartTime(formatDateTime(event.start_datetime, 'HH:mm'));

      // Parse end datetime
      const endDt = convertToUserTimeZone(event.end_datetime);
      setEndDate(formatDateTime(event.end_datetime, 'yyyy-MM-dd'));
      setEndTime(formatDateTime(event.end_datetime, 'HH:mm'));

      setIsAllDay(event.is_all_day);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('events.edit.failedToLoad'));
    } finally {
      setIsLoadingData(false);
    }
  };

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
      setError(t('events.edit.validation.nameRequired'));
      return;
    }
    if (!place.trim()) {
      setError(t('events.edit.validation.placeRequired'));
      return;
    }
    if (!startDate) {
      setError(t('events.edit.validation.startDateRequired'));
      return;
    }
    if (!isAllDay && !startTime) {
      setError(t('events.edit.validation.startTimeRequired'));
      return;
    }
    if (!endDate) {
      setError(t('events.edit.validation.endDateRequired'));
      return;
    }
    if (!isAllDay && !endTime) {
      setError(t('events.edit.validation.endTimeRequired'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const startDateTime = isAllDay
        ? `${startDate}T08:00:00Z`
        : convertToUTC(`${startDate}T${startTime}:00`);

      const endDateTime = isAllDay
        ? `${endDate}T23:00:00Z`
        : convertToUTC(`${endDate}T${endTime}:00`);

      const eventData: Partial<EventFormData> = {
        name: name.trim(),
        place: place.trim(),
        description: description.trim() || undefined,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        is_all_day: isAllDay,
      };

      const response = await eventsApi.update(eventId, eventData);

      handleOpenChange(false);

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || t('events.edit.failedToUpdate'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('events.edit.title')}</DialogTitle>
          <DialogDescription>
            {t('events.edit.description')}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">{t('events.edit.loading')}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  {t('events.edit.form.name')} *
                </Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('events.edit.form.namePlaceholder')}
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>

              {/* Place */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-place" className="text-right">
                  {t('events.edit.form.place')} *
                </Label>
                <Input
                  id="edit-place"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder={t('events.edit.form.placePlaceholder')}
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  {t('events.edit.form.description')}
                </Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('events.edit.form.descriptionPlaceholder')}
                  className="col-span-3"
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              {/* All Day */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-allday" className="text-right">
                  {t('events.edit.form.allDay')}
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="edit-allday"
                    checked={isAllDay}
                    onCheckedChange={(checked) => setIsAllDay(checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="edit-allday" className="text-sm font-normal">
                    {t('events.edit.form.allDayLabel')}
                  </Label>
                </div>
              </div>

              {/* Start Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-start-date" className="text-right">
                  {t('events.edit.form.startDate')} *
                </Label>
                <Input
                  id="edit-start-date"
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
                  <Label htmlFor="edit-start-time" className="text-right">
                    {t('events.edit.form.startTime')} *
                  </Label>
                  <Input
                    id="edit-start-time"
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
                <Label htmlFor="edit-end-date" className="text-right">
                  {t('events.edit.form.endDate')} *
                </Label>
                <Input
                  id="edit-end-date"
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
                  <Label htmlFor="edit-end-time" className="text-right">
                    {t('events.edit.form.endTime')} *
                  </Label>
                  <Input
                    id="edit-end-time"
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
                {t('events.edit.buttons.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('events.edit.buttons.saveChanges')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
