import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rolesApi } from '../../../lib/api/rbac';
import type { Role } from '../../../lib/types';
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
  Pencil, 
  Trash2, 
  Eye,
  Loader2,
  Shield
} from 'lucide-react';
import { RoleFormDialog } from './RoleFormDialog';
import { ViewRoleDialog } from './ViewRoleDialog';
import { EditRoleDialog } from './EditRoleDialog';
import { DeleteRoleDialog } from './DeleteRoleDialog';

/**
 * Roles List Page
 * Displays all user roles in a table
 */
export function RolesListPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewRoleName, setViewRoleName] = useState<string>('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editRoleName, setEditRoleName] = useState<string>('');
  const [editRoleId, setEditRoleId] = useState<number>(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteRoleName, setDeleteRoleName] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rolesApi.list();
      setRoles(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (roleName: string) => {
    setDeleteRoleName(roleName);
    setDeleteDialogOpen(true);
  };

  const handleView = (roleName: string) => {
    setViewRoleName(roleName);
    setViewDialogOpen(true);
  };

  const handleEdit = (roleId: number, roleName: string) => {
    setEditRoleId(roleId);
    setEditRoleName(roleName);
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading roles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">Error loading roles</p>
            <p className="text-sm">{error}</p>
            <Button onClick={loadRoles} variant="outline" className="mt-4">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Roles</h2>
          <p className="text-gray-600 mt-1">
            Manage user roles and their permissions
          </p>
        </div>
        <RoleFormDialog
          onSuccess={() => {
            loadRoles();
          }}
        />
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            All Roles
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
              <p className="text-sm">Create your first role to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.id}</TableCell>
                    <TableCell>
                      <span className="font-medium">{role.name}</span>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {role.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="View"
                          onClick={() => handleView(role.name)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Edit"
                          onClick={() => handleEdit(role.id, role.name)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Delete"
                          onClick={() => handleDelete(role.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Role Dialog */}
      <ViewRoleDialog
        roleName={viewRoleName}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Edit Role Dialog */}
      <EditRoleDialog
        roleId={editRoleId}
        roleName={editRoleName}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={(role: Role) => {
          // Update the role in the list
          setRoles(prev => 
            prev.map(r => r.id === role.id ? role : r)
          );
        }}
      />

      {/* Delete Role Dialog */}
      <DeleteRoleDialog
        roleName={deleteRoleName}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => {
          // Refresh the list
          loadRoles();
        }}
      />
    </div>
  );
}
