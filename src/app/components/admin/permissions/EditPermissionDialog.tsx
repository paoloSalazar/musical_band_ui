import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { permissionsApi } from '../../../lib/api';
import type { Permission } from '../../../lib/types';
import type { ApiError } from '../../../lib/api/client';
import { Loader2, Pencil } from 'lucide-react';

/**
 * Edit Permission Dialog Props
 */
interface EditPermissionDialogProps {
  permissionId: number | null;
  permissionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (permission: Permission) => void;
}

/**
 * Edit Permission Dialog
 * Allows editing permission name and description via PATCH endpoint
 */
export function EditPermissionDialog({
  permissionId,
  permissionName,
  open,
  onOpenChange,
  onSuccess
}: EditPermissionDialogProps) {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch permission data when dialog opens
  useEffect(() => {
    if (open && permissionId) {
      loadPermission(permissionId);
    } else if (!open) {
      // Reset state when dialog closes
      setDescription('');
      setName('');
      setError(null);
    }
  }, [open, permissionId]);

  const loadPermission = async (id: number) => {
    try {
      setIsFetching(true);
      setError(null);
      const response = await permissionsApi.getById(id);
      setDescription(response.data.description || '');
      setName(response.data.name || '');
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to load permission');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!permissionId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await permissionsApi.update(permissionId, { 
        description: description.trim() 
      });
      
      // Close dialog and reset form
      onOpenChange(false);
      setDescription('');
      setName('');
      
      // Call success callback
      onSuccess(response.data);
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to update permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setDescription('');
      setName('');
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
            {t('permissions.form.edit.title')}
          </DialogTitle>
          <DialogDescription>
            {t('permissions.form.edit.description')}
          </DialogDescription>
        </DialogHeader>
        
        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">{t('permissions.form.loadingPermission')}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              {/* Permission Name (read-only) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t('permissions.form.fields.name')}
                </Label>
                <Input
                  id="name"
                  value={name}
                  className="col-span-3 bg-gray-50"
                  disabled
                />
              </div>

              {/* Permission Description (editable) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  {t('permissions.form.fields.description')}
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('permissions.form.fields.descriptionPlaceholder')}
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
                {t('permissions.form.buttons.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('permissions.form.buttons.saveChanges')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
