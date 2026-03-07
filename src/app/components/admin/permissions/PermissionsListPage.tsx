import { useState, useEffect, useCallback } from 'react';
import { permissionsApi } from '../../../lib/api';
import type { Permission } from '../../../lib/types';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '../../ui/pagination';
import { 
  Pencil, 
  Trash2, 
  Eye,
  Loader2,
  Lock
} from 'lucide-react';
import { PermissionFormDialog } from './PermissionFormDialog';
import { ViewPermissionDialog } from './ViewPermissionDialog';
import { EditPermissionDialog } from './EditPermissionDialog';
import { DeletePermissionDialog } from './DeletePermissionDialog';

/**
 * Permissions List Page
 * Displays all permissions in a table
 */
export function PermissionsListPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [skip, setSkip] = useState(0);
  const limit = 8;
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const [viewPermissionId, setViewPermissionId] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editPermissionId, setEditPermissionId] = useState<number | null>(null);
  const [editPermissionName, setEditPermissionName] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deletePermissionId, setDeletePermissionId] = useState<number | null>(null);
  const [deletePermissionName, setDeletePermissionName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, [skip]);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await permissionsApi.list(skip, limit);
      // Response structure: { data: Permission[], total: number, skip: number, limit: number }
      const paginatedData = response.data;
      setPermissions(paginatedData.data);
      
      // Check if there are more results
      setHasMore(paginatedData.data.length === limit);
      
      // Update total count
      setTotal(paginatedData.total);
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPage = useCallback(() => {
    setSkip(prev => Math.max(0, prev - limit));
  }, []);

  const handleNextPage = useCallback(() => {
    setSkip(prev => prev + limit);
  }, []);

  const handleDelete = (permissionId: number, permissionName: string) => {
    setDeletePermissionId(permissionId);
    setDeletePermissionName(permissionName);
    setDeleteDialogOpen(true);
  };

  const handleView = (permissionId: number) => {
    setViewPermissionId(permissionId);
    setViewDialogOpen(true);
  };

  const handleEdit = (permissionId: number, permissionName: string) => {
    setEditPermissionId(permissionId);
    setEditPermissionName(permissionName);
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading permissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">Error loading permissions</p>
            <p className="text-sm">{error}</p>
            <Button onClick={loadPermissions} variant="outline" className="mt-4">
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
          <h2 className="text-2xl font-bold">Permissions</h2>
          <p className="text-gray-600 mt-1">
            Manage system permissions
          </p>
        </div>
        <PermissionFormDialog
          onSuccess={() => {
            loadPermissions();
          }}
        />
      </div>

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5" />
            All Permissions
          </CardTitle>
          <CardDescription>
            Showing {permissions.length} of {total} permission(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No permissions found</p>
              <p className="text-sm">Create your first permission to get started</p>
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
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">{permission.id}</TableCell>
                    <TableCell>
                      <span className="font-medium font-mono text-sm">{permission.name}</span>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {permission.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="View"
                          onClick={() => handleView(permission.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Edit"
                          onClick={() => handleEdit(permission.id, permission.name)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Delete"
                          onClick={() => handleDelete(permission.id, permission.name)}
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

      {/* Pagination */}
      {permissions.length > 0 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={handlePreviousPage}
                  className={skip === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 text-sm text-gray-600">
                  Page {Math.floor(skip / limit) + 1}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  onClick={handleNextPage}
                  className={!hasMore ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* View Permission Dialog */}
      <ViewPermissionDialog
        permissionId={viewPermissionId}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Edit Permission Dialog */}
      <EditPermissionDialog
        permissionId={editPermissionId}
        permissionName={editPermissionName}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={(permission: Permission) => {
          // Update the permission in the list
          setPermissions(prev => 
            prev.map(p => p.id === permission.id ? permission : p)
          );
        }}
      />

      {/* Delete Permission Dialog */}
      <DeletePermissionDialog
        permissionId={deletePermissionId!}
        permissionName={deletePermissionName}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => {
          // Refresh the list
          loadPermissions();
        }}
      />
    </div>
  );
}
