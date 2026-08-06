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

interface MusicianPaymentRow {
  musician_name: string;
  role: string;
  salary: string;
  payment_done: string;
  remaining_payment: string;
}

interface MusicianPaymentSummaryPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MusicianPaymentRow[];
  loading: boolean;
  error: string | null;
}

export function MusicianPaymentSummaryPopup({
  open,
  onOpenChange,
  data,
  loading,
  error,
}: MusicianPaymentSummaryPopupProps) {
  const { t } = useTranslation();

  const getPaymentDoneColor = (salary: string, paymentDone: string) => {
    const salaryNum = parseFloat(salary);
    const paidNum = parseFloat(paymentDone);
    if (paidNum < salaryNum) return 'bg-amber-100 text-amber-800';
    if (paidNum === salaryNum) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getRemainingPaymentColor = (salary: string, paymentDone: string) => {
    const salaryNum = parseFloat(salary);
    const paidNum = parseFloat(paymentDone);
    if (paidNum < salaryNum) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('events.dialog.view.musicianPaymentSummaryTitle')}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <p className="text-red-600 text-center py-4">{error}</p>
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('events.musicianManagement.table.musician')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('events.musicianManagement.table.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('events.musicianManagement.table.salary')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('events.dialog.view.paymentDone')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('events.dialog.view.remainingPayment')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((musician, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {musician.musician_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {musician.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(musician.salary).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`
                          px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentDoneColor(
                            musician.salary,
                            musician.payment_done
                          )}`
                        }
                      >
                        {parseFloat(musician.payment_done).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`
                          px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRemainingPaymentColor(
                            musician.salary,
                            musician.payment_done
                          )}`
                        }
                      >
                        {parseFloat(musician.remaining_payment).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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