/**
 * ReceiptDownloadButton Component
 * Downloads the receipt PDF for an event
 */
import { useState } from 'react';
import { Button } from '../ui/button';
import { FileText } from 'lucide-react';
import { eventsApi } from '../../lib/api';

type ReceiptDownloadButtonProps = {
  eventId: number;
  ariaLabel?: string;
};

export function ReceiptDownloadButton({ eventId, ariaLabel = 'Download receipt PDF' }: ReceiptDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const pdfBlob = await eventsApi.downloadReceiptPdf(eventId);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-event-${eventId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download receipt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isLoading}
      aria-label={ariaLabel}
    >
      <FileText className="h-4 w-4" />
    </Button>
  );
}