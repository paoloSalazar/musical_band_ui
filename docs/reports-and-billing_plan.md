# Plan for Implementing Reports Summary in UI

## Overview
We need to implement two report summaries in the ViewEventDialog component:
1. Event billing summary (from GET {{api}}/events/{eventId}/billing-summary)
2. Musician payment summary (from GET {{api}}/events/{eventId}/musicians/payment-summary)

## Current State
- ViewEventDialog.tsx exists at src/app/components/events/ViewEventDialog.tsx
- We have two API endpoints available for the summaries:
  - `GET {{api}}/events/{eventId}/billing-summary`
  - `GET {{api}}/events/{eventId}/musicians/payment-summary`
- The billing summary returns a single object with string-encoded money fields.
- The musician payment summary returns an array of rows for each musician.

## Example API Responses

### Billing Summary
Request:
`GET {{api}}/events/4/billing-summary`
Authorization: `Bearer {{user_token}}`

Response:
```json
{
  "event_name": "Matrimonio Juan&Silvia",
  "event_price": "4000.00",
  "payment_done": "4000.00",
  "sum_of_musician_salaries": "1050.00",
  "remaining_payment": "0.00",
  "payment_done_to_musicians": "350.00"
}
```

### Musician Payment Summary
Request:
`GET {{api}}/events/4/musicians/payment-summary`
Authorization: `Bearer {{user_token}}`

Response:
```json
[
  {
    "musician_name": "vicente jimenez calle",
    "role": "Baterista",
    "salary": "500.00",
    "payment_done": "100.00",
    "remaining_payment": "400.00"
  }
]
```

## Implementation Plan

### Phase 1: UI Modifications in ViewEventDialog.tsx
1. Add a dedicated `Reports` section inside the dialog:
   - wrap the report buttons in a container like `<div className="flex items-start space-x-2">...</div>`
   - include a section title `Reports`
2. Add icon-only buttons for report generation to reduce horizontal footprint:
   - add an icon-only button for billing summary with a tooltip or accessible label
   - add an icon-only button for musician payment summary with a tooltip or accessible label
3. Add placeholder click handlers (no-op or skeleton state) for future implementation

### Phase 2: Implement Billing Summary Click Handler and API Call
1. Implement the click handler for the billing summary button
2. Fetch data from `GET {{api}}/events/{eventId}/billing-summary`
3. Handle loading and error states
4. Open the Billing Summary Popup modal with the fetched data

### Phase 3: Create Billing Summary Popup Component
1. Create a reusable popup/modal component or use existing one
2. Display the billing summary data in a formatted way:
   - Event name
   - Event price
   - Payment done
   - Remaining payment
   - Sum of musician salaries
   - Payment done to musicians
3. Use conditional text coloring based on payment status:
   - If `payment done < event price`: render `payment done` in orange and `remaining payment` in red
   - If `payment done === event price`: render `payment done` in green and `remaining payment` with no special color
   - If `sum of musician salaries > payment done to musicians`: render `payment done to musicians` in orange
   - If `sum of musician salaries === payment done to musicians`: render `payment done to musicians` in green
4. Handle loading and error states

### Phase 4: Implement Musician Payment Summary Click Handler and API Call
1. Implement the click handler for the musician payment summary button
2. Fetch data from `GET {{api}}/events/{eventId}/musicians/payment-summary`
3. Handle loading and error states
4. Open the Musician Payment Summary Popup modal with the fetched data

### Phase 5: Create Musician Payment Summary Popup Component
1. Create a table to display the musician payment summary data
2. Table columns:
   - Musician Name
   - Role
   - Salary
   - Payment Done
   - Remaining Payment
3. Use conditional text coloring for each row:
   - If `salary > payment done`: render `payment done` in orange and `remaining payment` in red
   - If `salary === payment done`: render `payment done` in green and `remaining payment` with no special color
4. Handle loading and error states
5. Format currency values appropriately

### Phase 6: API Integration
1. Create service functions for the two endpoints (if not already available)
2. Implement proper error handling
3. Use React Query or similar for data fetching if applicable, or use useState/useEffect

### Phase 6: API Integration
1. Create service functions for the two endpoints (if not already available)
2. Implement proper error handling
3. Use React Query or similar for data fetching if applicable, or use useState/useEffect

### Phase 7: Styling and UI/UX
1. Ensure buttons are styled consistently with existing UI
2. Make popups responsive and accessible
3. Add proper spacing and typography

### Test Strategy
1. Use TDD: write tests for Phase 1 UI changes before implementing
2. Phase 1 tests should verify:
   - the `Reports` section renders with the icon-only report buttons
   - each button has an accessible label or tooltip
   - placeholder click handlers exist and are callable
3. Write tests for subsequent phases before their implementation

## Files to Modify
- **Phase 1**: src/app/components/events/ViewEventDialog.tsx (UI only, no API calls)
- **Phase 2**: src/app/components/events/ViewEventDialog.tsx (add click handler and API call), possibly update service/api files
- **Phase 3**: Create new component for Billing Summary Popup
- **Phase 4**: src/app/components/events/ViewEventDialog.tsx (add click handler and API call)
- **Phase 5**: Create new component for Musician Payment Summary Popup
- **Phase 6**: Possibly update service/api files if endpoints need to be added
- **Phase 7**: Styling refinements across all components

## Dependencies
- Check if we have a modal/dialog component already in use
- Check if we have API service functions for similar endpoints

## Notes
- We need to extract eventId from the dialog's props or context
- We should follow existing patterns in the codebase for API calls and UI components
- Consider reusing existing popup/modal components to maintain consistency