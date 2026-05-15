import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Pencil, Trash2 } from 'lucide-react';


import type { EventMusician } from '../../lib/types';
import { useUser } from '../../contexts/UserContext';
import type { Icon } from 'lucide-react';

type Props = {
  musicians: EventMusician[];
  onEdit?: (assignmentId: number) => void;
  onDelete?: (assignmentId: number) => void;
  onAssign?: () => void;
};

export const EventMusicianTable: React.FC<Props> = ({ musicians, onEdit, onDelete, onAssign }) => {
  const { hasRole } = useUser();
  const isAdmin = hasRole('admin');

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Assigned Musicians</h3>
          {isAdmin && onAssign && (
            <Button onClick={onAssign}>Assign Musician</Button>
          )}
        </div>
      </div>
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Musician</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {musicians.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{`${m.musician_name} ${m.musician_lastname}`}</TableCell>
              <TableCell>{m.role}</TableCell>
              <TableCell>{Number(m.salary).toFixed(2)}</TableCell>
              <TableCell>{m.payment_status}</TableCell>
              <TableCell className="text-right">
                {onEdit && (
                  <Button size="sm" aria-label={`edit-${m.id}`} onClick={() => onEdit(m.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button size="sm" variant="outline" aria-label={`delete-${m.id}`} onClick={() => onDelete(m.id)} className="ml-2">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
