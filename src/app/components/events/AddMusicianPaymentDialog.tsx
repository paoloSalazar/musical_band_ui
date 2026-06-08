import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../lib/api';
import type { ApiError } from '../../lib/api/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';
import { translateApiError } from '../../../i18n/utils';

interface AddMusicianPaymentDialogProps {
  eventId: number;
  musicianId: number;
  musicianName: string;
  salary: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddMusicianPaymentDialog({
  eventId,
  musicianId,
  musicianName,
  salary,
  open,
  onOpenChange,
  onSuccess,
}: AddMusicianPaymentDialogProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'ADVANCE' | 'REMAINING' | 'TOTAL'>('ADVANCE');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setAmount('');
      setPaymentType('ADVANCE');
      setNotes('');
      setError(null);
      setIsLoading(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError(t('events.musicianPayments.validation.invalidAmount'));
      return;
    }

    // Basic validation for ADVANCE (≤ 50%)
    if (paymentType === 'ADVANCE' && amountValue > salary * 0.5) {
      setError(t('events.musicianPayments.validation.advanceLimit'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await eventsApi.addMusicianPayment(eventId, musicianId, {
        event_id: eventId,
        musician_id: musicianId,
        amount: amountValue,
        payment_type: paymentType,
        notes: notes || undefined,
      });

      onSuccess?.();
      onOpenChange(false);
      setAmount('');
      setNotes('');
     } catch (err) {
       const apiError = err as ApiError;
       setError(apiError.detail ? translateApiError(apiError.detail) : t('events.musicianPayments.messages.error'));
     } finally {
       setIsLoading(false);
     }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('events.musicianPayments.addTitle')}</DialogTitle>
          <DialogDescription>
            {t('events.musicianPayments.addDescription', { name: musicianName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="amount">{t('events.musicianPayments.form.amount')}</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>{t('events.musicianPayments.form.paymentType')}</Label>
            <Select value={paymentType} onValueChange={(v) => setPaymentType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADVANCE">{t('events.musicianPayments.paymentTypes.ADVANCE')}</SelectItem>
                <SelectItem value="REMAINING">{t('events.musicianPayments.paymentTypes.REMAINING')}</SelectItem>
                <SelectItem value="TOTAL">{t('events.musicianPayments.paymentTypes.TOTAL')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">{t('events.musicianPayments.form.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('events.musicianPayments.form.notesPlaceholder')}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('events.musicianPayments.form.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
