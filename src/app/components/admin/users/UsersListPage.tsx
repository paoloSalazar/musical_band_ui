import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError, translateUserRole, capitalizeFirstLetter } from '../../../../i18n/utils';
import { usersApi } from '../../../lib/api';
import type { User } from '../../../lib/types';
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
  User as UserIcon
} from 'lucide-react';
import { UserFormDialog } from './UserFormDialog';
import { ViewUserDialog } from './ViewUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { DeleteUserDialog } from './DeleteUserDialog';

/**
 * Users List Page
 * Displays all users in a table
 */
export function UsersListPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  // Dialog states
  const [viewUserId, setViewUserId] = useState<number>(0);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number>(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number>(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await usersApi.list(currentPage * pageSize, pageSize);
      setUsers(response.data.data);
      setTotal(response.data.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(translateApiError(errorMessage, 'user listing'));
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const handleDelete = (userId: number) => {
    setDeleteUserId(userId);
    setDeleteDialogOpen(true);
  };

  const handleView = (userId: number) => {
    setViewUserId(userId);
    setViewDialogOpen(true);
  };

  const handleEdit = (userId: number) => {
    setEditUserId(userId);
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">{t('users.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">{t('users.error')}</p>
            <p className="text-sm">{error}</p>
            <Button onClick={loadUsers} variant="outline" className="mt-4">
              {t('users.tryAgain')}
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
          <h2 className="text-2xl font-bold">{t('users.title')}</h2>
          <p className="text-gray-600 mt-1">
            {t('users.subtitle')}
          </p>
        </div>
        <UserFormDialog
          onSuccess={() => {
            loadUsers();
          }}
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserIcon className="mr-2 h-5 w-5" />
            {t('users.allUsers')}
          </CardTitle>
          <CardDescription>
            {t('users.totalUsers', { count: total })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>{t('users.noUsers')}</p>
              <p className="text-sm">{t('users.noUsersMessage')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('users.table.id')}</TableHead>
                      <TableHead>{t('users.table.name')}</TableHead>
                      <TableHead>{t('users.table.lastName')}</TableHead>
                      <TableHead>{t('users.table.phoneNumber')}</TableHead>
                      <TableHead>{t('users.table.email')}</TableHead>
                      <TableHead>{t('users.table.role')}</TableHead>
                      <TableHead className="text-right">{t('users.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>
                          <span className="font-medium">{capitalizeFirstLetter(user.name)}</span>
                          {user.second_lastname && (
                            <span className="text-gray-500"> {capitalizeFirstLetter(user.second_lastname)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {capitalizeFirstLetter(user.lastname)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {user.phone_number || '-'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {translateUserRole(user.role)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              title={t('users.actions.view')}
                              onClick={() => handleView(user.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title={t('users.actions.edit')}
                              onClick={() => handleEdit(user.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title={t('users.actions.delete')}
                              onClick={() => handleDelete(user.id)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    {t('users.pagination.showing', {
                      from: currentPage * pageSize + 1,
                      to: Math.min((currentPage + 1) * pageSize, total),
                      total: total
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    >
                      {t('users.pagination.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                    >
                      {t('users.pagination.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <ViewUserDialog
        userId={viewUserId}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        userId={editUserId}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          // Reload the list to get updated role name
          loadUsers();
        }}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        userId={deleteUserId}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => {
          // Refresh the list
          loadUsers();
        }}
      />
    </div>
  );
}
