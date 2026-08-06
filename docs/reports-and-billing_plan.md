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

---

# PDF Export Feature for ViewPaymentDetailsDialog

## Overview
Add PDF export functionality to the `ViewPaymentDetailsDialog` component to allow users to download payment details as a PDF file. This feature will enable better record-keeping and sharing of payment information.

## Feature Requirements
- Export payment details from `ViewPaymentDetailsDialog` component to PDF
- Include payment summary and history in the exported document
- Support localization (English and Spanish)
- Professional formatting for screen and print
- User-friendly button in dialog footer
- Loading/processing feedback during PDF generation

## Technology Stack
- **jsPDF**: Core PDF generation library
- **html2canvas**: Convert HTML elements to canvas for inclusion in PDF
- **Stack rationale**: 
  - High control over PDF layout and formatting
  - Better quality than simple HTML-to-PDF solutions
  - Excellent support for styling and complex layouts
  - Good browser compatibility

## Architecture Decision: Option B (Separate Utility)
- Create dedicated `src/app/lib/pdf/paymentDetailsPdfGenerator.ts` utility file
- Contains all PDF generation logic isolated from component
- Reusable across components that need payment PDF export
- Easier to test independently
- Cleaner component code with focused responsibilities

## Implementation Plan - Test-Driven Development (TDD)

### Phase 1: Setup and Dependencies
**Objective**: Install and configure PDF libraries

**Changes**:
1. Add dependencies to `package.json`:
   - `jspdf`: ^2.5.1 (PDF generation)
   - `html2canvas`: ^1.4.1 (HTML to canvas conversion)
   - `@types/jspdf`: ^2.5.0 (TypeScript types)
   - `@types/html2canvas`: ^1.0.0 (TypeScript types)

2. Verify bundling configuration in `vite.config.ts` if needed

**No code changes** - dependency installation only

---

### Phase 2: PDF Generator Utility - Test Suite
**Objective**: Write tests for PDF generation logic (TDD approach)

**Test File**: `tests/lib/pdf/paymentDetailsPdfGenerator.test.ts`

**Tests to write**:
```typescript
describe('paymentDetailsPdfGenerator', () => {
  describe('generatePaymentPDF', () => {
    // Test 1: Should create a PDF with correct filename
    test('should generate PDF with event name and date in filename', () => {})
    
    // Test 2: Should include payment summary section
    test('should include payment summary in PDF', () => {})
    
    // Test 3: Should include all payment history
    test('should include all payment history rows in PDF', () => {})
    
    // Test 4: Should format currency values correctly
    test('should format currency amounts with 2 decimal places', () => {})
    
    // Test 5: Should handle empty payment history
    test('should handle zero payments gracefully', () => {})
    
    // Test 6: Should include proper localized text
    test('should respect i18n translations in PDF content', () => {})
    
    // Test 7: Should format dates according to locale
    test('should format dates consistently with component', () => {})
    
    // Test 8: Should include header section with event details
    test('should include event name and export timestamp in header', () => {})
    
    // Test 9: Should handle PDF generation errors
    test('should throw error if HTML element is invalid', () => {})
    
    // Test 10: Should include footer with page info
    test('should include page numbers and export metadata in footer', () => {})
  })
  
  describe('formatPDFData', () => {
    // Test 11: Should format summary correctly
    test('should format payment summary data structure', () => {})
    
    // Test 12: Should handle null/undefined summary
    test('should handle missing summary data', () => {})
    
    // Test 13: Should format payment type labels
    test('should translate payment types (ADVANCE, REMAINING, FULL)', () => {})
  })
})
```

**Key test utilities**:
- Mock `jsPDF` and `html2canvas`
- Mock i18n `useTranslation` hook
- Create fixture data for Payment and PaymentSummary types
- Test with different locale configurations

---

### Phase 3: PDF Generator Utility Implementation
**Objective**: Implement PDF generation utility based on passing tests

**File**: `src/app/lib/pdf/paymentDetailsPdfGenerator.ts`

**Exports**:
1. **Function**: `generatePaymentPDF()`
   - Parameters:
     - `contentElement`: HTMLElement (PDF content to render)
     - `eventName`: string
     - `summary`: PaymentSummary | null
     - `payments`: Payment[]
     - `translations`: i18n translations object
     - `locale`: 'en' | 'es'
   - Returns: Promise<void> (triggers download)
   - Implementation steps:
     a. Validate input parameters
     b. Convert HTML element to canvas using html2canvas
     c. Create jsPDF instance with proper dimensions
     d. Calculate proper page breaks for multi-page content
     e. Add header with event name and export date
     f. Add payment summary section (formatted)
     g. Add payment history table
     h. Add footer with page numbers and metadata
     i. Generate filename with event name and timestamp
     j. Trigger PDF download
     k. Handle errors gracefully

