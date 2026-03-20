import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { rolesApi } from '../../../lib/api/rbac';
import type { Role } from '../../../lib/types';
import type { ApiError } from '../../../lib/api/client';
import { Loader2, Eye, Tag, FileText, Hash } from 'lucide-react';

/**
 * View Role Dialog Props
 */
interface ViewRoleDialogProps {
  roleName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * View Role Dialog
 * Displays role details in a popup
 */
export function ViewRoleDialog({ 
  roleName, 
  open, 
  onOpenChange 
}: ViewRoleDialogProps) {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && roleName) {
      loadRole(roleName);
    } else if (!open) {
      // Reset state when dialog closes
      setRole(null);
      setError(null);
    }
  }, [open, roleName]);

  const loadRole = async (name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rolesApi.getByName(name);
      setRole(response.data);
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to load role');
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
            Role Details
          </DialogTitle>
          <DialogDescription>
            View role information
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading role...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => roleName && loadRole(roleName)} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : role ? (
          <div className="space-y-6">
            {/* Role ID */}
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Hash className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">ID</p>
                <p className="text-lg font-semibold">{role.id}</p>
              </div>
            </div>

            {/* Role Name */}
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Tag className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg font-mono font-semibold">{role.name}</p>
              </div>
            </div>

            {/* Role Description */}
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-base">
                  {role.description || <span className="italic text-gray-400">No description</span>}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
