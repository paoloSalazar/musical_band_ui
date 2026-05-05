import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, List } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { EventsListPage } from './EventsListPage';
import { CalendarView } from './CalendarView';

type ViewMode = 'list' | 'calendar';

export function EventsPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Similar to AdminLayout */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-green-600" />
              <h1 className="text-xl font-semibold">{t('events.page.title')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {t('events.page.loggedInAs', { name: user?.name })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Page Description */}
          <div>
            <p className="text-gray-600">
              {t('events.page.description')}
            </p>
          </div>

          {/* View Toggle Card */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <Tabs 
              value={currentView} 
              onValueChange={(value) => setCurrentView(value as ViewMode)}
              className="w-full"
            >
               <TabsList className="w-full sm:w-auto">
                 <TabsTrigger value="list" className="flex-1 sm:flex-none items-center gap-2">
                   <List className="h-4 w-4" />
                   {t('events.page.views.list')}
                 </TabsTrigger>
                 <TabsTrigger value="calendar" className="flex-1 sm:flex-none items-center gap-2">
                   <Calendar className="h-4 w-4" />
                   {t('events.page.views.calendar')}
                 </TabsTrigger>
               </TabsList>
            </Tabs>
          </div>

          {/* Content Area */}
          {currentView === 'list' ? (
            <EventsListPage key={`list-${refreshKey}`} onEventUpdated={handleEventUpdated} />
          ) : (
            <CalendarView key={`calendar-${refreshKey}`} onEventUpdated={handleEventUpdated} />
          )}
        </div>
      </div>
    </div>
  );
}
