import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import type { EventMusician } from '../../lib/types';
import { translateApiError } from '../../../i18n/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: EventMusician | null;
  onConfirm: (musicianId: number) => void | Promise<void>;
}

export function DeleteMusicianConfirmationDialog({ open, onOpenChange, assignment, onConfirm }: Props) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!assignment) return;
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(assignment.musician_id);
      onOpenChange(false);
    } catch (err: any) {
      const raw = err?.detail || err?.message || 'Failed to delete musician assignment';
      setError(translateApiError(raw));
    } finally {
      setIsLoading(false);
    }
  };

  const musicianName = assignment
    ? `${assignment.musician_name} ${assignment.musician_lastname} (${assignment.role})`
    : 'this musician';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('events.musicianManagement.deleteDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('events.musicianManagement.deleteDialog.message', { name: musicianName })}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t('events.musicianManagement.deleteDialog.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
            {t('events.musicianManagement.deleteDialog.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}