2. **Function**: `formatPaymentPDFContent()`
   - Parameters:
     - `summary`: PaymentSummary
     - `payments`: Payment[]
     - `locale`: 'en' | 'es'
   - Returns: string (HTML content for PDF)
   - Creates clean, printer-friendly HTML structure
   - Applies print-specific styling

3. **Utility**: `generateFilename()`
   - Parameters: `eventName`: string
   - Returns: string (filename with timestamp)
   - Format: `Payment-Details-{eventName}-{YYYY-MM-DD}.pdf`

4. **Helper**: `formatCurrencyForPDF()`
   - Consistent currency formatting for PDF
   - Uses same logic as component for alignment

**Styling approach**:
- CSS-in-JS for PDF layout (not Tailwind)
- Print-friendly colors and formatting
- Proper spacing for readability
- Supports both light and dark printing modes
- Responsive margins and padding

---

### Phase 4: PDF Generator Component Integration - Tests
**Objective**: Write tests for component integration (TDD)

**Test File**: `tests/components/events/ViewPaymentDetailsDialog.test.tsx`

**Additional tests**:
```typescript
describe('ViewPaymentDetailsDialog - PDF Export', () => {
  // Test 1: Should render print button in footer
  test('should render "Print as PDF" button when dialog is open', () => {})
  
  // Test 2: Should show loading state during PDF generation
  test('should show loading indicator while generating PDF', () => {})
  
  // Test 3: Should disable button during PDF generation
  test('should disable PDF button while processing', () => {})
  
  // Test 4: Should call PDF generator with correct data
  test('should pass correct data to PDF generator function', () => {})
  
  // Test 5: Should handle PDF generation errors
  test('should show error message if PDF generation fails', () => {})
  
  // Test 6: Should handle successful PDF generation
  test('should trigger download on successful PDF generation', () => {})
  
  // Test 7: Should use correct button icon
  test('should display appropriate icon for PDF button', () => {})
  
  // Test 8: Should have accessible button label
  test('should have aria-label or tooltip for accessibility', () => {})
})
```

**Test fixtures**:
- Mock payment data with various payment types
- Mock summary data with different balance states
- Mock i18n translations
- Mock html2canvas and jsPDF

---

### Phase 5: ViewPaymentDetailsDialog Component - Implementation
**Objective**: Implement PDF export button and handler

**File**: `src/app/components/events/ViewPaymentDetailsDialog.tsx`

**Changes**:
1. **Imports**:
   - Add: `import { generatePaymentPDF } from '../../lib/pdf/paymentDetailsPdfGenerator'`
   - Add: `import { Download } from 'lucide-react'` (or appropriate icon)

2. **State Management**:
   - Add: `const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)`
   - Add: `const pdfContentRef = useRef<HTMLDivElement>(null)`

3. **Event Handlers**:
   - Add: `handlePrintPDF()` function
     - Set loading state
     - Call PDF generator utility
     - Handle success/error
     - Reset loading state

4. **UI Changes**:
   - Wrap dialog content in div with ref: `<div ref={pdfContentRef}>`
   - Update DialogFooter:
     - Add print button before close button
     - Use Download icon
     - Show loading state with spinner
     - Disable during processing

5. **Accessibility**:
   - Add proper aria-labels
   - Add tooltips or descriptive text
   - Ensure keyboard navigation works

**Button placement**:
```
DialogFooter:
  [Print as PDF Button] [Close Button]
```

---

### Phase 6: Print-Friendly Content Component (Optional Enhancement)
**Objective**: Create separate print layout for better PDF quality

**File**: `src/app/components/events/PrintPaymentDetails.tsx` (optional)

**When to implement**: If direct HTML rendering to PDF produces unsatisfactory results

**Purpose**:
- Create clean, minimal HTML specifically for PDF export
- Avoid Tailwind styling issues in PDF rendering
- Optimize spacing, fonts, and colors for print
- Reusable for other payment-related PDFs

---

### Phase 7: Styling and Visual Refinement
**Objective**: Ensure PDF looks professional and prints well

