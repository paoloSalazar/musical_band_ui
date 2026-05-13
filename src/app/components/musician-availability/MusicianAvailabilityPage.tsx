import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { musicianAvailabilityApi } from '../../lib/api';
import { formatDateHumanReadable } from '../../lib/timezone';

/**
 * Format a date string as a local date without timezone conversion
 * Used for displaying dates that should be shown as-is regardless of timezone
 */
const formatLocalDate = (dateString: string, locale: string = 'en'): string => {
  if (!dateString) return '';

  try {
    // Create date object from the string (treat as local date)
    const date = new Date(dateString + 'T00:00:00'); // Add time to ensure consistent parsing

    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.warn('Error formatting local date:', error);
    return dateString;
  }
};
import type { MusicianAvailability, MusicianAvailabilityByMonthResponse } from '../../lib/api/musicianAvailability';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { AddAvailabilityDialog } from './AddAvailabilityDialog';
import { EditAvailabilityDialog } from './EditAvailabilityDialog';
import { BulkAvailabilityDialog } from './BulkAvailabilityDialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';

interface MusicianAvailabilityPageProps {
  musicianId: number;
}

export function MusicianAvailabilityPage({ musicianId }: MusicianAvailabilityPageProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n?.language || 'en';
  const [availability, setAvailability] = useState<MusicianAvailability[]>([]);
  const [currentMonthAvailability, setCurrentMonthAvailability] = useState<MusicianAvailability[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<MusicianAvailability | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadAvailability();
    loadCurrentMonthAvailability();
  }, [musicianId]);

  useEffect(() => {
    loadCurrentMonthAvailability();
  }, [currentMonth, availability]); // Reload when month changes or full availability updates

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await musicianAvailabilityApi.getByMusician(musicianId);
      if (response.success) {
        setAvailability(response.data);
      } else {
        setError(t('musicianAvailability.messages.error'));
      }
    } catch (err) {
      setError(t('musicianAvailability.messages.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentMonthAvailability = async () => {
    try {
      setIsLoadingMonth(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1; // JS months are 0-based, API expects 1-based
      const response = await musicianAvailabilityApi.getByMusicianAndMonth(musicianId, year, month);
      if (response.success) {
        setCurrentMonthAvailability(response.data.unavailable_dates);
      } else {
        // If month API fails, fall back to filtering from full availability
        const filtered = availability.filter(item => {
          const itemDate = new Date(item.unavailable_date);
          return itemDate.getFullYear() === year && itemDate.getMonth() === month - 1;
        });
        setCurrentMonthAvailability(filtered);
      }
    } catch (err) {
      // Fall back to client-side filtering
      const year = currentMonth.getFullYear();
      const monthIndex = currentMonth.getMonth();
      const filtered = availability.filter(item => {
        const itemDate = new Date(item.unavailable_date);
        return itemDate.getFullYear() === year && itemDate.getMonth() === monthIndex;
      });
      setCurrentMonthAvailability(filtered);
    } finally {
      setIsLoadingMonth(false);
    }
  };

  const handleDateClick = (date: Date) => {
    // Open add dialog with pre-selected date
    setAddDialogOpen(true);
  };

  const handleEdit = (item: MusicianAvailability) => {
    setEditingAvailability(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      await musicianAvailabilityApi.delete(deletingId);
      loadAvailability(); // Refresh data
    } catch (err) {
      setError(t('musicianAvailability.messages.error'));
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  const handleSuccess = () => {
    loadAvailability(); // Refresh full data for calendar
    loadCurrentMonthAvailability(); // Refresh current month data for list
  };



  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('musicianAvailability.title')}</h1>
        <p className="text-gray-600 mt-2">{t('musicianAvailability.subtitle')}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                {t('musicianAvailability.calendarViewTitle')}
              </CardTitle>
              <CardDescription>
                {t('musicianAvailability.calendarViewSubTitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                  </div>
                </div>
              ) : (
                <AvailabilityCalendar
                  availability={availability}
                  onDateClick={handleDateClick}
                  onDateSelect={() => {}} // Not used in single view
                  mode="single"
                  onMonthChange={handleMonthChange}
                  initialMonth={currentMonth}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions and List Section */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('musicianAvailability.quickActions')}</CardTitle>
              <CardDescription>{t('musicianAvailability.addUnavailableDates')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="w-full"
                variant="default"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('musicianAvailability.form.addSingle')}
              </Button>
              <Button
                onClick={() => setBulkDialogOpen(true)}
                className="w-full"
                variant="outline"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {t('musicianAvailability.form.addBulk')}
              </Button>
            </CardContent>
          </Card>

          {/* Availability List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('musicianAvailability.yourUnavailableDates')}</CardTitle>
              <CardDescription>
                {t('musicianAvailability.summary.count', { count: currentMonthAvailability.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentMonthAvailability.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('musicianAvailability.empty.title')}
                  </h3>
                  <p className="text-gray-500">
                    {t('musicianAvailability.empty.description')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentMonthAvailability.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{formatLocalDate(item.unavailable_date, currentLanguage)}</p>
                        {item.reason && (
                          <p className="text-xs text-gray-600 truncate">{item.reason}</p>
                        )}
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          onClick={() => handleEdit(item)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(item.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AddAvailabilityDialog
        musicianId={musicianId}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleSuccess}
      />

      <BulkAvailabilityDialog
        musicianId={musicianId}
        existingAvailability={availability.map(item => ({
          unavailable_date: item.unavailable_date
        }))}
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onSuccess={handleSuccess}
      />

      <EditAvailabilityDialog
        availability={editingAvailability}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {t('musicianAvailability.actions.confirmDelete')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}