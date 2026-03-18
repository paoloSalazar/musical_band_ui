import { useState } from 'react';
import { profileApi } from '../../lib/api/profile';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import type { UserDetail } from '../../lib/types';
import type { ApiError } from '../../lib/api/client';
import { Loader2, Trash2 } from 'lucide-react';

interface DeleteAdditionalInfoDialogProps {
  userId: number;
  detail: UserDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteAdditionalInfoDialog({
  userId,
  detail,
  open,
  onOpenChange,
  onSuccess,
}: DeleteAdditionalInfoDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      await profileApi.deleteUserDetail(userId, detail.id);

      // Close dialog
      onOpenChange(false);

      // Reload profile to get updated data
      onSuccess();
    } catch (err) {
      const error = err as ApiError;
      // Show error via alert since this is an alert dialog
      alert(error.detail || error.message || 'Failed to delete additional info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsLoading(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <Trash2 className="mr-2 h-5 w-5 text-red-500" />
            Delete Additional Information
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the "{detail.detail_type}" information?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteAdditionalInfoDialog;
