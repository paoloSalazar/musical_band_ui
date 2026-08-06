# PDF Report Buttons - Frontend Implementation Plan

## Overview
Add two icon-only button components to generate PDF reports (Receipt and Contract) in the Event Details dialog. Buttons are accessible only to admins and event owners.

---

## 1. Current State Analysis

### Existing Components
- `ViewEventDialog.tsx` already has a Reports section (lines 392-434) with billing summary and musician payment summary buttons
- Authorization pattern: `hasRole('admin')` + `event.user_id === user.id` for event owner check
- `eventsApi` module exists at `src/app/lib/api/events.ts` but lacks PDF endpoints

### Dependencies
- Uses `lucide-react` for icons
- Translation system via `react-i18next`
- User context via `useUser()` hook

### Recent Changes (Completed)
- Reports section now visible for both admins AND event owners (not just admins)
- Added `isEventOwner` and `canViewReports` computed values

---

## 2. Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/app/lib/hooks/useDownloadPdf.ts` | Reusable hook for PDF downloads |
| `src/app/components/events/ReceiptDownloadButton.tsx` | Receipt PDF icon button |
| `src/app/components/events/ContractDownloadButton.tsx` | Contract PDF icon button |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/lib/api/events.ts` | Add `downloadReceiptPdf()` and `downloadContractPdf()` methods |
| `src/app/components/events/ViewEventDialog.tsx` | Add PDF buttons in Reports section |
| `src/i18n/locales/en.json` | Add translation keys for button labels |
| `src/i18n/locales/es.json` | Add Spanish translation keys |

---

## 3. API Layer Changes

### `src/app/lib/api/events.ts`
```typescript
downloadReceiptPdf: async (eventId: number): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/api/receipts/${eventId}/pdf`, {
    headers: apiClient.getHeaders(),
  });
  return response.blob();
},

downloadContractPdf: async (eventId: number): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/api/contracts/${eventId}/pdf`, {
    headers: apiClient.getHeaders(),
  });
  return response.blob();
},
```

---

## 4. Hook Implementation

### `src/app/lib/hooks/useDownloadPdf.ts`
```typescript
export function useDownloadPdf() {
  const download = async (url: string, filename: string): Promise<void> => {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiClient.getToken()}` },
    });
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
  };
  return { download };
}
```

---

## 5. Component Implementations

### ReceiptDownloadButton.tsx
- Icon: `FileText` from lucide-react
- Calls `eventsApi.downloadReceiptPdf()` on click
- Shows loading state during download

### ContractDownloadButton.tsx
- Icon: `FileText` from lucide-react (could use different icon like `FileSignature`)
- Calls `eventsApi.downloadContractPdf()` on click
- Shows loading state during download

---

## 6. Authorization Logic

```typescript
const isAdmin = hasRole('admin');
const isEventOwner = user && event.user_id === user.id;
const canViewReports = isAdmin || isEventOwner;
```

Buttons rendered only when `canViewReports` is true.

**Note:** The existing reports section (billing summary, musician payment summary) was updated to be visible for both admins AND event owners, not just admins.

---

## 7. ViewEventDialog Integration

### Location
Add buttons in the Reports section after existing buttons (around line 431):

```tsx
{canViewReports && (
  <>
    <ReceiptDownloadButton 
      eventId={event.id} 
      aria-label={t('events.dialog.view.receiptPdfLabel')}
    />
    <ContractDownloadButton 
      eventId={event.id} 
      aria-label={t('events.dialog.view.contractPdfLabel')}
    />
  </>
)}
```

---

## 8. Translation Keys

### English (`src/i18n/locales/en.json`)
```json
"receiptPdfLabel": "Download Receipt PDF",
"contractPdfLabel": "Download Contract PDF"
```

### Spanish (`src/i18n/locales/es.json`)
```json
"receiptPdfLabel": "Descargar Recibo PDF",
"contractPdfLabel": "Descargar Contrato PDF"
```

---

## 9. Implementation Order

1. ~~Add API methods to `events.ts`~~ (completed)
2. ~~Create `useDownloadPdf.ts` hook~~ (completed)
3. ~~Create `ReceiptDownloadButton.tsx` component~~ (completed)
4. ~~Create `ContractDownloadButton.tsx` component~~ (completed)
5. ~~Update `ViewEventDialog.tsx` Reports section authorization~~ (completed - now visible for both admins AND event owners)
6. ~~Add translation keys~~ (completed)
7. ~~Integrate buttons in `ViewEventDialog.tsx`~~ (completed)

---

## 10. Testing Strategy

### Unit Tests
- Test `useDownloadPdf` hook with mocked fetch
- Test button rendering with different user roles

### Integration Tests
- Test PDF download flow with mocked API
- Test authorization (admin vs event owner vs other user)

### Files to Create
- `tests/components/events/ReceiptDownloadButton.test.tsx` (completed)
- `tests/components/events/ContractDownloadButton.test.tsx` (completed)
- `tests/lib/hooks/useDownloadPdf.test.ts` (completed)

**Completed Tests:**
- `tests/components/events/ViewEventDialog.test.tsx` - Updated to verify Reports section is visible for both admins AND event owners
- All 707 tests pass