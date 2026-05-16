import { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '../../lib/api';
import type { EventMusician, Event } from '../../lib/types';
import { useUser } from '../../contexts/UserContext';
import { EventMusicianTable } from './EventMusicianTable';
import { EventMusicianService } from '../../lib/services/eventMusicianService';
import { Button } from '../ui/button';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { ArrowLeft, Users } from 'lucide-react';
import { EditMusicianAssignmentDialog } from './EditMusicianAssignmentDialog';
import { AssignMusicianDialog } from './AssignMusicianDialog';
import { DeleteMusicianConfirmationDialog } from './DeleteMusicianConfirmationDialog';
import type { EventMusicianUpdateData } from '../../lib/types';
import { formatDateHumanReadable } from '../../lib/timezone';
import { useTranslation } from 'react-i18next';

export function EventMusicianManagement() {
  const { t, i18n } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useUser();

  const [event, setEvent] = useState<Event | null>(null);
  const [musicians, setMusicians] = useState<EventMusician[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notify, setNotify] = useState<string | null>(null);

  // Edit dialog state
  const [editing, setEditing] = useState<EventMusician | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Assign dialog state
  const [assignOpen, setAssignOpen] = useState(false);

  // Delete dialog state
  const [deleting, setDeleting] = useState<EventMusician | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Check if user has permission to view this page
  const canViewMusicians = hasPermission('read:event_musician');

  useEffect(() => {
    if (!canViewMusicians) {
      navigate('/');
      return;
    }

    if (eventId) {
      loadEvent();
      loadMusicians();
    }
  }, [eventId, canViewMusicians, navigate]);

  // Auto-clear notification
  useEffect(() => {
    if (!notify) return;
    const timer = setTimeout(() => setNotify(null), 2500);
    return () => clearTimeout(timer);
  }, [notify]);

  const loadEvent = async () => {
    if (!eventId) return;

    try {
      const response = await eventsApi.getById(parseInt(eventId));
      setEvent(response.data);
    } catch (err) {
      console.error('Failed to load event details', err);
    }
  };
  const loadMusicians = async () => {
    if (!eventId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await eventsApi.getEventMusicians(parseInt(eventId));
      setMusicians(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load musicians');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/events');
  };

  const handleEdit = (assignmentId: number) => {
    const m = musicians.find((mm) => mm.id === assignmentId) || null;
    setEditing(m);
    setEditOpen(true);
  };

  const handleEditSubmit = async (updated: Partial<EventMusicianUpdateData>) => {
    if (!editing || !eventId) return;
    try {
      await eventsApi.updateMusicianAssignment(parseInt(eventId), editing.musician_id, updated as EventMusicianUpdateData);
      setMusicians((list) =>
        list.map((m) => (m.id === editing.id ? { ...m, ...updated } as EventMusician : m))
      );
      await loadMusicians();
      setNotify('Musician updated');
    } catch (err: any) {
      if (err?.status === 403) {
        setNotify('Unauthorized: admin role required');
      } else {
        console.error('Failed to update musician assignment', err);
      }
    } finally {
      setEditOpen(false);
    }
  };
  const handleAssign = () => {
    setAssignOpen(true);
  };

  const handleAssignSubmit = async (data: { event_id: number; musician_id: number; role: string; salary: number }) => {
    try {
      await eventsApi.assignMusician(data.event_id, data);
      await loadMusicians();
      setNotify('Musician assigned');
    } catch (err: any) {
      if (err?.status === 403) {
        setNotify('Unauthorized: admin role required');
      } else {
        console.error('Failed to assign musician', err);
      }
      throw err;
    }
  };

  const handleDelete = (musicianId: number) => {
    const m = musicians.find((mm) => mm.musician_id === musicianId) || null;
    setDeleting(m);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (musicianId: number) => {
    if (!eventId) return;
    try {
      await eventsApi.removeMusician(parseInt(eventId), musicianId);
      // refresh list after delete
      await loadMusicians();
      setNotify('Musician removed');
    } catch (err: any) {
      if (err?.status === 403) {
        setNotify('Unauthorized: admin role required');
      } else {
        console.error('Failed to delete musician', err);
      }
    }
    setDeleteOpen(false);
  };

  if (!canViewMusicians) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('common.back')}</span>
            </Button>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-green-600" />
              <div>
            <h1 className="text-xl font-semibold">
              {event
                ? t('events.musicianManagement.titleWithName', { name: event.name })
                : t('events.musicianManagement.title', { eventId })}
            </h1>
                <p className="text-sm text-gray-600">
                  {event ? formatDateHumanReadable(event.start_datetime, i18n.language) : t('events.musicianManagement.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <ErrorBoundary>
      <div className="container mx-auto px-4 py-6">
        {notify && (
          <div className="mb-4 rounded bg-green-50 px-4 py-2 text-sm text-green-700">
            {notify}
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span>{t('common.loading')}</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">
            <span>{t('common.error')}:</span> {error}
          </div>
        ) : (
          <div className="space-y-6">
            <EventMusicianTable musicians={musicians} onEdit={handleEdit} onDelete={handleDelete} onAssign={handleAssign} />
          </div>
        )}
      </div>
      </ErrorBoundary>

      {editing && (
        <EditMusicianAssignmentDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          assignment={editing}
          onSubmit={handleEditSubmit}
        />
      )}

      <AssignMusicianDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        eventId={parseInt(eventId!)}
        onSubmit={handleAssignSubmit}
      />

      {deleting && (
        <DeleteMusicianConfirmationDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          assignment={deleting}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
