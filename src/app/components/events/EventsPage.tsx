import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Calendar, List } from 'lucide-react';
import { EventsListPage } from './EventsListPage';
import { CalendarView } from './CalendarView';

type ViewMode = 'list' | 'calendar';

export function EventsPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-gray-600 mt-1">
            Manage your band events and schedule
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewMode)}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <EventsListPage key={`list-${refreshKey}`} onEventUpdated={handleEventUpdated} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView key={`calendar-${refreshKey}`} onEventUpdated={handleEventUpdated} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
