# Musician Event Payments Implementation Plan

## Overview
This plan outlines the implementation of musician payment management for events, starting from the existing `EventMusicianTable.tsx` component. The feature will allow admins to record and view payments (ADVANCE, REMAINING, TOTAL) for assigned musicians using the new Musician Event Payment Endpoints.

## Key Requirements
- Start integration from `EventMusicianTable.tsx` (add payment action buttons/icons per row)
- Support payment types: ADVANCE (≤50% salary, before event), REMAINING (after event), TOTAL (full salary after event)
- New UI components: AddMusicianPaymentDialog, ViewMusicianPaymentsDialog, PaymentSummaryBadge
- API integration:
  - `POST /events/{event_id}/musicians/{musician_id}/payments`
  - `GET /events/{event_id}/musicians/{musician_id}/payments`
  - `GET /events/{event_id}/musicians/{musician_id}/payments/summary`
- Authorization: Requires `write:musician_event_payment` / `read:musician_event_payment` + admin role (musicians can view their own)
- Payment status indicators in the table (e.g., "Paid", "Partial", "Pending")
- Follow existing patterns from EventMusicianManagement, AssignMusicianDialog, etc.
- Internationalization support via existing i18n keys under `events.musicianPayments.*`
- **TDD approach (tests written before implementation code)**

## Starting Point
- File: `src/app/components/events/EventMusicianTable.tsx`
- Current columns: Musician, Role, Salary, Payment Status, Actions
- Extend "Payment Status" column and "Actions" with payment-related buttons

## Phase 1: Planning and API Review
### Objectives
- Review Musician Event Payment Endpoints documentation
- Analyze current EventMusicianTable and related components
- Define data models for payments

### Tasks
1. Read `docs/musician_events_api_documentation.md` section 3
2. Inspect `EventMusicianTable.tsx`, `EventMusicianManagement.tsx`
3. Define TypeScript interfaces for MusicianPayment and PaymentSummary
4. Identify required translations

## Phase 2: UI Enhancements in EventMusicianTable
### Objectives
- Add payment status visualization
- Add action buttons: "Record Payment", "View Payments"
- **TDD**: Write tests for new table columns, badges and button behavior first

### Tasks
1. Write tests for payment status rendering and action buttons (Red)
2. Extend table with payment summary badge / status (Green)
3. Add icons/buttons in Actions column (using lucide-react icons like DollarSign, CreditCard)
4. Wire up placeholder handlers that open future dialogs
5. Handle loading states for payment summary fetch

## Phase 3: Create Supporting Dialogs
### Objectives
- Build AddMusicianPaymentDialog
- Build ViewMusicianPaymentsDialog (list + summary)
- **TDD**: Write component tests before implementing the dialogs

### Tasks
1. Write tests describing dialog behavior, form validation, and submission (Red)
2. Implement AddMusicianPaymentDialog with form fields (amount, payment_type, payment_date, notes) (Green)
3. Implement payment type validation rules in UI
4. Create ViewMusicianPaymentsDialog showing history list and total paid
5. Add success/error handling and refresh callbacks

## Phase 4: API Layer & State Management
### Objectives
- Extend or create API functions in `src/lib/api/events.ts` or new musicianPaymentsApi
- Integrate summary and payment fetching

### Tasks
1. Add typed API methods for the three payment endpoints
2. Add state for payments in EventMusicianManagement or local table state
3. Implement optimistic updates or refetch after payment actions

## Phase 5: Authorization & Edge Cases
### Objectives
- Enforce role/permission checks
- Handle business rule errors (amount limits, timing, conflicts)

### Tasks
1. Use existing `useUser` permission/role hooks
2. Display appropriate disabled states or messages for non-admins
3. Map API 400/409 errors to user-friendly messages using `translateApiError`

## Phase 6: Testing & Documentation
### Objectives
- Follow strict TDD: write failing tests first, then implement to make them pass
- Unit tests for dialogs, table enhancements, and payment logic
- Update feature documentation

### Tasks
1. For each new UI component/dialog, first write tests that describe expected behavior (Red)
2. Implement the minimal code to make tests pass (Green)
3. Refactor while keeping tests green
4. Update `docs/musician_events_api_documentation.md` usage notes if needed
5. Add usage examples to the new plan document

## Future Considerations
- Bulk payment recording
- Payment history export
- Integration with overall event financial summary
- Real-time updates via WebSocket (if backend supports)

This plan ensures incremental delivery while reusing existing patterns from musician assignment management.
