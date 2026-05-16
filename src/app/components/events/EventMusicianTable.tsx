import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

import type { EventMusician } from '../../lib/types';
import { useUser } from '../../contexts/UserContext';

type Props = {
  musicians: EventMusician[];
  onEdit?: (assignmentId: number) => void;
  onDelete?: (musicianId: number) => void;
  onAssign?: () => void;
};

export const EventMusicianTable: React.FC<Props> = ({ musicians, onEdit, onDelete, onAssign }) => {
  const { t } = useTranslation();
  const { hasRole } = useUser();
  const isAdmin = hasRole('admin');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('events.musicianManagement.assignedMusicians')}</CardTitle>
          {isAdmin && onAssign && (
            <Button onClick={onAssign} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {t('events.musicianManagement.assignMusician')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('events.musicianManagement.table.musician')}</TableHead>
              <TableHead>{t('events.musicianManagement.table.role')}</TableHead>
              <TableHead>{t('events.musicianManagement.table.salary')}</TableHead>
              <TableHead>{t('events.musicianManagement.table.paymentStatus')}</TableHead>
              <TableHead className="text-right">{t('events.musicianManagement.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {musicians.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{`${m.musician_name} ${m.musician_lastname}`}</TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell>{Number(m.salary).toFixed(2)}</TableCell>
                
                <TableCell>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            m.payment_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            m.payment_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                             {t(`events.musicianManagement.paymentStatus.${m.payment_status}`)}
                          </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {onEdit && (
                    <Button size="sm" variant="ghost" aria-label={`edit-${m.id}`} onClick={() => onEdit(m.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button size="sm" variant="ghost" aria-label={`delete-${m.musician_id}`} onClick={() => onDelete(m.musician_id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
