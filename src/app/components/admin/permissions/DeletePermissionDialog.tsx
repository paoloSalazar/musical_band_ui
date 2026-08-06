import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../../i18n/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { permissionsApi } from '../../../lib/api';
import type { ApiError } from '../../../lib/api/client';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

/**
 * Delete Permission Dialog Props
 */
interface DeletePermissionDialogProps {
  permissionId: number;
  permissionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Delete Permission Dialog
 * Shows confirmation dialog and handles delete via name endpoint
 */
export function DeletePermissionDialog({
  permissionId,
  permissionName,
  open,
  onOpenChange,
  onSuccess
}: DeletePermissionDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);
      
      // Use name for delete endpoint
      await permissionsApi.deleteByName(permissionName);
      
      // Close dialog and call success callback
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const apiError = err as ApiError;
      const rawErrorMessage = apiError.detail || apiError.message;
      setError(rawErrorMessage ? translateApiError(rawErrorMessage, 'permission deletion') : t('permissions.dialog.delete.failedToDelete'));
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
            {t('permissions.dialog.delete.title')}
          </DialogTitle>
          <DialogDescription>
            {t('permissions.dialog.delete.description')}
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
              <p>{t('permissions.dialog.delete.confirmationText')}</p>
              <p className="font-mono font-medium text-gray-900 mt-1">{permissionName}</p>
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
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('permissions.actions.delete')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
