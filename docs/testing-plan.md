# Unit Testing Implementation Plan

## Current State Analysis

Your project already has a **solid testing foundation** in place:

### Configured Testing Stack

- [Vitest](https://vitest.dev/) v4.0.18 - Test runner
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) v16.3.2 - Component testing
- [jsdom](https://github.com/jsdom/jsdom) v28.1.0 - Browser environment simulation
- [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) v6.9.1 - Custom Jest matchers

### Configuration Files

- [`vite.config.ts`](vite.config.ts#L13-L18) - Test configuration with jsdom environment
- [`tests/setup.ts`](tests/setup.ts#L1) - Imports jest-dom matchers
- [`package.json`](package.json#L9-L11) - Test scripts: `test`, `test:ui`, `test:run`

### Existing Tests

- [`tests/components/login/LoginForm.test.tsx`](tests/components/login/LoginForm.test.tsx) - 6 tests for login form
- [`tests/components/contexts/UserContext.test.tsx`](tests/components/contexts/UserContext.test.tsx) - 12 tests for user context

---

## Implementation Plan

### Phase 1: Expand Test Coverage for Existing Features

| Priority | Component | Test Type | File to Create |
|----------|-----------|----------|----------------|
| High | Auth Components (Can, CanRole, CanAny, ProtectedRoute) | Unit | `tests/components/auth/` |
| High | API Client / Services | Unit/Integration | `tests/lib/api/` |
| High | Permissions Utility | Unit | `tests/lib/permissions.test.ts` |
| Medium | Events Components | Integration | `tests/components/events/` |
| Medium | Profile Components | Integration | `tests/components/profile/` |
| Medium | Admin Components | Integration | `tests/components/admin/` |

### Phase 2: Test Utilities & Mocking Infrastructure

| Item | Description |
|------|-------------|
| MSW (Mock Service Worker) | Setup MSW for API mocking instead of manual `vi.fn()` mocks |
| Custom Render Wrapper | Create `tests/utils/test-utils.tsx` with common providers |
| Mock Data | Create `tests/fixtures/` with reusable mock data |
| Router Testing | Add `tests/utils/router.tsx` for routing tests |

### Phase 3: CI/CD Integration

- Add test command to CI pipeline
- Consider adding coverage reporting (vitest --coverage)
- Set up pre-commit hooks with `vitest --run` for staged files

---

## Recommended Test Structure

```
tests/
├── components/
│   ├── auth/
│   │   ├── Can.test.tsx
│   │   ├── CanRole.test.tsx
│   │   └── ProtectedRoute.test.tsx
│   ├── events/
│   │   ├── EventsListPage.test.tsx
│   │   └── CreateEventDialog.test.tsx
│   └── ...
├── contexts/
│   └── UserContext.test.tsx ✓ (exists)
├── hooks/
│   └── (custom hooks tests)
├── lib/
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── events.test.ts
│   │   └── rbac.test.ts
│   └── permissions.test.ts
├── fixtures/
│   ├── users.ts
│   ├── events.ts
│   └── roles.ts
└── utils/
    ├── test-utils.tsx
    └── router.tsx
```

---

## Quick Start Commands

```bash
# Run all tests
npm test

# Run tests with UI (browser-based)
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run specific file
npm test -- LoginForm.test.tsx

# Run tests in watch mode
npm test -- --watch
```

---

## Next Steps

1. **Add MSW** - Install `msw` for better API mocking
2. **Create test utilities** - Build reusable test helpers
3. **Add coverage** - Configure `vitest --coverage`
4. **Expand auth tests** - Test `Can`, `CanRole`, `CanAny` components
5. **Add API tests** - Test service layer functions

---

## Notes

The project is well-structured for testing. The existing tests follow good practices with proper mocking and async handling.