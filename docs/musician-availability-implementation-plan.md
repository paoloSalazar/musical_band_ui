# Musician Availability Management Implementation Plan

## Overview

This plan outlines the implementation of musician availability management functionality, allowing musicians and auxiliar musicians to set and manage their unavailable dates. This feature integrates with the existing event scheduling system to prevent double-bookings and conflicts.

## Current System Context

- **Existing Roles**: `admin`, `musician`, `auxiliar_musician`
- **Existing Permissions**: `read:musician_availability`, `write:musician_availability`, `delete:musician_availability`
- **Access Control**: All musician-related roles have full permissions for availability management
- **API Base**: All endpoints require JWT authentication

## Functional Requirements

### Core Features
1. **Availability Calendar View** - Display current availability status with visual indicators
2. **Add Unavailable Dates** - Single date selection with reason input
3. **Bulk Date Management** - Select multiple dates for vacation/holiday periods
4. **Edit Availability** - Modify existing unavailable dates and reasons
5. **Delete Availability** - Remove unavailable dates
6. **Availability Validation** - Prevent setting past dates as unavailable

### User Roles & Permissions
- **Musician & Auxiliar Musician**: Full CRUD access to own availability
- **Admin**: Can view any musician's availability (read-only for others)

## Technical Implementation Plan

### Phase 1: API Integration & Types (1-2 days)

#### 1.1 Add API Functions
**File**: `src/app/lib/api/musicianAvailability.ts`
```typescript
export interface MusicianAvailability {
  id: number;
  musician_id: number;
  unavailable_date: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAvailabilityRequest {
  musician_id: number;
  unavailable_date: string;
  reason: string;
}

export interface BulkAvailabilityRequest extends Array<{
  musician_id: number;
  unavailable_date: string;
  reason: string;
}>

export const musicianAvailabilityApi = {
  // Get availability for a musician
  getByMusician: async (musicianId: number): Promise<ApiResponse<MusicianAvailability[]>>,
  
  // Check if musician is available on date
  checkAvailability: async (musicianId: number, date: string): Promise<ApiResponse<boolean>>,
  
  // Create single availability entry
  create: async (data: CreateAvailabilityRequest): Promise<ApiResponse<MusicianAvailability>>,
  
  // Create bulk availability entries
  createBulk: async (data: BulkAvailabilityRequest): Promise<ApiResponse<MusicianAvailability[]>>,
  
  // Update availability entry
  update: async (id: number, data: Partial<CreateAvailabilityRequest>): Promise<ApiResponse<MusicianAvailability>>,
  
  // Delete availability entry
  delete: async (id: number): Promise<ApiResponse<{ message: string }>>,
  
  // Delete by musician and date
  deleteByDate: async (musicianId: number, date: string): Promise<ApiResponse<{ message: string }>>
};
```

#### 1.2 Add Translation Keys
**Files**: `src/i18n/locales/en.json`, `src/i18n/locales/es.json`
```json
{
  "musicianAvailability": {
    "title": "My Availability",
    "subtitle": "Manage your unavailable dates",
    "calendar": {
      "today": "Today",
      "available": "Available",
      "unavailable": "Unavailable",
      "selectDate": "Select date"
    },
    "form": {
      "date": "Date",
      "reason": "Reason (optional)",
      "reasonPlaceholder": "e.g., Vacation, Family event, etc.",
      "addSingle": "Add Unavailable Date",
      "addBulk": "Add Multiple Dates",
      "edit": "Edit Availability",
      "save": "Save Changes",
      "cancel": "Cancel"
    },
    "actions": {
      "edit": "Edit",
      "delete": "Delete",
      "confirmDelete": "Remove this unavailable date?"
    },
    "messages": {
      "added": "Availability updated successfully",
      "deleted": "Availability removed successfully",
      "error": "Failed to update availability",
      "pastDateError": "Cannot set past dates as unavailable",
      "duplicateError": "This date is already marked as unavailable"
    },
    "empty": {
      "title": "No unavailable dates",
      "description": "You haven't set any unavailable dates yet."
    }
  }
}
```

### Phase 2: Core Components (3-4 days)

