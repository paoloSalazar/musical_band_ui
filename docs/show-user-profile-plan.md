# Show User Profile Feature - Implementation Plan

## 1. Overview

This document outlines the implementation plan for displaying user profile information in the musical band UI application. The profile is accessible from the HomePage and shows information fetched from two API endpoints.

### 1.1 Requirements Summary

- **Endpoint 1**: `GET {{api}}/users/me` - Returns basic user info (id, name, lastname, second_lastname, email, role, permissions)
- **Endpoint 2**: `GET {{api}}/users/{id}/details` - Returns additional user details as an array of objects with (user_id, detail_type, detail_value, id)
- **Access**: Available for all authenticated users (not just admins)
- **Initial Scope**: View-only (update functionality to be planned later)

---

## 2. Component Structure

### 2.1 File Location

All profile-related files are located in:

```
src/app/components/profile/
```

### 2.2 Component Hierarchy

```
src/app/components/
├── profile/
│   ├── ProfilePage.tsx         # Standalone page component (IMPLEMENTED)
│   ├── UserProfileDialog.tsx   # Dialog component (not used)
│   └── index.ts                # Export barrel (not needed)
```

### 2.3 Component Responsibilities

#### [`ProfilePage.tsx`](src/app/components/profile/ProfilePage.tsx)
- **Purpose**: Main profile display page
- **Type**: Standalone page component
- **Responsibilities**:
  - Fetch user data from both API endpoints
  - Display basic user information (from `/users/me`)
  - Display additional details (from `/users/{id}/details`)
  - Handle loading and error states with retry option
  - Organize information in a clean, readable layout with sections

---

## 3. Data Fetching Strategy

### 3.1 API Service Layer

#### File: [`src/app/lib/api/profile.ts`](src/app/lib/api/profile.ts) - IMPLEMENTED

```typescript
export const profileApi = {
  /**
   * Get current user's basic info
   * GET /api/users/me
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiClient.get<User>('/users/me');
  },

  /**
   * Get user's additional details
   * GET /api/users/{id}/details
   */
  getUserDetails: async (id: number): Promise<ApiResponse<UserDetail[]>> => {
    return apiClient.get<UserDetail[]>(`/users/${id}/details`);
  },

  /**
   * Get current user profile with all details
   * Uses Promise.all for parallel fetching
   */
  getCurrentUserWithDetails: async (): Promise<ApiResponse<UserProfileWithDetails>> => {
    // First get the current user
    const userResponse = await apiClient.get<User>('/users/me');
    
    if (!userResponse.data) {
      return {
        data: { user: {} as User, details: [] },
        success: false,
        message: 'Failed to fetch user',
      };
    }

    // Then get the user details
    const detailsResponse = await apiClient.get<UserDetail[]>(`/users/${userResponse.data.id}/details`);

    // Combine the results
    const combined: UserProfileWithDetails = {
      user: userResponse.data,
      details: detailsResponse.data || [],
    };

    return {
      data: combined,
      success: true,
    };
  },
};
```

### 3.2 Data Fetching Approach

**Implemented: Sequential with combination**
- Fetch basic info first (need user ID for details)
- Then fetch additional details
- Combine results for cleaner component data

### 3.3 Loading State Strategy

- Show loading spinner while fetching
- Use existing `Loader2` component from lucide-react
- Display error message with retry button on failure

---

## 4. Types Needed

### 4.1 Type Definitions

Added to [`src/app/lib/types.ts`](src/app/lib/types.ts):

```typescript
/**
 * User detail from /api/users/{id}/details endpoint
 */
export interface UserDetail {
  id: number;
  user_id: number;
  detail_type: string;
  detail_value: string;
}

/**
 * User profile with additional details
 */
export interface UserProfileWithDetails {
  user: User;
  details: UserDetail[];
}
```

### 4.2 Existing Types to Reuse

- Reuse `ApiResponse<T>` from [`src/app/lib/api/client.ts`](src/app/lib/api/client.ts:8)
- Reuse existing `User` type from [`src/app/lib/types.ts`](src/app/lib/types.ts)

---

## 5. Navigation/Routing Considerations

### 5.1 Route Added

**File Modified**: [`src/app/App.tsx`](src/app/App.tsx)

```typescript
// Profile Page - Available to all authenticated users
<Route path="/profile" element={<ProfilePage />} />
```

### 5.2 HomePage Integration

The profile is accessible from the HomePage via a "My Profile" button.

**File Modified**: [`src/app/components/home/HomePage.tsx`](src/app/components/home/HomePage.tsx)

**Changes**:
1. Import `Link` from react-router-dom
2. Added "My Profile" button with Link to `/profile`

```jsx
<Link to="/profile">
  <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
    <User className="h-4 w-4 mr-2" />
    My Profile
  </Button>
</Link>
```

---

## 6. UI/UX Approach

### 6.1 Layout Design

**Profile Page Layout**:

