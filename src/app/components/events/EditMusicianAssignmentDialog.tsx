import { useEffect, useState } from 'react';
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
  const [role, setRole] = useState<string>(assignment?.role ?? '');
  const [salary, setSalary] = useState<string>(assignment?.salary?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);

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
      setError('Salary must be a positive number');
      return;
    }
    onSubmit({ role: role.trim(), salary: salaryNum });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Musician Assignment</DialogTitle>
          <DialogDescription>Update role and salary for this musician in the event.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-2">
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
          <Button onClick={onSave}>Save</Button>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
