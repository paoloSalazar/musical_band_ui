import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { User } from '../../lib/types';
import { eventsApi } from '../../lib/api';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { musician_id: number; role: string; salary: number }) => void;
}

export function AssignMusicianDialog({ open, onOpenChange, onSubmit }: Props) {
  const [availableMusicians, setAvailableMusicians] = useState<User[]>([]);
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
      setAvailableMusicians(response.data);
    } catch (err) {
      console.error('Failed to load available musicians', err);
    }
  };

  const handleSubmit = () => {
    const salaryNum = Number(salary);
    if (!selectedMusicianId || !role.trim() || isNaN(salaryNum) || salaryNum <= 0) {
      setError('Please fill all fields with valid data');
      return;
    }
    setIsLoading(true);
    onSubmit({
      musician_id: Number(selectedMusicianId),
      role: role.trim(),
      salary: salaryNum,
    });
    setIsLoading(false);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedMusicianId('');
    setRole('');
    setSalary('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Musician to Event</DialogTitle>
          <DialogDescription>Select a musician and provide role and salary.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-2">
          <div>
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
          </div>
          <div>
            <label>Role</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
          </div>
          <div>
            <label>Salary</label>
            <Input type="number" min="0" step="0.01" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Salary" />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Assigning...' : 'Assign'}
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}