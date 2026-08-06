Phase 4: Implement EventMusicianTable and integrate into EventMusicianManagement.

- Created EventMusicianTable component to render musician assignations with columns: Musician, Role, Salary, Payment Status, Actions.
- Integrated table usage in EventMusicianManagement to render actual data when available.
- Hooked up placeholder actions Edit/Delete for future wiring.

Phase 4.5: Fix i18n tests and Reports section authorization.

- Fixed duplicate `i18n` import in `tests/i18n/utils.test.ts`.
- Updated `ViewEventDialog.tsx` Reports section to be visible for both admins AND event owners.
- Added `isEventOwner` and `canViewReports` computed values.
- Updated tests in `ViewEventDialog.test.tsx` to verify authorization behavior.

Phase 5: Edit Dialogs for editing musician assignments, followed by Phase 6 - Delete confirmations, Phase 7 - State management and data refresh, Phase 8 - Authorization enhancements, Phase 9 - Testing, Phase 10 - Documentation.

Next: Phase 5 - Edit Dialogs for editing musician assignments
