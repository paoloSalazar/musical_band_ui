import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { rolesApi } from '../../../lib/api';
import { translateApiError, translateUserRole } from '../../../../i18n/utils';
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
  const { t } = useTranslation();
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load roles';
      setError(translateApiError(errorMessage, 'role listing'));
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
        <span className="ml-2 text-gray-600">{t('roles.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">{t('roles.error')}</p>
            <p className="text-sm">{error}</p>
            <Button onClick={loadRoles} variant="outline" className="mt-4">
              {t('roles.tryAgain')}
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
          <h2 className="text-2xl font-bold">{t('roles.title')}</h2>
          <p className="text-gray-600 mt-1">
            {t('roles.subtitle')}
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
            {t('roles.allRoles')}
          </CardTitle>
          <CardDescription>
            {t('roles.totalRoles', { count: roles.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>{t('roles.noRoles')}</p>
              <p className="text-sm">{t('roles.noRolesMessage')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('roles.table.id')}</TableHead>
                  <TableHead>{t('roles.table.name')}</TableHead>
                  <TableHead>{t('roles.table.description')}</TableHead>
                  <TableHead className="text-right">{t('roles.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.id}</TableCell>
                     <TableCell>
                       <span className="font-medium">{translateUserRole(role.name)}</span>
                     </TableCell>
                    <TableCell className="text-gray-600">
                      {role.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          title={t('roles.actions.view')}
                          onClick={() => handleView(role.name)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={t('roles.actions.edit')}
                          onClick={() => handleEdit(role.id, role.name)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={t('roles.actions.delete')}
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
