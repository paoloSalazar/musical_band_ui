import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../lib/api';
import type { ApiError } from '../../lib/api/client';
import { formatDateTimeHumanReadableLocalized, formatDateHumanReadable } from '../../lib/timezone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  salary?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewMusicianPaymentsDialog({
  eventId,
  musicianId,
  musicianName,
  salary,
  open,
  onOpenChange,
}: ViewMusicianPaymentsDialogProps) {
  const { t, i18n } = useTranslation();
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
          <DialogDescription>
            {t('events.musicianPayments.viewDescription')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm text-gray-500">{t('events.musicianPayments.summary.salary')}</p>
                <p className="text-xl font-semibold">
                  {salary !== undefined ? Number(salary).toFixed(2) : '-'}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-500">{t('events.musicianPayments.summary.totalPaid')}</p>
                <p className={`text-xl font-semibold ${
                  salary !== undefined && summary && Number(summary.total_paid) === Number(salary)
                    ? 'text-green-600'
                    : 'text-amber-600'
                }`}>
                  {summary ? Number(summary.total_paid).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">{t('events.musicianPayments.history')}</p>
              {payments.length === 0 ? (
                <p className="text-sm text-gray-500">{t('events.musicianPayments.noPayments')}</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {payments.map((p) => (
                    <li key={p.id} className="border p-2 rounded">
                       <div className="flex justify-between items-center">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                           p.payment_type === 'ADVANCE'   ? 'bg-amber-100 text-amber-800' :
                           p.payment_type === 'REMAINING' ? 'bg-blue-100 text-blue-800'   :
                           p.payment_type === 'TOTAL'     ? 'bg-green-100 text-green-800' :
                           'bg-gray-100 text-gray-800'
                         }`}>
                           {t(`events.musicianPayments.paymentTypes.${p.payment_type}`)}
                         </span>
                         <span className="font-medium">${Number(p.amount).toFixed(2)}</span>
                       </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {formatDateTimeHumanReadableLocalized(p.payment_date, i18n.language)}
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
