# Plan for Implementing Reports Summary in UI

## Overview
We need to implement two report summaries in the ViewEventDialog component:
1. Event billing summary (from GET {{api}}/events/{eventId}/billing-summary)
2. Musician payment summary (from GET {{api}}/events/{eventId}/musicians/payment-summary)

## Current State
- ViewEventDialog.tsx exists at src/app/components/events/ViewEventDialog.tsx
- We have two API endpoints available for the summaries

## Implementation Plan

### Phase 1: UI Modifications in ViewEventDialog.tsx
1. Add two buttons in the dialog:
   - "View Billing Summary" button
   - "View Musician Payment Summary" button
2. Implement click handlers for each button that:
   - Set loading state
   - Call the respective API endpoint
   - Store the response data
   - Open a popup/modal to display the results

### Phase 2: Billing Summary Popup
1. Create a reusable popup/modal component or use existing one
2. Display the billing summary data in a formatted way:
   - Event name
   - Payment done
   - Sum of musician salaries
   - Remaining payment
   - Payment done to musicians
3. Handle loading and error states

### Phase 3: Musician Payment Summary Popup
1. Create a table to display the musician payment summary data
2. Table columns:
   - Musician Name
   - Role
   - Salary
   - Payment Done
   - Remaining Payment
3. Handle loading and error states
4. Format currency values appropriately

### Phase 4: API Integration
1. Create service functions for the two endpoints (if not already available)
2. Implement proper error handling
3. Use React Query or similar for data fetching if applicable, or use useState/useEffect

### Phase 5: Styling and UI/UX
1. Ensure buttons are styled consistently with existing UI
2. Make popups responsive and accessible
3. Add proper spacing and typography

## Files to Modify
1. src/app/components/events/ViewEventDialog.tsx - Main implementation
2. Possibly create new components for popups if not reusing existing ones
3. Possibly update service/api files if endpoints need to be added

## Dependencies
- Check if we have a modal/dialog component already in use
- Check if we have API service functions for similar endpoints

## Notes
- We need to extract eventId from the dialog's props or context
- We should follow existing patterns in the codebase for API calls and UI components
- Consider reusing existing popup/modal components to maintain consistency