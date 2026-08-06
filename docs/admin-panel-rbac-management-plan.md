# Admin Panel RBAC Management Plan

## Overview

This document outlines the implementation plan for the Admin Panel's Role-Based Access Control (RBAC) management interface. This panel will allow administrators to manage user roles, permissions, and role-permission assignments through a graphical interface.

## Requirements Summary

| Feature | Description |
|---------|-------------|
| **Manage User Roles** | Create, read, update, delete user roles |
| **Manage Permissions** | Create, read, update, delete permissions |
| **Assign Permissions** | Map permissions to roles (many-to-many relationship) |

---

## 1. Backend API Requirements

Before implementing the frontend, ensure these API endpoints exist:

> **Note**: The actual backend endpoints have been documented in [`docs/ADMIN_BACKEND_ENDPOINTS.md`](docs/ADMIN_BACKEND_ENDPOINTS.md). The frontend will integrate with these endpoints.

### 1.1 Role Management Endpoints

| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|---------------------|
| `GET` | `/api/user-roles/` | List all roles | `read:user_roles` |
| `GET` | `/api/user-roles/{name}` | Get role by name | `read:user_roles` |
| `POST` | `/api/user-roles/` | Create new role | `write:user_roles` |
| `PATCH` | `/api/user-roles/` | Update role (by name) | `write:user_roles` |
| `PUT` | `/api/user-roles/` | Replace role (by id) | `write:user_roles` |
| `DELETE` | `/api/user-roles/{name}` | Delete role by name | `delete:user_roles` |

### 1.2 Permission Management Endpoints

| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|---------------------|
| `GET` | `/api/permissions/` | List all permissions | Admin role |
| `GET` | `/api/permissions/{permission_id}` | Get permission by ID | Admin role |
| `POST` | `/api/permissions/` | Create new permission | Admin role |
| `PATCH` | `/api/permissions/{permission_id}` | Update permission | Admin role |
| `DELETE` | `/api/permissions/{permission_id}` | Delete permission | Admin role |

### 1.3 Role-Permission Assignment Endpoints

| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|---------------------|
| `GET` | `/api/permissions/{role_name}/permissions` | Get permissions for a role | Admin role |
| `GET` | `/api/permissions/role/{permission_name}/roles` | Get roles with a permission | Admin role |
| `POST` | `/api/permissions/roles/assign?permission_name=X&role_name=Y` | Assign permission to role | Admin role |
| `POST` | `/api/permissions/roles/remove?permission_name=X&role_name=Y` | Remove permission from role | Admin role |

### 1.4 Expected API Response Formats

#### GET /api/user-roles/ Response
```json
[
  {
    "id": 1,
    "name": "admin",
    "description": "Full system access"
  },
  {
    "id": 2,
    "name": "client",
    "description": "Customer access"
  }
]
```

#### GET /api/user-roles/{name} Response
```json
{
  "id": 1,
  "name": "admin",
  "description": "Full system access"
}
```

#### POST /api/user-roles/ Request
```json
{
  "name": "moderator",
  "description": "Moderator access"
}
```

#### GET /api/permissions/ Response
```json
[
  { "id": 1, "name": "read:user_roles", "description": "View user roles" },
  { "id": 2, "name": "write:user_roles", "description": "Manage user roles" },
  { "id": 3, "name": "read:users", "description": "View users" }
]
```

#### GET /api/permissions/{role_name}/permissions Response
```json
[
  { "id": 1, "name": "read:users", "description": "View users" },
  { "id": 2, "name": "write:users", "description": "Create/Edit users" }
]
```

#### POST /api/permissions/roles/assign Response
```json
{
  "success": true,
  "message": "Permission 'read:users' assigned to role 'admin'"
}
```

---

## 2. Frontend Type Definitions

### 2.1 New Types to Add

**File**: `src/app/lib/types.ts`

```typescript
// ============ Role Types ============

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface RoleFormData {
  name: string;
  description?: string;
}

// ============ Permission Types ============

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface PermissionFormData {
  name: string;
  description?: string;
}

// ============ API Response Types ============

export interface AssignPermissionResponse {
  success: boolean;
  message: string;
}
```

---

## 3. Page Structure

### 3.1 Route Configuration

**File**: `src/app/App.tsx` (or router config)

> **Note**: Backend uses role `name` (string) for identification, not `id`

```typescript
// New routes to add
{
  path: '/admin',
  children: [
    {
      path: '',
      element: <AdminDashboard />, // Overview
    },
    {
      path: 'roles',
      element: <RolesPage />,       // List roles
    },
    {
      path: 'roles/new',
      element: <RoleFormPage />,    // Create role
    },
    {
      path: 'roles/:name',           // Uses name, not id
      element: <RoleDetailPage />,  // View/Edit role
    },
    {
      path: 'roles/:name/edit',
      element: <RoleFormPage />,    // Edit role
    },
    {
      path: 'permissions',
      element: <PermissionsPage />,  // List permissions
    },
    {
      path: 'permissions/new',
      element: <PermissionFormPage />, // Create permission
    },
    {
      path: 'permissions/:id',
      element: <PermissionDetailPage />, // View permission
    },
    {
      path: 'permissions/:id/edit',
      element: <PermissionFormPage />, // Edit permission
    },
  ],
}
```

