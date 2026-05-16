import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { User } from '../../lib/types';
import { eventsApi } from '../../lib/api';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  onSubmit: (data: { event_id: number; musician_id: number; role: string; salary: number }) => void;
}

export function AssignMusicianDialog({ open, onOpenChange, eventId, onSubmit }: Props) {
  const { t } = useTranslation();
  const [availableMusicians, setAvailableMusicians] = useState<User[]>([]);
  const [musicianSearch, setMusicianSearch] = useState('');
  const [selectedMusicianId, setSelectedMusicianId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [salary, setSalary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadAvailableMusicians();
    }
  }, [open]);

  const loadAvailableMusicians = async () => {
    try {
      const response = await eventsApi.getAvailableMusicians();
      const d = response?.data;
      const list: User[] = Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];
      setAvailableMusicians(list);
    } catch (err) {
      console.error('Failed to load available musicians', err);
    }
  };

  const handleSubmit = async () => {
    const salaryNum = Number(salary);
    if (!selectedMusicianId || !role.trim() || isNaN(salaryNum) || salaryNum <= 0) {
      setError(t('events.musicianManagement.assignDialog.validationError'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit({
        event_id: eventId,
        musician_id: Number(selectedMusicianId),
        role: role.trim(),
        salary: salaryNum,
      });
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      const msg = err?.message || t('events.musicianManagement.assignDialog.error');
      if (msg.includes('already assigned')) {
        setError(t('events.musicianManagement.assignDialog.alreadyAssigned'));
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMusicianId('');
    setMusicianSearch('');
    setRole('');
    setSalary('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('events.musicianManagement.assignDialog.title')}</DialogTitle>
          <DialogDescription>{t('events.musicianManagement.assignDialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-2">
          {/* <div>
            <label>Musician</label>
            <Select value={selectedMusicianId} onValueChange={setSelectedMusicianId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a musician" />
              </SelectTrigger>
              <SelectContent>
                {availableMusicians.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.name} {m.lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <div>
            <label>{t('events.musicianManagement.assignDialog.musician')}</label>
            <Input
              placeholder={t('events.musicianManagement.assignDialog.musicianPlaceholder')}
              value={musicianSearch}
              onChange={(e) => setMusicianSearch(e.target.value)}
            />
            <div className="mt-1 max-h-40 overflow-auto border rounded">
              {availableMusicians
                .filter((m) =>
                  `${m.name} ${m.lastname}`.toLowerCase().includes(musicianSearch.toLowerCase())
                )
                .map((m) => (
                  <div
                    key={m.id}
                    className={`px-3 py-1.5 cursor-pointer hover:bg-accent ${selectedMusicianId === m.id.toString() ? 'bg-accent' : ''}`}
                    onClick={() => {
                      setSelectedMusicianId(m.id.toString());
                      setMusicianSearch(`${m.name} ${m.lastname}`);
                    }}
                  >
                    {m.name} {m.lastname}
                  </div>
                ))}
            </div>
          </div>
          <div>
            <label>{t('events.musicianManagement.assignDialog.role')}</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder={t('events.musicianManagement.assignDialog.rolePlaceholder')} />
          </div>
          <div>
            <label>{t('events.musicianManagement.assignDialog.salary')}</label>
            <Input type="number" min="0" step="0.01" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder={t('events.musicianManagement.assignDialog.salary')} />
          </div>
          {/* <div>
            <label>Salary</label>
            <Input type="number" min="0" step="0.01" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Salary" />
          </div> */}
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? t('events.musicianManagement.assignDialog.assigning') : t('events.musicianManagement.assignDialog.assign')}
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t('events.musicianManagement.assignDialog.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}