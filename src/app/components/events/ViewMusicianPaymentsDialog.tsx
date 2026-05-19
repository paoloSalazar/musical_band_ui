import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../lib/api';
import type { ApiError } from '../../lib/api/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Loader2 } from 'lucide-react';

interface MusicianPayment {
  id: number;
  amount: number;
  payment_type: string;
  payment_date: string;
  notes?: string;
}

interface ViewMusicianPaymentsDialogProps {
  eventId: number;
  musicianId: number;
  musicianName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewMusicianPaymentsDialog({
  eventId,
  musicianId,
  musicianName,
  open,
  onOpenChange,
}: ViewMusicianPaymentsDialogProps) {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<MusicianPayment[]>([]);
  const [summary, setSummary] = useState<{ total_paid: number; payment_count: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadPayments();
    }
  }, [open, eventId, musicianId]);

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        eventsApi.getMusicianPayments(eventId, musicianId),
        eventsApi.getMusicianPaymentSummary(eventId, musicianId),
      ]);
      setPayments(paymentsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || t('events.musicianPayments.messages.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t('events.musicianPayments.viewTitle', { name: musicianName })}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="font-medium">{t('events.musicianPayments.summary.totalPaid')}</p>
              <p className="text-2xl font-semibold">
                {summary ? summary.total_paid.toFixed(2) : '0.00'}
              </p>
            </div>

            <div>
              <p className="font-medium mb-2">{t('events.musicianPayments.history')}</p>
              {payments.length === 0 ? (
                <p className="text-sm text-gray-500">{t('events.musicianPayments.noPayments')}</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {payments.map((p) => (
                    <li key={p.id} className="border p-2 rounded">
                      <div className="flex justify-between">
                        <span>{p.payment_type}</span>
                        <span className="font-medium">${p.amount.toFixed(2)}</span>
                      </div>
                      {p.notes && <p className="text-gray-500 text-xs mt-1">{p.notes}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
