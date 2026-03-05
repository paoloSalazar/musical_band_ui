/**
 * User types for the application
 * Based on the backend /api/users/me response
 */

export interface User {
  id: number;
  name: string;
  lastname: string;
  second_lastname?: string;
  email: string;
  role: string;
  role_id: number;
  permissions: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Login request payload
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login response from the API
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * User context state
 */
export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * User context actions
 */
export interface UserActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

/**
 * Combined user context type
 */
export type UserContextType = UserState & UserActions;

// ============ RBAC Types ============

/**
 * Role type from /api/user-roles/ endpoints
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
}

/**
 * Form data for creating a role
 */
export interface RoleFormData {
  name: string;
  description?: string;
}

/**
 * Form data for creating a permission
 */
export interface PermissionFormData {
  name: string;
  description?: string;
}

/**
 * Response from permission assignment API
 */
export interface AssignPermissionResponse {
  success: boolean;
  message: string;
}
