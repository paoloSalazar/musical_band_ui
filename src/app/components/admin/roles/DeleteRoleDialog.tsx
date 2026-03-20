import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { rolesApi } from '../../../lib/api/rbac';
import type { ApiError } from '../../../lib/api/client';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

/**
 * Delete Role Dialog Props
 */
interface DeleteRoleDialogProps {
  roleName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Delete Role Dialog
 * Shows confirmation dialog and handles delete
 */
export function DeleteRoleDialog({ 
  roleName,
  open, 
  onOpenChange,
  onSuccess
}: DeleteRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);
      
      // Use name for delete endpoint
      await rolesApi.delete(roleName);
      
      // Close dialog and call success callback
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const apiError = err as ApiError;
      // Show the error message from the API response
      setError(apiError.detail || apiError.message || 'Failed to delete role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <Trash2 className="mr-2 h-5 w-5" />
            Delete Role
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this role? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p>You are about to delete the role:</p>
              <p className="font-medium text-gray-900 mt-1">{roleName}</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