**CSS Considerations**:
- Font sizing: Use absolute sizes (pt/mm) for PDF
- Colors: Test both color and black/white printing
- Spacing: Optimize margins and padding for readability
- Headers/Footers: Professional formatting
- Tables: Proper alignment and borders
- Currency: Consistent formatting with right alignment

**Print testing**:
- Test in Chrome, Firefox, Safari
- Test PDF open in different viewers
- Verify scaling on different paper sizes
- Test color vs. grayscale printing

---

### Phase 8: Localization Testing
**Objective**: Ensure PDF respects locale settings

**Verification**:
- Test English PDF with correct text and date format
- Test Spanish PDF with correct text and date format
- Verify currency symbols are appropriate
- Check text wrapping with longer translations
- Ensure special characters render correctly

---

### Phase 9: Error Handling and Edge Cases
**Objective**: Handle all failure scenarios gracefully

**Scenarios**:
1. PDF generation timeout
2. Browser memory limitations with large datasets
3. Missing or invalid data
4. Network-related issues (if fetching during PDF generation)
5. User cancellation
6. Browser compatibility issues

**Implementation**:
- Add try-catch blocks
- Show user-friendly error messages
- Log errors for debugging
- Provide fallback options (e.g., copy to clipboard)

---

### Phase 10: Performance Optimization
**Objective**: Ensure smooth PDF generation even with large data sets

**Considerations**:
- Lazy load PDF libraries if not immediately needed
- Cache PDF generator utilities
- Consider streaming for very large PDFs
- Optimize image/canvas rendering
- Monitor bundle size impact

---

## File Structure

```
src/app/lib/pdf/
├── paymentDetailsPdfGenerator.ts      (PDF generation utility)
└── index.ts                            (Barrel export)

src/app/components/events/
├── ViewPaymentDetailsDialog.tsx        (Updated with PDF button)
├── PrintPaymentDetails.tsx             (Optional: Print-friendly layout)
└── [existing files]

tests/lib/pdf/
├── paymentDetailsPdfGenerator.test.ts  (Utility tests)
└── __fixtures__/
    └── paymentData.ts                  (Test fixtures)

tests/components/events/
└── ViewPaymentDetailsDialog.test.tsx   (Updated with PDF tests)
```

---

## Dependencies Summary

**New packages**:
```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "@types/jspdf": "^2.5.0",
  "@types/html2canvas": "^1.0.0"
}
```

**Estimated bundle size impact**: ~250-300KB (gzipped: ~80-100KB)

---

## Testing Strategy Summary

1. **Unit Tests**: PDF generator utility functions (Phase 2, 3)
2. **Component Tests**: ViewPaymentDetailsDialog integration (Phase 4, 5)
3. **Integration Tests**: Full PDF generation flow
4. **E2E Tests**: User workflow (open dialog → click PDF button → verify download)
5. **Visual Tests**: PDF output quality and formatting
6. **Localization Tests**: Multi-language support (Phase 8)
7. **Performance Tests**: Large dataset handling (Phase 10)

---

## Development Workflow (TDD)

1. Write failing tests for PDF generator (Phase 2)
2. Implement PDF generator to pass tests (Phase 3)
3. Write failing tests for component integration (Phase 4)
4. Implement component changes to pass tests (Phase 5)
5. Test visual quality and refine styling (Phase 7)
6. Test localization across languages (Phase 8)
7. Test error scenarios and edge cases (Phase 9)
8. Performance testing and optimization (Phase 10)

---

## Success Criteria

- [ ] PDF exports with all payment details
- [ ] Filename includes event name and date
- [ ] Button shows loading state during generation
- [ ] PDF displays correctly when opened
- [ ] All currency values formatted consistently
- [ ] Works in Chrome, Firefox, Safari
- [ ] Supports both English and Spanish locales
- [ ] Handles error cases gracefully
- [ ] All tests passing (100% coverage for PDF utility)
- [ ] Documentation updated
- [ ] No performance regression

---

## Future Enhancements

1. **Print Preview**: Show preview before downloading
2. **Export Formats**: Support PNG, JPG, CSV
3. **Email Integration**: Send PDF via email directly
4. **Batch Export**: Export multiple event payments
5. **Report Templates**: Customizable PDF layouts
6. **Watermarks**: Add "DRAFT" or company branding
7. **Signatures**: Add digital signature support
8. **QR Codes**: Include payment reference QR codes