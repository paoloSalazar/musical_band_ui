/**
 * CanAny Component
 * Renders children only if user has ANY of the required permissions (OR logic)
 */

import { ReactNode } from 'react';
import { useUser } from '../../contexts/UserContext';

interface CanAnyProps {
  /**
   * Array of permissions - user needs at least one
   */
  permissions: string[];
  
  /**
   * Children to render if user has any of the permissions
   */
  children: ReactNode;
  
  /**
   * Optional fallback component when none of the permissions are granted
   */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders its children if user has ANY of the permissions
 * Uses OR logic - renders if at least one permission is present
 * 
 * @example
 * ```tsx
 * <CanAny permissions={['read:users', 'read:user_roles']}>
 *   <NavigationItem />
 * </CanAny>
 * ```
 */
export function CanAny({ permissions, children, fallback = null }: CanAnyProps) {
  const { hasAnyPermission } = useUser();
  
  if (hasAnyPermission(permissions)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

export default CanAny;