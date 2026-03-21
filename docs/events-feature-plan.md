# Events Feature Implementation Plan

## Overview
Implement an events management page with two views:
1. **Table View** - Events sorted by date with check_details and edit options
2. **Calendar View** - Google Calendar-like month view with clickable events

## API Endpoint
- Base URL: `{{api}}/events/`
- Method: GET
- Auth: Bearer token

## Event Structure
```json
{
  "name": "Cumpleaños de Maria",
  "place": "Calle Calama y San Martin, Cochabamba",
  "description": "Celebración del cumpleaños",
  "start_datetime": "2026-03-23T19:00:00Z",
  "end_datetime": "2026-03-23T23:00:00Z",
  "is_all_day": false,
  "user_id": 3,
  "id": 5,
  "status": "PENDING",
  "created_by": {
    "user_id": 3,
    "name": "maria",
    "lastname": "garcia",
    "email": "maria.garcia@example.com",
    "phone_number": "+59175467543"
  }
}
```

## Permissions
- `read:events` - View events
- `write:events` - Create/Update events (includes create:events, update:events)
- Admin only: Delete events

## Implementation Steps

### 1. Types (src/app/lib/types.ts)
- [x] Event interface
- [x] EventFormData interface  
- [x] EventCreator interface

### 2. API Service (src/app/lib/api/events.ts)
- [ ] eventsApi.list() - GET /api/events/
- [ ] eventsApi.getById(id) - GET /api/events/{id}
- [ ] eventsApi.create(data) - POST /api/events/
- [ ] eventsApi.update(id, data) - PATCH /api/events/{id}
- [ ] eventsApi.delete(id) - DELETE /api/events/{id}

### 3. Components

#### Dialogs
- [ ] ViewEventDialog.tsx - Shows event details (check_details)
- [ ] EditEventDialog.tsx - Edit event form
- [ ] DeleteEventDialog.tsx - Delete confirmation (admin only)

#### Views
- [ ] EventsListPage.tsx - Table view with sorted events
- [ ] CalendarView.tsx - Month calendar view

#### Main Page
- [ ] EventsPage.tsx - Container with view toggle

### 4. Routing
- [ ] Add /events route in App.tsx
- [ ] Update HomePage.tsx to link to /events

## File Structure
```
src/app/
├── lib/
│   ├── api/
│   │   ├── events.ts       # NEW - Events API service
│   │   └── index.ts        # MODIFIED - Export events API
│   └── types.ts            # MODIFIED - Add Event types
└── components/
    └── events/
        ├── EventsPage.tsx          # Main container
        ├── EventsListPage.tsx       # Table view
        ├── CalendarView.tsx         # Calendar view
        ├── ViewEventDialog.tsx      # Details popup
        ├── EditEventDialog.tsx      # Edit form
        └── DeleteEventDialog.tsx    # Delete confirmation
```

## UI Requirements

### Table View
- Columns: Name, Place, Start Date, End Date, Status, Actions
- Sorted by start_datetime ascending
- Actions: View (eye icon), Edit (pencil icon), Delete (trash - admin only)

### Calendar View
- Month grid layout (7 columns x 5-6 rows)
- Events displayed on their respective dates
- Click event → popup with details + edit button
- Navigation: Previous/Next month

### Event Details Popup
- Show all event fields
- Created by information
- Edit button (if has write:events permission)
- Delete button (admin only)
- Close button
