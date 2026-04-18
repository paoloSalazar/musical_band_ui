# i18n Spanish Translation Implementation Plan

## Overview
This plan outlines the implementation of Spanish (es) translation support alongside the existing English (en) website. The goal is to make the application fully bilingual, allowing users to switch between English and Spanish languages.

## Current State Analysis
Based on codebase scanning:
- **No existing i18n setup**: No internationalization libraries or configuration present
- **~200+ hardcoded strings** identified across 60+ components
- **Major areas affected**:
  - Home/Dashboard (hero content, stats, navigation)
  - Profile management (forms, dialogs, validation)
  - Events management (CRUD operations, calendar, payments)
  - Admin panels (users, roles, permissions management)
  - Login/authentication (forms, errors)
  - Shared components (loading states, confirmations, pagination)

## Required Changes

### 1. Dependencies
- Add `react-i18next` for React integration
- Add `i18next` core library
- Optional: `i18next-browser-languagedetector` for automatic language detection

### 2. Configuration Files
- `src/i18n/index.ts` - Main i18n configuration
- `src/i18n/locales/en.json` - English translations
- `src/i18n/locales/es.json` - Spanish translations

### 3. Component Updates
- Replace all hardcoded strings with `t()` function calls
- Add language switcher component
- Update form placeholders and select options
- Handle dynamic strings (pagination, counts)

### 4. Backend Data Translation
- **Event Status**: Translate status values ("PENDING" → "Pendiente", "CONFIRMED" → "Confirmado", "CANCELLED" → "Cancelado")
- **Payment Types**: Translate payment type enums ("ADVANCE" → "Pago Anticipado", "REMAINING" → "Saldo Restante", "TOTAL" → "Pago Total")
- **Roles & Permissions**: Handle dynamic translation of user-defined role/permission names and descriptions
- **User Roles**: Translate role display names (e.g., "admin" → "Administrador", "member" → "Miembro")
- **API Messages**: Ensure any user-facing messages from backend are translatable

### 5. Testing Strategy (TDD)
- **Unit Tests**: Write tests first for each i18n feature
- **Mocking**: Mock i18n functions in existing component tests
- **Integration Tests**: Test complete i18n flows
- **Coverage**: Test language switching, translation loading, backend data translation
- **Regression**: Ensure existing functionality works with i18n

## TDD Implementation Approach

Following Test-Driven Development methodology:
- **Red**: Write failing tests first
- **Green**: Implement minimal code to pass tests
- **Refactor**: Improve code while keeping tests passing
- **Iteration**: Repeat for each feature increment

## Implementation Steps (TDD-Driven)

### Phase 1: i18n Setup (TDD) (2-3 days)
**Red**: Write tests for i18n configuration and initialization
1. Test i18n library installation and basic setup
2. Test language detection and fallback
3. Test translation loading from JSON files

**Green**: Implement i18n configuration
1. Install react-i18next dependencies
2. Create i18n config with language detection
3. Set up locale file structure

**Refactor**: Optimize configuration and add error handling

### Phase 2: Translation Utilities (TDD) (2-3 days)
**Red**: Write tests for translation utilities
1. Test t() function availability in components
2. Test backend data translation utilities (status, payment types, roles)
3. Test missing translation handling

**Green**: Implement translation utilities
1. Create utility functions for backend data translation
2. Add translation keys to locale files
3. Implement fallback mechanisms

**Refactor**: Consolidate utilities and improve performance

### Phase 3: Component Translation (TDD) (4-6 days)
**Red**: Write tests for each component before translation
1. Test LoginForm component with i18n mocking
2. Test HomePage/Dashboard components
3. Test Events components (including status/payment display)
4. Test Profile components
5. Test Admin components

**Green**: Implement component translations
1. Replace hardcoded strings with t() calls
2. Update form placeholders and select options
3. Handle dynamic content interpolation

**Refactor**: Extract common translation patterns and improve component structure

### Phase 4: Language Switching (TDD) (2-3 days)
**Red**: Write tests for language switching
1. Test language selector component
2. Test language persistence in localStorage
3. Test real-time UI updates on language change

**Green**: Implement language switching
1. Create language selector component
2. Add language change handlers
3. Implement persistence and detection

**Refactor**: Optimize language switching performance

### Phase 5: Integration Testing (TDD) (2-3 days)
**Red**: Write integration tests
1. Test full i18n flow (setup → component → backend data)
2. Test error scenarios and fallbacks
3. Test with real API data

**Green**: Fix integration issues
1. Handle edge cases in translation
2. Improve error handling
3. Optimize bundle size

**Refactor**: Final cleanup and documentation

## Key Technical Decisions
- **Methodology**: TDD - Write tests first, then implement
- **Library**: Use `react-i18next` for proven React integration
- **File Structure**: Flat JSON files under `locales/` folder
- **Language Detection**: Browser language with fallback to English
- **Key Naming**: Use dot notation (e.g., `profile.name`, `events.create`)
- **Dynamic Content**: Use interpolation for counts/messages
- **Backend Data**: Create translation utilities/mappings for status, payment types, and roles
- **Fallback Strategy**: Show original backend values if translation missing, with logging for review
- **Testing**: Comprehensive TDD approach with mocked i18n in existing tests

## Testing Strategy
- **Unit Tests**: Mock `t()` function in component tests
- **Integration Tests**: Test language switching functionality
- **E2E Tests**: Verify Spanish UI works end-to-end
- **Coverage**: Test key user flows in both languages

## Dependencies and Prerequisites
- React 18+ (already present)
- Node.js package management
- Access to translation/review resources for Spanish accuracy

## Risk Assessment
- **Medium Risk**: Large number of strings to translate
- **Additional Risk**: Backend data translation complexity (status values, dynamic content)
- **TDD Risk**: Learning curve for TDD with i18n, but provides better test coverage
- **Mitigation**: Phase implementation, TDD methodology ensures quality, translation utility functions
- **Fallback**: Graceful degradation if translations missing, show original values with warning

## Success Criteria
- All hardcoded strings replaced with translatable keys
- Backend data (status, payment types, roles) properly translated
- Functional language switcher with persistence
- Complete Spanish translations for all features and backend data
- Comprehensive test suite passing (TDD approach ensures coverage)
- No regression in existing functionality
- Graceful handling of missing translations
- All tests follow TDD pattern (failing → passing → refactor)</content>
<parameter name="filePath">docs/i18n-spanish-plan.md