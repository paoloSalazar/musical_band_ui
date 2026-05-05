import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../lib/api';
import type { PaymentType, PaymentSummary } from '../../lib/types';
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
import { Loader2, DollarSign, AlertCircle } from 'lucide-react';

interface MakePaymentDialogProps {
  eventId: number;
  eventName: string;
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: () => void;
}

export function MakePaymentDialog({
  eventId,
  eventName,
  userId,
  open,
  onOpenChange,
  onPaymentSuccess,
}: MakePaymentDialogProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('ADVANCE');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (open && eventId) {
      loadPaymentSummary();
    }
    // Reset form when dialog closes
    if (!open) {
      setAmount('');
      setPaymentType('ADVANCE');
      setNotes('');
      setError(null);
    }
  }, [open, eventId]);

  const loadPaymentSummary = async () => {
    try {
      setIsLoadingSummary(true);
      const response = await eventsApi.getPaymentSummary(eventId);
      setSummary(response.data);
    } catch (err) {
      // Silently fail - summary is optional
      console.error('Failed to load payment summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const getRemainingBalance = (): number => {
    if (!summary) return 0;
    return parseFloat(summary.pending_balance);
  };

  const getFinalPrice = (): number => {
    if (!summary) return 0;
    return parseFloat(summary.final_price);
  };

  const handlePaymentTypeChange = (value: string) => {
    const type = value as PaymentType;
    setPaymentType(type);

    // Auto-fill amount based on payment type
    if (type === 'TOTAL') {
      setAmount(getRemainingBalance().toFixed(2));
    }
  };

  const validatePayment = (): string | null => {
    const amountValue = parseFloat(amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      return t('events.makePayment.validation.invalidAmount');
    }

    const remaining = getRemainingBalance();

    // ADVANCE and REMAINING can't exceed remaining balance
    if ((paymentType === 'ADVANCE' || paymentType === 'REMAINING') && amountValue > remaining) {
      return t('events.makePayment.validation.exceedsBalance', { balance: remaining.toFixed(2) });
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validatePayment();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await eventsApi.createPayment(eventId, {
        event_id: eventId,
        user_id: userId,
        amount: parseFloat(amount),
        payment_type: paymentType,
        notes: notes.trim() || undefined,
      });

      // Notify parent of success
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }

      onOpenChange(false);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || apiError.message || t('events.makePayment.failedToCreate'));
    } finally {
      setIsLoading(false);
    }
  };

  const remainingBalance = getRemainingBalance();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('events.makePayment.title')}</DialogTitle>
          <DialogDescription>
            {t('events.makePayment.description', { eventName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Summary */}
          {isLoadingSummary ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">{t('events.makePayment.loadingSummary')}</span>
            </div>
          ) : summary ? (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('events.makePayment.summary.finalPrice')}</span>
                <span className="font-medium">${parseFloat(summary.final_price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('events.makePayment.summary.totalPaid')}</span>
                <span className="font-medium text-green-600">
                  ${parseFloat(summary.total_paid).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-500">{t('events.makePayment.summary.remainingBalance')}</span>
                <span className={`font-medium ${
                  remainingBalance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${remainingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {t('events.makePayment.warning')}
            </div>
          )}

          {/* Payment Type */}
          <div className="space-y-2">
            <Label htmlFor="payment-type">{t('events.makePayment.form.paymentType')}</Label>
            <Select value={paymentType} onValueChange={handlePaymentTypeChange}>
              <SelectTrigger id="payment-type">
                <SelectValue placeholder={t('events.makePayment.form.paymentTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADVANCE">{t('events.makePayment.paymentTypes.ADVANCE')}</SelectItem>
                <SelectItem value="REMAINING">{t('events.makePayment.paymentTypes.REMAINING')}</SelectItem>
                <SelectItem value="TOTAL">{t('events.makePayment.paymentTypes.TOTAL')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {t(`events.makePayment.descriptions.${paymentType}`)}
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t('events.makePayment.form.amount')}</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-9"
                disabled={paymentType === 'TOTAL'}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('events.makePayment.form.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('events.makePayment.form.notesPlaceholder')}
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('events.makePayment.buttons.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || isLoadingSummary || !amount}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('events.makePayment.buttons.submitPayment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}