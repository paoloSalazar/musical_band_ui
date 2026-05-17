import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { musicianAvailabilityApi, type BulkAvailabilityRequest } from '../../lib/api/musicianAvailability';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import type { ApiError } from '../../lib/api/client';
import { translateApiError } from '../../../i18n/utils';
import { Loader2, Calendar } from 'lucide-react';

interface BulkAvailabilityDialogProps {
  musicianId: number;
  existingAvailability: Array<{ unavailable_date: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkAvailabilityDialog({
  musicianId,
  existingAvailability,
  open,
  onOpenChange,
  onSuccess,
}: BulkAvailabilityDialogProps) {
  const { t } = useTranslation();

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedDates([]);
      setReason('');
      setError(null);
    }
  }, [open]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const handleDateSelect = (dates: Date[]) => {
    setSelectedDates(dates);
  };

  const validateDates = (): boolean => {
    if (selectedDates.length === 0) {
      setError(t('musicianAvailability.bulk.noDatesSelected'));
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const invalidDates = selectedDates.filter(date => date < today);
    if (invalidDates.length > 0) {
      setError(t('musicianAvailability.messages.pastDateError'));
      return false;
    }

    // Check for dates that are already unavailable
    const conflictingDates = selectedDates.filter(selectedDate =>
      existingAvailability.some(existing =>
        existing.unavailable_date === selectedDate.toISOString().split('T')[0]
      )
    );

    if (conflictingDates.length > 0) {
      setError(t('musicianAvailability.bulk.conflictingDates', {
        count: conflictingDates.length
      }));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDates()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const bulkData: BulkAvailabilityRequest = selectedDates.map(date => ({
        musician_id: musicianId,
        unavailable_date: date.toISOString().split('T')[0],
        reason: reason.trim() || undefined,
      }));

      await musicianAvailabilityApi.createBulk(bulkData);

      // Close dialog
      onOpenChange(false);

      // Reload availability data
      onSuccess();
    } catch (err) {
      const error = err as ApiError;
      const rawMessage = error.detail || error.message || t('musicianAvailability.messages.error');
      const translated = translateApiError(rawMessage);
      setError(translated);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            {t('musicianAvailability.form.addBulk')}
          </DialogTitle>
          <DialogDescription>
            {t('musicianAvailability.bulk.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Calendar for date selection */}
            <div className="space-y-2">
              <Label>{t('musicianAvailability.bulk.selectDates')}</Label>
              <AvailabilityCalendar
                availability={existingAvailability.map(item => ({
                  id: 0,
                  musician_id: musicianId,
                  unavailable_date: item.unavailable_date,
                  reason: '',
                  created_at: '',
                  updated_at: '',
                }))}
                onDateClick={() => {}} // Not used in bulk mode
                onDateSelect={handleDateSelect}
                selectedDates={selectedDates}
                mode="bulk"
              />
              {selectedDates.length > 0 && (
                <p className="text-sm text-gray-600">
                  {t('musicianAvailability.bulk.selectedCount', { count: selectedDates.length })}
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                {t('musicianAvailability.form.reason')}
              </Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('musicianAvailability.form.reasonPlaceholder')}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              {t('musicianAvailability.form.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || selectedDates.length === 0}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('musicianAvailability.bulk.addDates', { count: selectedDates.length })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BulkAvailabilityDialog;