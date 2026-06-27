/**
 * ContractDownloadButton Component
 * Downloads the contract PDF for an event
 */
import { useState } from 'react';
import { Button } from '../ui/button';
import { FileSignature } from 'lucide-react';
import { eventsApi } from '../../lib/api';

type ContractDownloadButtonProps = {
  eventId: number;
  ariaLabel?: string;
};

export function ContractDownloadButton({ eventId, ariaLabel = 'Download contract PDF' }: ContractDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const pdfBlob = await eventsApi.downloadContractPdf(eventId);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-event-${eventId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download contract:', error);
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
      <FileSignature className="h-4 w-4" />
    </Button>
  );
}