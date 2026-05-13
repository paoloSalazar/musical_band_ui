# Event Musician UI Implementation Plan

Based on section 2 of the musician_events_api_documentation.md, this plan outlines the frontend implementation for managing event musician assignments in the React UI project. Focuses on interfaces, utilities, and UI components for displaying and managing musicians per event.

## Overview
Implement UI features to view, assign, update, and remove musicians from events, with role-based access (admins can manage, musicians can view).

## Interfaces and Types
Location: `src/types/eventMusicians.ts`

```typescript
export interface EventMusician {
  id: number;
  event_id: number;
  musician_id: number;
  role: string;
  salary: number;
  payment_status: 'PENDING' | 'PARTIAL' | 'COMPLETED';
  musician_name: string;
  musician_lastname: string;
  created_at: string;
  updated_at: string;
}

export interface MusicianSummary {
  event_id: number;
  total_musicians: number;
  total_cost: number;
  musicians: Array<{
    musician_id: number;
    musician_name: string;
    musician_lastname: string;
    role: string;
    salary: number;
    payment_status: 'PENDING' | 'PARTIAL' | 'COMPLETED';
  }>;
}

export interface AssignMusicianForm {
  musician_id: number;
  role: string;
  salary: number;
}

export interface UpdateMusicianForm {
  role?: string;
  salary?: number;
}
```

## Utilities
Location: `src/utils/eventMusicians.ts`

- `formatCurrency(amount: number): string` - Format salary amounts
- `getPaymentStatusColor(status: string): string` - Return CSS class for status badges
- `calculateTotalPaid(musicians: EventMusician[]): number` - Sum salaries
- `filterMusiciansByRole(musicians: EventMusician[], role: string): EventMusician[]` - Filter helpers
- `sortMusiciansByName(musicians: EventMusician[]): EventMusician[]` - Sorting utilities

## API Service
Location: `src/services/eventMusiciansApi.ts`

Implement apiClient-based functions for all endpoints (2.1-2.6), including error handling and auth headers.

## Components

### EventMusiciansList Component
Location: `src/components/event-musicians/EventMusiciansList.tsx`

- Displays list of musicians assigned to an event
- Props: `eventId: number`, `isAdmin: boolean`
- Features: Sortable table with name, role, salary, payment status
- Admin actions: Edit, remove buttons
- Uses: `getMusiciansForEvent`

### AssignMusicianDialog Component
Location: `src/components/event-musicians/AssignMusicianDialog.tsx`

- Modal dialog for assigning musicians
- Props: `eventId: number`, `onAssigned: (musician: EventMusician) => void`
- Form fields: Musician dropdown, role input, salary input
- Validation: Availability check, salary positive
- Uses: `assignMusicianToEvent`

### EditMusicianDialog Component
Location: `src/components/event-musicians/EditMusicianDialog.tsx`

- Modal for updating role/salary
- Props: `eventId: number`, `musician: EventMusician`, `onUpdated: (updated: EventMusician) => void`
- Uses: `updateMusicianAssignment`

### MusicianSummaryCard Component
Location: `src/components/event-musicians/MusicianSummaryCard.tsx`

- Card displaying total musicians and cost
- Props: `eventId: number`
- Uses: `getMusiciansSummaryForEvent`

### MusicianAssignmentsPage Component
Location: `src/components/event-musicians/MusicianAssignmentsPage.tsx`

- Page for musicians to view their assignments
- Props: `musicianId: number`
- Uses: `getMusicianAssignments`

### EventMusiciansList Component (Page)
Location: `src/app/components/event-musicians/EventMusiciansList.tsx`

- Dedicated page for managing musicians assigned to a specific event
- Route: `/events/:eventId/musicians`
- Accessed from EventsListPage via admin actions column
- Features: List view, assign/remove actions, summary card
- Admin-only access for management features

## Hooks and State Management

### useEventMusicians Hook
Location: `src/hooks/useEventMusicians.ts`

- Manages state for musicians list, loading, errors
- Functions: `fetchMusicians`, `assignMusician`, `updateMusician`, `removeMusician`
- Integrates with API service

## Testing
- Unit tests for utilities and hooks
- Component tests for each UI component
- Integration tests for API interactions

## Integration Notes
- Use existing auth context for role checks
- Add i18n keys for labels and messages
- Ensure responsive design matching existing components
- Handle loading states and error toasts
- Follow project's component patterns (similar to MusicianAvailability components)

## Implementation Phases

### Phase 1: Foundation (Types & API)
1. Create TypeScript interfaces in `src/types/eventMusicians.ts`
2. Implement API service functions in `src/app/lib/api/eventMusicians.ts` (following existing apiClient pattern)
3. Create utility functions in `src/app/lib/utils/eventMusicians.ts`

### Phase 2: Core Components
1. Build `EventMusiciansList` component for displaying assigned musicians
2. Create `AssignMusicianDialog` component with form validation
3. Implement `EditMusicianDialog` component for updating assignments
4. Add `MusicianSummaryCard` component for cost overview
5. Develop `useEventMusicians` hook for state management

### Phase 3: Pages & Integration
1. Create `MusicianAssignmentsPage` for individual musician views
2. Build `EventMusiciansList` page (accessed from EventsListPage admin actions)
3. Update EventsListPage to include "Manage Musicians" action button for admins
4. Add routing configuration in `src/app/routes.tsx` for `/events/:eventId/musicians`
5. Integrate with existing auth system for role checks
6. Add i18n translations in `src/i18n/locales/`

### Phase 4: Testing & Polish
1. Write unit tests for utilities and hooks
2. Add component tests for each UI component
3. Implement integration tests for API interactions
4. Add error handling and loading states
5. Ensure responsive design and accessibility