#### 2.1 Main Availability Page Component
**File**: `src/app/components/musician-availability/MusicianAvailabilityPage.tsx`
```typescript
interface MusicianAvailabilityPageProps {
  musicianId: number;
}

export function MusicianAvailabilityPage({ musicianId }: MusicianAvailabilityPageProps) {
  // Component logic for full availability management
  // Calendar view, forms, CRUD operations
}
```

#### 2.2 Calendar Component
**File**: `src/app/components/musician-availability/AvailabilityCalendar.tsx`
```typescript
interface AvailabilityCalendarProps {
  availability: MusicianAvailability[];
  onDateClick: (date: Date) => void;
  onDateSelect: (dates: Date[]) => void;
  selectedDates?: Date[];
}

export function AvailabilityCalendar(props: AvailabilityCalendarProps) {
  // Calendar implementation with availability indicators
}
```

#### 2.3 Availability Form Components
**Files**: 
- `src/app/components/musician-availability/AddAvailabilityDialog.tsx`
- `src/app/components/musician-availability/EditAvailabilityDialog.tsx`
- `src/app/components/musician-availability/BulkAvailabilityDialog.tsx`

#### 2.4 Availability List Component
**File**: `src/app/components/musician-availability/AvailabilityList.tsx`
```typescript
interface AvailabilityListProps {
  availability: MusicianAvailability[];
  onEdit: (item: MusicianAvailability) => void;
  onDelete: (id: number) => void;
}

export function AvailabilityList(props: AvailabilityListProps) {
  // List view with edit/delete actions
}
```

### Phase 3: Home Page Integration (1 day)

#### 3.1 Add Navigation Card
**File**: `src/app/components/home/HomePage.tsx`
Add new card for musician availability access:
```typescript
{hasRole('musician') || hasRole('auxiliar_musician') ? (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Calendar className="mr-2 h-5 w-5" />
        {t('home.cards.availability.title')}
      </CardTitle>
      <CardDescription>
        {t('home.cards.availability.description')}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button 
        onClick={() => navigate('/musician-availability')}
        className="w-full"
      >
        {t('home.cards.availability.button')}
      </Button>
    </CardContent>
  </Card>
) : null}
```

#### 3.2 Add Route
**File**: `src/app/App.tsx` or routing configuration
```typescript
<Route path="/musician-availability" element={
  <PrivateRoute>
    <MusicianAvailabilityPage musicianId={user?.id} />
  </PrivateRoute>
} />
```

### Phase 4: Testing & Validation (2-3 days)

#### 4.1 Unit Tests
- API function tests
- Component rendering tests
- Form validation tests
- Calendar interaction tests

#### 4.2 Integration Tests
- Full availability management workflow
- Error handling scenarios
- Permission-based access tests

#### 4.3 E2E Tests
- Complete user journey from home page to availability management

## Implementation Timeline

### Week 1: Foundation (Days 1-2)
- ✅ Complete API integration and types
- ✅ Add translation keys
- ✅ Set up component structure

### Week 2: Core Development (Days 3-5)
- ✅ Implement AvailabilityCalendar component
- ✅ Create form dialogs (Add, Edit, Bulk)
- ✅ Build AvailabilityList component
- ✅ Implement CRUD operations

### Week 3: Integration & Testing (Days 6-7)
- ✅ Integrate with home page navigation
- ✅ Add routing configuration
- ✅ Comprehensive testing
- ✅ Bug fixes and refinements

## Technical Considerations

### Performance
- Cache availability data to reduce API calls
- Implement date range filtering for large calendars
- Lazy load calendar months as needed

### UX/UI
- Clear visual distinction between available/unavailable dates
- Intuitive bulk selection for date ranges
- Responsive design for mobile devices
- Loading states and error feedback

### Security
- Client-side validation for date constraints
- Server-side enforcement of business rules
- Proper error handling for unauthorized access

### Accessibility
- Keyboard navigation for calendar
- Screen reader support for date selection
- High contrast indicators for availability status

## Risk Assessment

### Medium Risk
- **Calendar Implementation**: Complex date handling and selection logic
- **Bulk Operations**: Managing multiple date selections and validations
- **Time Zone Handling**: Ensuring consistent date display across time zones

