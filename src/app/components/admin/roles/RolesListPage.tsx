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

/**
 * Roles List Page
 * Displays all user roles in a table
 */
export function RolesListPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = async (roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    try {
      await rolesApi.delete(roleName);
      // Refresh the list
      loadRoles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete role');
    }
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
      <div className="flex items-center justify-between">
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
            <Table>
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
                        <Link to={`/admin/roles/${role.name}`}>
                          <Button variant="ghost" size="sm" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/admin/roles/${role.name}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
