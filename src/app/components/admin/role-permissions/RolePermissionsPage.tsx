import { useState, useEffect } from 'react';
import { rolesApi, permissionsApi } from '../../../lib/api/rbac';
import type { Role, Permission } from '../../../lib/types';
import type { ApiError } from '../../../lib/api/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../ui/table';
import { Button } from '../../ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../ui/card';
import { 
  Shield,
  Loader2,
  Plus,
  X,
  Settings
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';

/**
 * Role Permissions Page
 * Allows assigning/removing permissions to/from roles
 */
export function RolePermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, Permission[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load all roles
      const rolesResponse = await rolesApi.list();
      setRoles(rolesResponse.data);
      
      // Load all permissions (without pagination for role-permissions management)
      const permissionsResponse = await permissionsApi.list(0, 1000);
      setAllPermissions(permissionsResponse.data.data);
      
      // Load permissions for each role
      const permissionsMap: Record<string, Permission[]> = {};
      for (const role of rolesResponse.data) {
        try {
          const rolePermsResponse = await permissionsApi.getPermissionsForRole(role.name);
          permissionsMap[role.name] = rolePermsResponse.data;
        } catch {
          permissionsMap[role.name] = [];
        }
      }
      setRolePermissions(permissionsMap);
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const openPermissionDialog = (role: Role) => {
    setSelectedRole(role);
    // Get currently assigned permission IDs
    const currentPerms = rolePermissions[role.name] || [];
    const permIds = new Set(currentPerms.map(p => p.id));
    setSelectedPermissions(permIds);
    setDialogOpen(true);
  };

  const togglePermission = (permissionId: number) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const savePermissions = async () => {
    if (!selectedRole) return;

    try {
      setIsSaving(true);
      
      const currentPerms = rolePermissions[selectedRole.name] || [];
      const currentPermIds = new Set(currentPerms.map(p => p.id));
      const newPermIds = selectedPermissions;

      // Find permissions to add and remove
      const toAdd: number[] = [];
      const toRemove: number[] = [];
      
      newPermIds.forEach(id => {
        if (!currentPermIds.has(id)) {
          toAdd.push(id);
        }
      });
      
      currentPermIds.forEach(id => {
        if (!newPermIds.has(id)) {
          toRemove.push(id);
        }
      });

      // Get permission name for each ID
      const permMap = new Map(allPermissions.map(p => [p.id, p.name]));

      // Remove permissions first
      for (const id of toRemove) {
        const permName = permMap.get(id);
        if (permName) {
          await permissionsApi.removeFromRole(permName, selectedRole.name);
        }
      }

      // Then add permissions
      for (const id of toAdd) {
        const permName = permMap.get(id);
        if (permName) {
          await permissionsApi.assignToRole(permName, selectedRole.name);
        }
      }

      // Reload permissions for this role
      const response = await permissionsApi.getPermissionsForRole(selectedRole.name);
      setRolePermissions(prev => ({
        ...prev,
        [selectedRole.name]: response.data
      }));

      setDialogOpen(false);
    } catch (err) {
      const error = err as ApiError;
      alert(error.detail || error.message || 'Failed to save permissions');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
            <Button onClick={loadData} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role Permissions</h2>
          <p className="text-gray-600 mt-1">
            Assign and manage permissions for each role
          </p>
        </div>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Roles & Permissions
          </CardTitle>
          <CardDescription>
            Total: {roles.length} role(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No roles found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => {
                  const permissions = rolePermissions[role.name] || [];
                  return (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{role.name}</span>
                        </div>
                        {role.description && (
                          <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {permissions.length === 0 ? (
                            <span className="text-gray-400 text-sm">No permissions</span>
                          ) : (
                            permissions.slice(0, 5).map(perm => (
                              <Badge key={perm.id} variant="secondary" className="text-xs">
                                {perm.name}
                              </Badge>
                            ))
                          )}
                          {permissions.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{permissions.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPermissionDialog(role)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Permission Management Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Permissions for {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Select the permissions to assign to this role
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {allPermissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No permissions available</p>
            ) : (
              <div className="space-y-2">
                {allPermissions.map(permission => (
                  <div key={permission.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`perm-${permission.id}`}
                      checked={selectedPermissions.has(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <label
                      htmlFor={`perm-${permission.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <span className="font-mono text-sm">{permission.name}</span>
                      {permission.description && (
                        <span className="text-gray-500 text-sm ml-2">
                          - {permission.description}
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={savePermissions} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
