import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Loader2 } from 'lucide-react';

interface BillingSummaryData {
  event_name: string;
  event_price: string;
  payment_done: string;
  remaining_payment: string;
  sum_of_musician_salaries: string;
  payment_done_to_musicians: string;
}

interface BillingSummaryPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: BillingSummaryData | null;
  loading: boolean;
  error: string | null;
}

export function BillingSummaryPopup({
  open,
  onOpenChange,
  data,
  loading,
  error,
}: BillingSummaryPopupProps) {
  const { t } = useTranslation();

  const eventPrice = parseFloat(data?.event_price || '0');
  const paymentDone = parseFloat(data?.payment_done || '0');
  const remainingPayment = parseFloat(data?.remaining_payment || '0');
  const sumOfMusicianSalaries = parseFloat(data?.sum_of_musician_salaries || '0');
  const paymentDoneToMusicians = parseFloat(data?.payment_done_to_musicians || '0');

  const getPaymentDoneColor = () => {
    if (paymentDone < eventPrice) return 'text-amber-600';
    if (paymentDone === eventPrice) return 'text-green-600';
    return 'text-red-600';
  };

  const getRemainingPaymentColor = () => {
    if (paymentDone < eventPrice) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPaymentDoneToMusiciansColor = () => {
    if (sumOfMusicianSalaries > paymentDoneToMusicians) return 'text-amber-600';
    if (sumOfMusicianSalaries === paymentDoneToMusicians) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('events.dialog.view.billingSummaryTitle')}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <p className="text-red-600 text-center py-4">{error}</p>
        ) : data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('events.dialog.view.eventName')}</p>
                <p className="text-xl font-semibold">{data.event_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('events.dialog.view.eventPrice')}</p>
                <p className="text-xl font-semibold">{eventPrice.toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('events.dialog.view.paymentDone')}</p>
                <p className={`text-xl font-semibold ${getPaymentDoneColor()}`}>
                  {paymentDone.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('events.dialog.view.remainingPayment')}</p>
                <p className={`text-xl font-semibold ${getRemainingPaymentColor()}`}>
                  {remainingPayment.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('events.dialog.view.sumOfMusicianSalaries')}</p>
                <p className="text-xl font-semibold">{sumOfMusicianSalaries.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('events.dialog.view.paymentDoneToMusicians')}</p>
                <p className={`text-xl font-semibold ${getPaymentDoneToMusiciansColor()}`}>
                  {paymentDoneToMusicians.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-4">{t('events.dialog.view.noData')}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}