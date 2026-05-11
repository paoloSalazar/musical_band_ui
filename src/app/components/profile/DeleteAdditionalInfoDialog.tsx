import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      alert(error.detail || error.message || t('profile.deleteAdditionalInfo.error.failed'));
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
            {t('profile.deleteAdditionalInfo.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('profile.deleteAdditionalInfo.description', { detailType: detail.detail_type })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('profile.deleteAdditionalInfo.buttons.cancel')}
          </AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('profile.deleteAdditionalInfo.buttons.delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteAdditionalInfoDialog;
