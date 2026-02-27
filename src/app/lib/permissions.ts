/**
 * Permission Constants
 * Centralized permission definitions for the application
 * Uses the format: resource:action (e.g., read:users, write:events)
 */

// User Roles
export const ROLES = {
  VISITOR: 'visitor',
  CLIENT: 'client',
  MUSICIAN: 'musician',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// User Roles Permissions
export const USER_ROLES = {
  READ: 'read:user_roles',
  WRITE: 'write:user_roles',
  DELETE: 'delete:user_roles',
} as const;

// Users Permissions
export const USERS = {
  READ: 'read:users',
  WRITE: 'write:users',
  DELETE: 'delete:users',
} as const;

// Events Permissions
export const EVENTS = {
  READ: 'read:events',
  WRITE: 'write:events',
  DELETE: 'delete:events',
} as const;

// Bookings Permissions
export const BOOKINGS = {
  READ: 'read:bookings',
  WRITE: 'write:bookings',
  DELETE: 'delete:bookings',
} as const;

// Schedule Permissions
export const SCHEDULE = {
  READ: 'read:schedule',
  WRITE: 'write:schedule',
} as const;

// Availability Permissions
export const AVAILABILITY = {
  READ: 'read:availability',
  WRITE: 'write:availability',
} as const;

// Profile Permissions
export const PROFILE = {
  READ: 'read:own_profile',
  WRITE: 'write:own_profile',
} as const;

// All permissions as an array for easy iteration
export const ALL_PERMISSIONS = [
  ...Object.values(USER_ROLES),
  ...Object.values(USERS),
  ...Object.values(EVENTS),
  ...Object.values(BOOKINGS),
  ...Object.values(SCHEDULE),
  ...Object.values(AVAILABILITY),
  ...Object.values(PROFILE),
] as const;

// Default permissions by role (for reference)
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [ROLES.VISITOR]: [],
  [ROLES.CLIENT]: [
    EVENTS.READ,
    BOOKINGS.WRITE,
    PROFILE.READ,
    PROFILE.WRITE,
  ],
  [ROLES.MUSICIAN]: [
    EVENTS.READ,
    SCHEDULE.READ,
    AVAILABILITY.WRITE,
    PROFILE.READ,
    PROFILE.WRITE,
  ],
  [ROLES.ADMIN]: [
    ...Object.values(USER_ROLES),
    ...Object.values(USERS),
    ...Object.values(EVENTS),
    ...Object.values(BOOKINGS),
    ...Object.values(SCHEDULE),
    ...Object.values(AVAILABILITY),
    ...Object.values(PROFILE),
  ],
};
