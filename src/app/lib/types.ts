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
  phone_number?: string;
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
 * Permission type from /api/permissions endpoints
 */
export interface Permission {
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
 * Form data for creating a user
 */
export interface UserFormData {
  name: string;
  lastname: string;
  second_lastname?: string;
  email: string;
  phone_number?: string;
  password: string;
  role_id: number;
}

/**
 * Response from permission assignment API
 */
export interface AssignPermissionResponse {
  success: boolean;
  message: string;
}

// ============ Profile Types ============

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

// ============ Events Types ============

/**
 * Creator of an event (nested in event response)
 */
export interface EventCreator {
  user_id: number;
  name: string;
  lastname: string;
  email: string;
  phone_number?: string;
}

/**
 * Event type from /api/events/ endpoint
 */
export interface Event {
  id: number;
  name: string;
  place: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  is_all_day: boolean;
  price?: number;
  user_id: number;
  status: string;
  created_by: EventCreator;
}

/**
 * Form data for creating an event
 */
export interface EventFormData {
  name: string;
  place: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  is_all_day: boolean;
  price?: number;
}