### Low Risk  
- **API Integration**: Well-documented endpoints with clear contracts
- **Permission System**: Already established role-based access control
- **UI Components**: Leveraging existing design system components

## Success Criteria

1. ✅ Musicians can view their availability calendar
2. ✅ Musicians can add/remove unavailable dates with reasons
3. ✅ Bulk date selection works for extended periods
4. ✅ All CRUD operations function correctly
5. ✅ Proper validation prevents invalid date selections
6. ✅ Integration with home page navigation works
7. ✅ Comprehensive test coverage achieved
8. ✅ Responsive design across devices
9. ✅ Proper error handling and user feedback
10. ✅ Accessibility standards met

## Dependencies

- **Existing**: Home page navigation system, routing, authentication
- **New**: Calendar/date picker library (consider react-datepicker or similar)
- **API**: All musician availability endpoints implemented and tested

## Future Enhancements

- **Calendar Sync**: Integration with external calendars (Google Calendar, Outlook)
- **Recurring Availability**: Weekly/monthly recurring unavailable patterns
- **Team Calendar**: Admin view of all musicians' availability
- **Conflict Alerts**: Notifications when assigned to unavailable dates
- **Mobile App**: Dedicated mobile interface for availability management

This plan provides a comprehensive roadmap for implementing musician availability management with clear phases, deliverables, and success criteria. The implementation follows existing patterns in the codebase and integrates seamlessly with the current user experience.

## New Requirements: Month-Based Availability List Filtering

### Problem Statement
The Availability List section currently accumulates all availability records for a musician, which can grow over time and negatively impact:
- Page load performance
- User experience with cluttered UI
- Memory usage and rendering overhead

### Solution
Implement month-based filtering for the Availability List to show only records for the currently viewed month in the calendar.

### API Endpoint
```
GET /api/musician-availability/{musician_id}/month/{year}/{month}
```

### API Response Format
```json
{
  "musician_id": 5,
  "year": 2026,
  "month": 5,
  "unavailable_dates": [
    {
      "id": 30,
      "unavailable_date": "2026-05-13",
      "reason": "Lage Weekend"
    },
    {
      "id": 31,
      "unavailable_date": "2026-05-14",
      "reason": "Evento Familiar"
    }
  ]
}
```

### Implementation Steps
1. **Update API Layer**
   - Add `MusicianAvailabilityByMonthResponse` interface
   - Add `getByMusicianAndMonth(musicianId, year, month)` method
   - Handle new response format with `unavailable_dates` array

2. **Update Component Logic**
   - Add state for `currentMonthAvailability` and `currentMonth`
   - Implement `loadCurrentMonthAvailability()` function
   - Add `handleMonthChange()` callback for calendar navigation
   - Update Availability List to use month-specific data
   - Maintain full availability data for calendar view

3. **Calendar Integration**
   - Add `onMonthChange` and `initialMonth` props to AvailabilityCalendar
   - Trigger month data reload when calendar month changes
   - Ensure seamless navigation between months

4. **UI Updates**
   - Update count display to show current month count
   - Maintain existing functionality for add/edit/delete operations
   - Handle empty states for months with no availability

5. **Testing**
   - Update tests to mock month-specific API calls
   - Verify month navigation triggers correct data loading
   - Test edge cases (empty months, API errors)

### Benefits
- **Performance**: Significantly reduced data transfer and rendering
- **UX**: Cleaner, more focused list view
- **Scalability**: Handles long-term musician availability histories
- **Compatibility**: Maintains all existing features

### Backward Compatibility
- Calendar view continues to show all unavailable dates for proper visualization
- Add/Edit/Delete operations work across all months
- Existing API endpoints remain functional

## Technical Considerations
- Timezone handling for date comparisons
- Error handling for invalid months/years
- State synchronization between calendar and list
- API error fallbacks

## Testing Strategy
- Unit tests for API methods
- Component tests for month navigation
- Integration tests for data flow
- Performance tests for large datasets

## Future Enhancements
- Pagination for very large monthly datasets
- Search/filter within month view
- Calendar month caching for performance
- Bulk operations across multiple months