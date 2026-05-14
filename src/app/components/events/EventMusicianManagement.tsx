import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '../../lib/api';
import type { EventMusician } from '../lib/types';
import type { ApiError } from '../lib/api/client';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

export function EventMusicianManagement() {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useUser();

  const [musicians, setMusicians] = useState<EventMusician[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has permission to view this page
  const canViewMusicians = hasPermission('read:event_musician');

  useEffect(() => {
    if (!canViewMusicians) {
      navigate('/');
      return;
    }

    if (eventId) {
      loadMusicians();
    }
  }, [eventId, canViewMusicians, navigate]);

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

  if (!canViewMusicians) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t('common.back')}</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {t('events.musicianManagement.title', { eventId })}
                </h1>
                <p className="text-sm text-gray-600">
                  {t('events.musicianManagement.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-600">{t('common.loading')}</div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">
            <p className="font-medium">{t('common.error')}</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Placeholder for table - will be implemented in Phase 4 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">
                {t('events.musicianManagement.assignedMusicians')}
              </h2>
              <p className="text-gray-600">
                {t('events.musicianManagement.tableComingSoon')}
              </p>
              {musicians.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Loaded {musicians.length} musicians
                  </p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(musicians, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}