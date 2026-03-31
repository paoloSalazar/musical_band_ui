import { useState, useEffect } from 'react';
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
      setError(apiError.detail || apiError.message || 'Failed to load payment details');
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
    return num.toFixed(2);
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'ADVANCE':
        return 'Advance';
      case 'REMAINING':
        return 'Remaining';
      case 'FULL':
        return 'Full Payment';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            {eventName} - Payment history and summary
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading payment details...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Summary */}
            {summary && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment Summary
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Final Price</p>
                    <p className="font-medium">${formatAmount(summary.final_price)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Paid</p>
                    <p className="font-medium text-green-600">
                      ${formatAmount(summary.total_paid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Remaining</p>
                    <p className={`font-medium ${
                      parseFloat(summary.remaining_balance) > 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      ${formatAmount(summary.remaining_balance)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment History */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment History
              </h4>
              {payments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No payments have been made yet.
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
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}