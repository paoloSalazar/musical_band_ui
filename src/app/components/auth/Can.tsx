/**
 * Can Component
 * Renders children only if user has the required permission
 */

import { ReactNode } from 'react';
import { useUser } from '../../contexts/UserContext';

interface CanProps {
  /**
   * Single permission required to render children
   */
  permission: string;
  
  /**
   * Children to render if user has permission
   */
  children: ReactNode;
  
  /**
   * Optional fallback component when permission is denied
   */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders its children based on user permissions
 * 
 * @example
 * ```tsx
 * <Can permission="read:users">
 *   <UsersTable />
 * </Can>
 * ```
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission } = useUser();
  
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

export default Can;
