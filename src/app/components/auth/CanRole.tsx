/**
 * CanRole Component
 * Renders children only if user has one of the required roles
 */

import { ReactNode } from 'react';
import { useUser } from '../../contexts/UserContext';

interface CanRoleProps {
  /**
   * Single role or array of roles required to render children
   */
  roles: string | string[];
  
  /**
   * Children to render if user has the required role
   */
  children: ReactNode;
  
  /**
   * Optional fallback component when role check fails
   */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders its children based on user roles
 * 
 * @example
 * ```tsx
 * // Single role
 * <CanRole roles="admin">
 *   <AdminPanel />
 * </CanRole>
 * 
 * // Multiple roles (OR logic)
 * <CanRole roles={['admin', 'musician']}>
 *   <Dashboard />
 * </CanRole>
 * ```
 */
export function CanRole({ roles, children, fallback = null }: CanRoleProps) {
  const { hasRole } = useUser();
  
  // Convert single role to array for consistent handling
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  // Check if user has any of the required roles
  const hasRequiredRole = roleArray.some((role) => hasRole(role));
  
  if (hasRequiredRole) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

export default CanRole;