### 3.2 Page Hierarchy

```
/admin                     → Dashboard overview
/admin/roles              → RolesListPage (table with all roles)
/admin/roles/new          → RoleFormPage (create new role)
/admin/roles/:name       → RoleDetailPage (view role details + permissions)
/admin/roles/:name/edit  → RoleFormPage (edit existing role)
/admin/permissions        → PermissionsListPage (table with all permissions)
/admin/permissions/new    → PermissionFormPage (create new permission)
/admin/permissions/:id   → PermissionDetailPage (view permission details)
/admin/permissions/:id/edit → PermissionFormPage (edit permission)
```

---

## 4. Component Architecture

### 4.1 New Component Structure

```
src/app/components/admin/
├── AdminLayout.tsx           # Layout wrapper with sidebar
├── roles/
│   ├── RolesListPage.tsx     # Main roles table
│   ├── RoleRow.tsx            # Single row in table
│   ├── RoleFormDialog.tsx    # Create/Edit role modal
│   ├── RoleDetailPage.tsx    # Role details + permissions
│   └── RolePermissionManager.tsx  # Permission assignment component
├── permissions/
│   ├── PermissionsListPage.tsx   # Main permissions table (CRUD)
│   ├── PermissionRow.tsx          # Single row in table
│   ├── PermissionFormDialog.tsx   # Create/Edit permission modal
│   ├── PermissionDetailPage.tsx   # Permission details
│   └── PermissionCategory.tsx     # Grouped permissions display
└── shared/
    ├── PermissionCheckbox.tsx  # Individual permission checkbox
    └── PermissionSelector.tsx  # Multi-select permission picker
```

### 4.2 Component Details

#### AdminLayout
- Sidebar with navigation to Roles, Permissions
- Breadcrumb navigation
- Page title and description
- Protected by `read:user_roles` permission

#### RolesListPage
- Table with columns: Name, Description, Permissions Count, Users Count, Actions
- Search/filter functionality
- "Create Role" button
- Pagination
- Row actions: View, Edit, Delete (with confirmation)

#### RoleFormDialog (Create/Edit)
- Form fields: Name (required), Description (optional)
- Permission selector (checkbox group or multi-select)
- Form validation
- Loading states

#### RoleDetailPage
- Role information display
- Current permissions list with remove option
- "Add Permissions" button to open selector
- List of users with this role
- Edit/Delete buttons

#### PermissionsListPage (NEW - CRUD)
- Table with columns: Name, Category, Description, Actions
- Search/filter functionality
- "Create Permission" button
- Pagination
- Row actions: View, Edit, Delete (with confirmation)
- Shows which roles use each permission

#### PermissionFormDialog (NEW - CRUD)
- Form fields: Name (required), Category (required), Description (optional)
- Form validation (unique name)
- Loading states
- Category dropdown with predefined categories

#### PermissionDetailPage (NEW - CRUD)
- Permission information display
- List of roles that have this permission
- Edit/Delete buttons

#### PermissionSelector Component
- Grouped by category (Users, Events, Bookings, etc.)
- Searchable/filterable
- Checkbox list with select all/none per category
- Shows permission name and description

#### PermissionsPage (Read-only)
- Grouped display by category
- Shows permission name, description
- Read-only (no editing)
- Search/filter functionality

---

## 5. API Service Functions

**File**: `src/app/lib/api/rbac.ts` (new file)

```typescript
import { client } from './client';
import type { Role, Permission, RoleFormData, PermissionFormData } from '../types';

// ============ Role API ============
// Uses /api/user-roles/ endpoints

export const rolesApi = {
  list: async () => {
    return client.get<Role[]>('/api/user-roles/');
  },

  getByName: async (name: string) => {
    return client.get<Role>(`/api/user-roles/${name}`);
  },

  create: async (data: RoleFormData) => {
    return client.post<Role>('/api/user-roles/', data);
  },

  update: async (name: string, data: Partial<RoleFormData>) => {
    return client.patch<Role>('/api/user-roles/', { name, ...data });
  },

  replace: async (id: number, data: RoleFormData) => {
    return client.put<Role>('/api/user-roles/', { id, ...data });
  },

  delete: async (name: string) => {
    return client.delete<boolean>(`/api/user-roles/${name}`);
  },
};

// ============ Permissions API ============
// Uses /api/permissions endpoints

export const permissionsApi = {
  list: async () => {
    return client.get<Permission[]>('/api/permissions/');
  },

  get: async (id: number) => {
    return client.get<Permission>(`/api/permissions/${id}`);
  },

  create: async (data: PermissionFormData) => {
    return client.post<Permission>('/api/permissions/', data);
  },

  update: async (id: number, data: Partial<PermissionFormData>) => {
    return client.patch<Permission>(`/api/permissions/${id}`, data);
  },

  delete: async (id: number) => {
    return client.delete<boolean>(`/api/permissions/${id}`);
  },

  // Role-Permission assignment
  getPermissionsForRole: async (roleName: string) => {
    return client.get<Permission[]>(`/api/permissions/${roleName}/permissions`);
  },

  getRolesForPermission: async (permissionName: string) => {
    return client.get<Role[]>(`/api/permissions/role/${permissionName}/roles`);
  },

  assignToRole: async (permissionName: string, roleName: string) => {
    return client.post<{ success: boolean; message: string }>(
      `/api/permissions/roles/assign?permission_name=${permissionName}&role_name=${roleName}`
    );
  },

  removeFromRole: async (permissionName: string, roleName: string) => {
    return client.post<{ success: boolean; message: string }>(
      `/api/permissions/roles/remove?permission_name=${permissionName}&role_name=${roleName}`
    );
  },
};
```

