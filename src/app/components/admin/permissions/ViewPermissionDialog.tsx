import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { permissionsApi } from '../../../lib/api';
import type { Permission } from '../../../lib/types';
import type { ApiError } from '../../../lib/api/client';
import { Loader2, Eye, Tag, FileText, Hash } from 'lucide-react';

/**
 * View Permission Dialog Props
 */
interface ViewPermissionDialogProps {
  permissionId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * View Permission Dialog
 * Displays permission details in a popup
 */
export function ViewPermissionDialog({ 
  permissionId, 
  open, 
  onOpenChange 
}: ViewPermissionDialogProps) {
  const [permission, setPermission] = useState<Permission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && permissionId) {
      loadPermission(permissionId);
    } else if (!open) {
      // Reset state when dialog closes
      setPermission(null);
      setError(null);
    }
  }, [open, permissionId]);

  const loadPermission = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await permissionsApi.getById(id);
      setPermission(response.data);
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to load permission');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            Permission Details
          </DialogTitle>
          <DialogDescription>
            View permission information
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading permission...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => permissionId && loadPermission(permissionId)} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : permission ? (
          <div className="space-y-6">
            {/* Permission ID */}
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Hash className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">ID</p>
                <p className="text-lg font-semibold">{permission.id}</p>
              </div>
            </div>

            {/* Permission Name */}
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Tag className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg font-mono font-semibold">{permission.name}</p>
              </div>
            </div>

            {/* Permission Description */}
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-base">
                  {permission.description || <span className="italic text-gray-400">No description</span>}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