```
┌─────────────────────────────────────────────────────┐
│ ← Back to Home                                      │
│                                                     │
│ ┌───────────────────────────────────────────────┐  │
│ │  My Profile                                    │  │
│ │                                               │  │
│ │  ┌──────┐                                      │  │
│ │  │ Avatar│  John Doe                          │  │
│ │  │      │  ID: 1                              │  │
│ │  └──────┘                                      │  │
│ │─────────────────────────────────────────────────│  │
│ │                                                     │
│ │  Contact Information                               │
│ │  ┌─────────────┬────────────────────────────┐    │  │
│ │  │ 📧 Email    │ john@example.com           │    │  │
│ │  │ 📱 Phone   │ +1 234 567 8900            │    │  │
│ │  │ 🛡️ Role    │ admin                      │    │  │
│ │  │ 📅 Member  │ January 15, 2024           │    │  │
│ │  └─────────────┴────────────────────────────┘    │  │
│ │                                                     │
│ │  ─────────────────────────────────────────────    │
│ │                                                     │
│ │  Additional Information                            │
│ │  ┌─────────────┬────────────────────────────┐    │  │
│ │  │ 📍 Address | Cochabamba, Bolivia         │    │  │
│ │  └─────────────┴────────────────────────────┘    │  │
│ │                                                     │
│ │  ─────────────────────────────────────────────    │  │
│ │                                                     │
│ │  My Permissions                                    │
│ │  [read:user_roles] [write:user_roles] [read:users]│  │
│ │                                                     │
│ └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 6.2 Component Design Patterns

**Followed existing patterns from**:
- [`ViewUserDialog.tsx`](src/app/components/admin/users/ViewUserDialog.tsx) - Display structure and loading states
- Other list pages - Layout and section organization

### 6.3 Visual Elements

| Element | Component | Source |
|---------|------------|--------|
| User avatar/icon | `lucide-react User` | lucide-react |
| Section headers | Typography | Tailwind classes |
| Permission badges | Custom span with Tailwind | Tailwind |
| Details list | Custom grid layout | Tailwind |
| Loading state | `Loader2` spinner | lucide-react |
| Error state | Inline error message with retry | Custom |
| Back navigation | ArrowLeft icon + Link | lucide-react + react-router |

### 6.4 Responsive Design

- Max width: `max-w-4xl mx-auto`
- Grid layout for details: `grid-cols-1 md:grid-cols-2`
- Stack details vertically on mobile

---

## 7. Implementation Tasks

### Phase 1: Types and API Layer ✅

| # | Task | Status | File |
|---|------|--------|------|
| 1.1 | Add UserDetail, UserProfileWithDetails types to types.ts | ✅ Done | `src/app/lib/types.ts` |
| 1.2 | Create profile API service | ✅ Done | `src/app/lib/api/profile.ts` |
| 1.3 | Export from api/index.ts | ✅ Done | `src/app/lib/api/index.ts` |

### Phase 2: Profile Page Component ✅

| # | Task | Status | File |
|---|------|--------|------|
| 2.1 | Create ProfilePage component | ✅ Done | `src/app/components/profile/ProfilePage.tsx` |
| 2.2 | Add loading spinner states | ✅ Done | (in component) |
| 2.3 | Handle error states with retry | ✅ Done | (in component) |

### Phase 3: Route and HomePage Integration ✅

| # | Task | Status | File |
|---|------|--------|------|
| 3.1 | Add /profile route to App.tsx | ✅ Done | `src/app/App.tsx` |
| 3.2 | Add "My Profile" button to HomePage | ✅ Done | `src/app/components/home/HomePage.tsx` |

---

## 8. Edge Cases and Error Handling

### 8.1 Network Errors ✅

- Show user-friendly error message
- Include "Retry" button option ✅ Implemented

### 8.2 Missing Data ✅

- Handle missing `second_lastname` (optional field) ✅
- Handle empty `permissions` array ✅
- Handle empty `details` array ✅
- Handle missing optional fields gracefully ✅

### 8.3 Authentication ✅

- The component uses profileApi which includes auth token automatically
- User must be authenticated to access (ProtectedRoute logic in App.tsx)

---

## 9. Future Enhancements (Out of Scope)

These items are noted for future planning but NOT in the initial implementation:

- [ ] Profile update functionality (edit mode)
- [x] Profile page (standalone route) - DONE
- [ ] Profile picture upload
- [ ] Password change
- [ ] Activity log/history

---

## 10. Testing Considerations

### 10.1 Manual Testing Checklist

- [ ] View profile as admin user
- [ ] View profile as regular user
- [x] Verify loading state displays
- [x] Verify error state displays on API failure
- [x] Verify page navigation works
- [ ] Test on mobile viewport

### 10.2 Test Data Requirements

- User with all fields populated
- User with optional fields empty
- User with many permissions
- User with no additional details

---

## 11. Dependencies

### 11.1 Existing Dependencies

- React Router (for routing to /profile)
- shadcn/ui components (Card, Dialog, Button, Badge)
- lucide-react (icons: User, Mail, Phone, Shield, MapPin, ArrowLeft, Loader2)
- Tailwind CSS

### 11.2 No New Dependencies Required

All functionality was achieved with existing dependencies.

---

## 12. Summary

The "Show User Profile" feature has been implemented as a standalone page accessible at `/profile`. The implementation:

1. **Leverages existing patterns** - Follows established component and API patterns
2. **Minimal new code** - Reuses existing UI components and utilities
3. **Simple integration** - Adds profile access from HomePage via Link to `/profile` route
4. **Scalable foundation** - Types and API layer support future enhancements

The profile feature is accessible to all authenticated users and provides a clean, informative display of their account information and additional details.

---

## 13. Files Created/Modified

### Created
- [`src/app/lib/api/profile.ts`](src/app/lib/api/profile.ts) - API service
- [`src/app/components/profile/ProfilePage.tsx`](src/app/components/profile/ProfilePage.tsx) - Profile page component

### Modified
- [`src/app/lib/types.ts`](src/app/lib/types.ts) - Added UserDetail and UserProfileWithDetails types
- [`src/app/lib/api/index.ts`](src/app/lib/api/index.ts) - Added profileApi export
- [`src/app/App.tsx`](src/app/App.tsx) - Added /profile route
- [`src/app/components/home/HomePage.tsx`](src/app/components/home/HomePage.tsx) - Added "My Profile" button

### Not Used (kept for potential future use)
- [`src/app/components/profile/UserProfileDialog.tsx`](src/app/components/profile/UserProfileDialog.tsx) - Dialog version (not integrated)
