import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../lib/api';
import type { Payment, PaymentSummary } from '../../lib/types';
import type { ApiError } from '../../lib/api/client';
import { formatDate as formatDateUtil, formatTime } from '../../lib/timezone';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Loader2, DollarSign, Clock, FileText, CreditCard } from 'lucide-react';

interface ViewPaymentDetailsDialogProps {
  eventId: number;
  eventName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPaymentDetailsDialog({
  eventId,
  eventName,
  open,
  onOpenChange,
}: ViewPaymentDetailsDialogProps) {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && eventId) {
      loadPaymentData();
    }
  }, [open, eventId]);

  const loadPaymentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load both payments and summary in parallel
      const [paymentsResponse, summaryResponse] = await Promise.all([
        eventsApi.getPayments(eventId),
        eventsApi.getPaymentSummary(eventId),
      ]);

      setPayments(paymentsResponse.data);
      setSummary(summaryResponse.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || apiError.message || t('events.payment.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateUtil(dateString);
  };

  const formatTimeOnly = (dateString: string) => {
    return formatTime(dateString);
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) {
      return '0.00';
    }
    return num.toFixed(2);
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'ADVANCE':
        return t('events.payment.ADVANCE');
      case 'REMAINING':
        return t('events.payment.REMAINING');
      case 'FULL':
        return t('events.payment.TOTAL');
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('events.payment.title')}</DialogTitle>
          <DialogDescription>
            {t('events.payment.description', { eventName })}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">{t('events.payment.loading')}</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">
            <p className="font-medium">{t('events.payment.error')}</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Summary */}
            {summary && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {t('events.payment.summary.title')}
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">{t('events.payment.summary.finalPrice')}</p>
                    <p className="font-medium">${formatAmount(summary.final_price)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('events.payment.summary.totalPaid')}</p>
                    <p className="font-medium text-green-600">
                      ${formatAmount(summary.total_paid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('events.payment.summary.remaining')}</p>
                    <p className={`font-medium ${
                      parseFloat(summary.pending_balance) > 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      ${formatAmount(summary.pending_balance)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment History */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                {t('events.payment.history.title')}
              </h4>
              {payments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  {t('events.payment.history.noPayments')}
                </p>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="border rounded-lg p-3 bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              ${formatAmount(payment.amount)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              payment.payment_type === 'FULL'
                                ? 'bg-green-100 text-green-800'
                                : payment.payment_type === 'REMAINING'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getPaymentTypeLabel(payment.payment_type)}
                            </span>
                          </div>
                          {payment.notes && (
                            <p className="text-sm text-gray-500 flex items-start">
                              <FileText className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                              {payment.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p className="flex items-center justify-end">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(payment.payment_date)}
                          </p>
                          <p>{formatTimeOnly(payment.payment_date)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('events.payment.buttons.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}