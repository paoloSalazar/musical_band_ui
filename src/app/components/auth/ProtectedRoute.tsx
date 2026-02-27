/**
 * ProtectedRoute Component
 * Protects routes based on authentication and permissions
 */

import { ReactNode } from 'react';
import { useUser } from '../../contexts/UserContext';

interface ProtectedRouteProps {
  /**
   * Child components to render if access is granted
   */
  children: ReactNode;
  
  /**
   * Single permission required to access the route
   */
  requiredPermission?: string;
  
  /**
   * Array of permissions - user needs ALL of them
   */
  requiredPermissions?: string[];
  
  /**
   * Single role required to access the route
   */
  requiredRole?: string;
  
  /**
   * Array of roles - user needs at least one
   */
  requiredRoles?: string[];
  
  /**
   * Whether the route requires authentication (default: true)
   */
  requireAuth?: boolean;
  
  /**
   * Callback when access is denied - return null to hide content
   * Override this to implement custom redirect logic
   */
  onAccessDenied?: () => ReactNode;
}

/**
 * Component that protects routes based on authentication, roles, and permissions
 * 
 * @example
 * ```tsx
 * // Require authentication
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * // Require specific permission
 * <ProtectedRoute requiredPermission="read:users">
 *   <UsersPage />
 * </ProtectedRoute>
 * 
 * // Require specific role
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * // Require multiple permissions (AND logic)
 * <ProtectedRoute requiredPermissions={['read:users', 'write:users']}>
 *   <UsersPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requiredRole,
  requiredRoles,
  requireAuth = true,
  onAccessDenied,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission, hasRole, hasAllPermissions } = useUser();
  
  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <>{onAccessDenied?.() ?? null}</>;
  }
  
  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{onAccessDenied?.() ?? null}</>;
  }
  
  // Check multiple permissions (AND logic)
  if (requiredPermissions && !hasAllPermissions(requiredPermissions)) {
    return <>{onAccessDenied?.() ?? null}</>;
  }
  
  // Check single role
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{onAccessDenied?.() ?? null}</>;
  }
  
  // Check multiple roles (OR logic)
  if (requiredRoles) {
    const hasAnyRequiredRole = requiredRoles.some((role) => hasRole(role));
    if (!hasAnyRequiredRole) {
      return <>{onAccessDenied?.() ?? null}</>;
    }
  }
  
  return <>{children}</>;
}

export default ProtectedRoute;
