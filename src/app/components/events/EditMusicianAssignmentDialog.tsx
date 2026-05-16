import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import type { EventMusician, EventMusicianUpdateData } from '../../lib/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: EventMusician | null;
  onSubmit: (updates: Partial<EventMusicianUpdateData>) => void;
}

export function EditMusicianAssignmentDialog({ open, onOpenChange, assignment, onSubmit }: Props) {
  const { t } = useTranslation();
  const [role, setRole] = useState<string>(assignment?.role ?? '');
  const [salary, setSalary] = useState<string>(assignment?.salary?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);

  const musicianFullName = assignment
    ? `${assignment.musician_name} ${assignment.musician_lastname}`
    : t('events.musicianManagement.editDialog.fallbackName');

  useEffect(() => {
    if (assignment) {
      setRole(assignment.role ?? '');
      setSalary(assignment.salary !== undefined ? String(assignment.salary) : '');
      setError(null);
    }
  }, [assignment, open]);

  const onSave = () => {
    const salaryNum = salary.trim() === '' ? NaN : Number(salary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      setError(t('events.musicianManagement.editDialog.salaryError'));
      return;
    }
    onSubmit({ role: role.trim(), salary: salaryNum });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('events.musicianManagement.editDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('events.musicianManagement.editDialog.description', { name: musicianFullName })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-2">
          <div>
            <label>{t('events.musicianManagement.editDialog.role')}</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder={t('events.musicianManagement.editDialog.rolePlaceholder')} />
          </div>
          <div>
            <label>{t('events.musicianManagement.editDialog.salary')}</label>
            <Input type="number" min="0" step="0.01" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder={t('events.musicianManagement.editDialog.salaryPlaceholder')} />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={onSave}>{t('events.musicianManagement.editDialog.save')}</Button>
          <Button onClick={() => onOpenChange(false)} variant="outline">{t('events.musicianManagement.editDialog.cancel')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
