import { useState, useEffect } from 'react';
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
    if (type === 'FULL') {
      setAmount(getRemainingBalance().toFixed(2));
    }
  };

  const validatePayment = (): string | null => {
    const amountValue = parseFloat(amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      return 'Please enter a valid amount greater than 0';
    }

    const remaining = getRemainingBalance();

    // ADVANCE and REMAINING can't exceed remaining balance
    if ((paymentType === 'ADVANCE' || paymentType === 'REMAINING') && amountValue > remaining) {
      return `Amount cannot exceed the remaining balance of $${remaining.toFixed(2)}`;
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
      setError(apiError.detail || apiError.message || 'Failed to create payment');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingBalance = getRemainingBalance();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>
            {eventName} - Record a payment for this event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Summary */}
          {isLoadingSummary ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading summary...</span>
            </div>
          ) : summary ? (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Final Price:</span>
                <span className="font-medium">${parseFloat(summary.final_price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Paid:</span>
                <span className="font-medium text-green-600">
                  ${parseFloat(summary.total_paid).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-500">Remaining Balance:</span>
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
              Payment summary not available. Please ensure the event price has been set.
            </div>
          )}

          {/* Payment Type */}
          <div className="space-y-2">
            <Label htmlFor="payment-type">Payment Type</Label>
            <Select value={paymentType} onValueChange={handlePaymentTypeChange}>
              <SelectTrigger id="payment-type">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADVANCE">Advance Payment</SelectItem>
                <SelectItem value="REMAINING">Remaining Balance</SelectItem>
                <SelectItem value="FULL">Full Payment</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {paymentType === 'FULL' 
                ? 'Pays the entire remaining balance'
                : paymentType === 'REMAINING'
                ? 'Pays the full remaining balance'
                : 'A partial payment towards the total'
              }
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
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
                disabled={paymentType === 'FULL'}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this payment..."
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
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || isLoadingSummary || !amount}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}