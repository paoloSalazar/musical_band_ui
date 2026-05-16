import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import type { EventMusician } from '../../lib/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: EventMusician | null;
  onConfirm: (assignmentId: number) => void;
}

export function DeleteMusicianConfirmationDialog({ open, onOpenChange, assignment, onConfirm }: Props) {
  const { t } = useTranslation();
  const handleConfirm = () => {
    if (assignment) {
      onConfirm(assignment.musician_id);
      onOpenChange(false);
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('events.musicianManagement.deleteDialog.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {t('events.musicianManagement.deleteDialog.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}