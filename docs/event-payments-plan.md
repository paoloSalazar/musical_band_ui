# Event Payments Implementation Plan

## Overview
Implement event payment functionality allowing event creators to make payments and view payment details for their events.

## Requirements from docs/event_payments.txt

### API Endpoints
1. **GET /api/events/{event_id}/payments** - Get all payments for an event
   - Access: Admin OR event owner
   
2. **POST /api/events/{event_id}/payments** - Create a new payment
   - Access: Only event creator (not admin)
   
3. **GET /api/events/{event_id}/payments/summary** - Get payment summary
   - Access: Admin OR event owner

### Payment Types
- **ADVANCE**: Can't exceed remaining balance
- **REMAINING**: Can't exceed remaining balance
- **FULL**: Pays entire remaining balance

### Rules
- Admin cannot create payments (only event creator can)
- Before proceeding with payments, admin user should set final_price for event

## Implementation Plan

### 1. Types (src/app/lib/types.ts) 
- Add `PaymentType` union type ('ADVANCE' | 'REMAINING' | 'FULL')
- Add `Payment` interface
- Add `PaymentSummary` interface
- Add `PaymentFormData` interface

### 2. API Methods (src/app/lib/api/events.ts) 
- Add `getPayments(eventId)` method
- Add `getPaymentSummary(eventId)` method
- Add `createPayment(eventId, data)` method

### 3. ViewPaymentDetailsDialog Component (New)
Location: `src/app/components/events/ViewPaymentDetailsDialog.tsx`

Features:
- Shows payment summary (total_paid, remaining_balance, final_price)
- Shows list of all payments with details (amount, type, date, notes)
- Accessible to: event creator OR admin
- Uses GET /api/events/{event_id}/payments and /api/events/{event_id}/payments/summary

### 4. MakePaymentDialog Component (New)
Location: `src/app/components/events/MakePaymentDialog.tsx`

Features:
- Form with: amount input, payment type select (ADVANCE/REMAINING/FULL), notes textarea
- Payment type rules enforced (can't exceed remaining balance)
- Only accessible to event creator (NOT admin)
- Uses POST /api/events/{event_id}/payments

### 5. Update ViewEventDialog
Location: `src/app/components/events/ViewEventDialog.tsx`

Changes:
- Add check: `isEventCreator = user.id === event.user_id`
- If event creator (not admin), show two buttons in footer:
  1. "View Payment Details" - opens ViewPaymentDetailsDialog
  2. "Make Payment" - opens MakePaymentDialog
- Admin can see payment details but cannot make payments

## UI Flow
```
ViewEventDialog (for event creator)
├── [View Payment Details] → ViewPaymentDetailsDialog
│   └── Shows: Summary + Payment History Table
└── [Make Payment] → MakePaymentDialog
    └── Form: Amount + Type + Notes → POST payment
```

## Files to Create/Modify
- ✅ src/app/lib/types.ts (types)
- ✅ src/app/lib/api/events.ts (API methods)
- 📄 src/app/components/events/ViewPaymentDetailsDialog.tsx (NEW)
- 📄 src/app/components/events/MakePaymentDialog.tsx (NEW)
- 📄 src/app/components/events/ViewEventDialog.tsx (MODIFY)