---

## 6. File Structure Summary

```
src/app/
├── lib/
│   ├── api/
│   │   └── rbac.ts              # UPDATE: Add permissions CRUD API
│   ├── types.ts                 # UPDATE: Add PermissionFormData type
│   └── permissions.ts           # UPDATE: May need category groupings
├── components/
│   ├── admin/                   # NEW: Admin components
│   │   ├── AdminLayout.tsx
│   │   ├── roles/
│   │   │   ├── RolesListPage.tsx
│   │   │   ├── RoleDetailPage.tsx
│   │   │   ├── RoleFormDialog.tsx
│   │   │   └── RolePermissionManager.tsx
│   │   ├── permissions/
│   │   │   ├── PermissionsListPage.tsx    # UPDATED: CRUD operations
│   │   │   ├── PermissionRow.tsx
│   │   │   ├── PermissionFormDialog.tsx   # NEW: Create/Edit form
│   │   │   ├── PermissionDetailPage.tsx  # NEW: View details
│   │   │   └── PermissionCategory.tsx
│   │   └── shared/
│   │       ├── PermissionCheckbox.tsx
│   │       └── PermissionSelector.tsx
│   └── auth/
│       └── ProtectedRoute.tsx   # UPDATE: Add admin routes protection
└── App.tsx                      # UPDATE: Add admin routes
```

---

## 7. UI/UX Design Guidelines

### 7.1 Visual Style

- Use existing UI components from `src/app/components/ui/`
- Consistent with current design system
- Card-based layout for role and permission displays

### 7.2 Key UI Components to Use

| Component | Usage |
|-----------|-------|
| `<Card>` | Role/permission detail cards |
| `<Table>` | Roles list |
| `<Dialog>` | Create/edit role forms |
| `<Checkbox>` | Permission selection |
| `<Badge>` | Permission categories |
| `<Button>` | Actions |
| `<Input>` | Search fields |
| `<Select>` | Filters |
| `<AlertDialog>` | Delete confirmations |
| `<Tabs>` | Switch between Views |
| `<Toast>` | Success/error notifications |

### 7.3 Permission Indicators

- Use colored badges for permission categories
- Group permissions by category in displays
- Show permission count in role cards

---

## 8. Implementation Order

| Phase | Step | Task | Priority |
|-------|------|------|----------|
| **1** | 1.1 | Add Role and Permission types to `types.ts` | High |
| **1** | 1.2 | Create `rbac.ts` API service with CRUD for both | High |
| **1** | 1.3 | Add admin routes to App.tsx | High |
| **2** | 2.1 | Create AdminLayout component | High |
| **2** | 2.2 | Create RolesListPage | High |
| **2** | 2.3 | Create RoleDetailPage | Medium |
| **2** | 2.4 | Create RoleFormDialog | Medium |
| **3** | 3.1 | Create PermissionsListPage (CRUD table) | Medium |
| **3** | 3.2 | Create PermissionFormDialog | Medium |
| **3** | 3.3 | Create PermissionDetailPage | Medium |
| **4** | 4.1 | Create PermissionSelector component | Medium |
| **4** | 4.2 | Create RolePermissionManager | Medium |
| **5** | 5.1 | Add search/filter functionality | Low |
| **5** | 5.2 | Add delete confirmation dialogs | Low |
| **6** | 6.1 | Test all CRUD operations (roles & permissions) | High |
| **6** | 6.2 | Add loading and error states | Medium |

---

## 9. Dependencies

No new dependencies required. Use existing:

- React Router for routing
- Existing UI components from `src/app/components/ui/`
- Existing API client from `src/app/lib/api/client.ts`
- Existing toast/notification system

---

## 10. Next Steps After Implementation

1. **Testing**
   - Test role CRUD operations
   - Test permission assignment
   - Test that users with new roles get correct permissions

2. **Documentation**
   - Document the new admin panel usage
   - Update API documentation

3. **Future Enhancements** (optional)
   - Bulk permission assignment
   - Role cloning
   - Permission groups management
   - Audit log for role changes

---

*Document created for Musical Band UI Project - Admin Panel RBAC Management*
