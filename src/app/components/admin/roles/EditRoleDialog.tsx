import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { rolesApi } from '../../../lib/api/rbac';
import type { Role } from '../../../lib/types';
import type { ApiError } from '../../../lib/api/client';
import { Loader2, Pencil } from 'lucide-react';

/**
 * Edit Role Dialog Props
 */
interface EditRoleDialogProps {
  roleId: number;
  roleName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (role: Role) => void;
}

/**
 * Edit Role Dialog
 * Allows editing role description via PATCH endpoint
 */
export function EditRoleDialog({ 
  roleId,
  roleName,
  open, 
  onOpenChange,
  onSuccess
}: EditRoleDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch role data when dialog opens
  useEffect(() => {
    if (open && roleName) {
      loadRole(roleName);
    } else if (!open) {
      // Reset state when dialog closes
      setDescription('');
      setError(null);
    }
  }, [open, roleName]);

  const loadRole = async (name: string) => {
    try {
      setIsFetching(true);
      setError(null);
      const response = await rolesApi.getByName(name);
      setDescription(response.data.description || '');
      setName(response.data.name || '');
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to load role');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await rolesApi.update(roleId, { 
        name: name,
        description: description.trim() 
      });
      
      // Close dialog and reset form
      onOpenChange(false);
      setDescription('');
      
      // Call success callback
      onSuccess(response.data);
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setDescription('');
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Pencil className="mr-2 h-5 w-5" />
            Edit Role
          </DialogTitle>
          <DialogDescription>
            Update the role details below.
          </DialogDescription>
        </DialogHeader>
        
        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading role...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              {/* Role Name (read-only) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  className="col-span-3 bg-gray-50"
                  disabled
                />
              </div>
              
              {/* Role Description (editable) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  className="col-span-3"
                  disabled={isLoading}
                />
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
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
