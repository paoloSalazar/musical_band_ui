import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { musicianAvailabilityApi, type CreateAvailabilityRequest } from '../../lib/api/musicianAvailability';
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
import { Loader2, Calendar } from 'lucide-react';

interface AddAvailabilityDialogProps {
  musicianId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddAvailabilityDialog({
  musicianId,
  open,
  onOpenChange,
  onSuccess,
}: AddAvailabilityDialogProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<CreateAvailabilityRequest>({
    musician_id: musicianId,
    unavailable_date: '',
    reason: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        musician_id: musicianId,
        unavailable_date: '',
        reason: '',
      });
      setError(null);
    }
  }, [open, musicianId]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const handleChange = (field: keyof CreateAvailabilityRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateDate = (dateString: string): boolean => {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

    if (selectedDate < today) {
      setError(t('musicianAvailability.messages.pastDateError'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.unavailable_date) {
      setError(t('musicianAvailability.form.dateRequired'));
      return;
    }

    if (!validateDate(formData.unavailable_date)) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await musicianAvailabilityApi.create(formData);

      // Close dialog
      onOpenChange(false);

      // Reload availability data
      onSuccess();
    } catch (err) {
      const error = err as ApiError;
      if (error.detail?.includes('duplicate') || error.message?.includes('duplicate')) {
        setError(t('musicianAvailability.messages.duplicateError'));
      } else {
        setError(error.detail || error.message || t('musicianAvailability.messages.error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            {t('musicianAvailability.form.addSingle')}
          </DialogTitle>
          <DialogDescription>
            {t('musicianAvailability.form.addSingleDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unavailable_date" className="text-right">
                {t('musicianAvailability.form.date')} *
              </Label>
              <Input
                id="unavailable_date"
                type="date"
                value={formData.unavailable_date}
                onChange={(e) => handleChange('unavailable_date', e.target.value)}
                min={today}
                className="col-span-3"
                disabled={isLoading}
                required
              />
            </div>

            {/* Reason */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                {t('musicianAvailability.form.reason')}
              </Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('musicianAvailability.form.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddAvailabilityDialog;