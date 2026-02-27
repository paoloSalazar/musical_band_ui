# Admin Panel Role-Based Rendering Plan

## Overview

This document outlines the implementation plan for adding role-based access control (RBAC) to the Musical Band UI application. The system will render pages and components based on user roles and permissions fetched from the backend.

## Backend API

The backend provides user information through the `/api/users/me` endpoint, which returns:

```json
{
  "id": 1,
  "name": "username",
  "lastname": "userlastname",
  "second_lastname": "usersecondlastname",
  "email": "name.lastname@example.com",
  "role": "admin",
  "role_id": 1,
  "permissions": [
    "read:user_roles",
    "write:user_roles",
    "delete:user_roles",
    "read:users",
    "write:users",
    "delete:users",
    "read:events"
  ]
}
```

---

## Answers to Key Questions

### Is it good practice to get this data from backend?

**Yes, absolutely.** Getting user data from the backend is the recommended approach because:

| Benefit | Description |
|---------|-------------|
| **Security** | Permissions are validated server-side and cannot be manipulated by users |
| **Single Source of Truth** | All permission logic lives in one place |
| **Real-time Updates** | If permissions change, they take effect immediately without code changes |
| **Scalability** | Easy to manage permissions for thousands of users |
| **Audit Trail** | Backend can log access attempts |

---

## Implementation Plan

### Phase 1: User Context & API Integration

#### 1.1 Create UserContext

- **File**: `src/app/contexts/UserContext.tsx`
- **Purpose**: Store user data globally after login
- **Contains**: user info, role, permissions, loading state, logout function

#### 1.2 Integrate `/api/users/me`

- After successful login, call the endpoint to fetch user data
- Store the response in UserContext
- Make user data available throughout the application

#### 1.3 Create `useUser` Hook

- **File**: `src/app/hooks/useUser.ts`
- **Purpose**: Easy access to user data from any component
- **Exports**: user, isLoading, hasPermission, hasRole, isAuthenticated

---

### Phase 2: Permission System

#### 2.1 Define Role Constants

- **File**: `src/app/lib/roles.ts`
- **Roles**:
  - `VISITOR` - Unauthenticated users
  - `CLIENT` - Customers booking services
  - `MUSICIAN` - Band members
  - `ADMIN` - Full system access

#### 2.2 Define Permission Constants

- **File**: `src/app/lib/permissions.ts`
- Use consistent naming: `resource:action` (e.g., `read:users`, `write:events`)

#### 2.3 Create Permission Utilities

- **File**: `src/app/lib/auth-utils.ts`
- **Functions**:
  - `hasPermission(permission: string): boolean` - Check single permission
  - `hasRole(role: string): boolean` - Check user role
  - `hasAnyPermission(permissions: string[]): boolean` - OR logic
  - `hasAllPermissions(permissions: string[]): boolean` - AND logic

---

### Phase 3: Reusable Components

#### 3.1 `<Can>` Component

Conditional rendering based on permissions:

```tsx
<Can permission="read:users">
  <UsersTable />
</Can>
```

#### 3.2 `<CanRole>` Component

Conditional rendering based on roles:

```tsx
<CanRole roles={['admin', 'musician']}>
  <AdminPanel />
</CanRole>
```

#### 3.3 `<CanAny>` Component

Multiple permissions (OR logic):

```tsx
<CanAny permissions={['read:users', 'read:user_roles']}>
  <NavigationItem />
</CanAny>
```

#### 3.4 `<ProtectedRoute>` Component

Route-level protection:

```tsx
<ProtectedRoute requiredPermission="read:users">
  <UsersPage />
</ProtectedRoute>
```

---

### Phase 4: Apply to Pages & Components

#### 4.1 Sidebar/Navigation

- Show/hide menu items based on role and permissions
- Example:
  - **Visitor**: Home only
  - **Client**: Home, Events, Book Services
  - **Musician**: Home, Events, Schedule, Profile
  - **Admin**: All pages

#### 4.2 Page Routes

- Protect each route with appropriate permission requirements
- Redirect unauthorized users to appropriate page

#### 4.3 Buttons & Actions

- Show/hide edit, delete, create buttons based on permissions
- Example: Delete button only visible with `delete:users` permission

---

## Suggested Role Permissions Mapping

| Role | Permissions |
|------|-------------|
| **visitor** | No authenticated access (public pages only) |
| **client** | `read:events`, `write:bookings`, `read:own_profile`, `write:own_profile` |
| **musician** | `read:events`, `read:schedule`, `write:availability`, `read:own_profile`, `write:own_profile` |
| **admin** | Full access: all `read:*`, `write:*`, `delete:*` permissions |

---

## File Structure

```
src/app/
├── contexts/
│   └── UserContext.tsx          # Global user state
├── hooks/
│   └── useUser.ts               # User access hook
├── lib/
│   ├── roles.ts                 # Role constants
│   ├── permissions.ts           # Permission constants
│   └── auth-utils.ts            # Permission check functions
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx  # Route wrapper
│   │   ├── Can.tsx              # Permission component
│   │   └── CanRole.tsx          # Role component
│   └── ui/
│       └── PermissionButton.tsx # Button wrapper
└── pages/
    └── (protected routes)
```

---

## Data Flow

```
1. User logs in → API returns token
2. App calls GET /api/users/me with token
3. Backend returns user data with role and permissions
4. UserContext stores the data
5. All components can now check permissions
6. UI renders based on user's role and permissions
```

---

## Implementation Order

| Step | Task | Priority |
|------|------|----------|
| 1 | Create UserContext | High |
| 2 | Add API endpoint call for /api/users/me | High |
| 3 | Create permission utilities | High |
| 4 | Create `<Can>` component | High |
| 5 | Create `<ProtectedRoute>` | High |
| 6 | Update router with protected routes | Medium |
| 7 | Update sidebar navigation | Medium |
| 8 | Add button-level protection | Low |

---

## Next Steps

1. Implement UserContext with `/api/users/me` integration
2. Create permission utilities and reusable components
3. Apply protection to existing pages and navigation
4. Test role-based rendering for each role type

---

*Document created for Musical Band UI Project*
