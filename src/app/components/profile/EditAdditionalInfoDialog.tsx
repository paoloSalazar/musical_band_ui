import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { profileApi } from '../../lib/api/profile';
import type { UserDetail } from '../../lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import type { ApiError } from '../../lib/api/client';
import { Loader2, Pencil } from 'lucide-react';

interface EditAdditionalInfoDialogProps {
  userId: number;
  detail: UserDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Common detail types for the dropdown
const DETAIL_TYPES = [
  { value: 'address', key: 'profile.addAdditionalInfo.detailTypes.address' },
  { value: 'address1', key: 'profile.addAdditionalInfo.detailTypes.address1' },
  { value: 'address2', key: 'profile.addAdditionalInfo.detailTypes.address2' },
  { value: 'city', key: 'profile.addAdditionalInfo.detailTypes.city' },
  { value: 'state', key: 'profile.addAdditionalInfo.detailTypes.state' },
  { value: 'country', key: 'profile.addAdditionalInfo.detailTypes.country' },
  { value: 'postal_code', key: 'profile.addAdditionalInfo.detailTypes.postal_code' },
  { value: 'phone', key: 'profile.addAdditionalInfo.detailTypes.phone' },
  { value: 'bio', key: 'profile.addAdditionalInfo.detailTypes.bio' },
  { value: 'website', key: 'profile.addAdditionalInfo.detailTypes.website' },
  { value: 'linkedin', key: 'profile.addAdditionalInfo.detailTypes.linkedin' },
  { value: 'twitter', key: 'profile.addAdditionalInfo.detailTypes.twitter' },
  { value: 'instagram', key: 'profile.addAdditionalInfo.detailTypes.instagram' },
];

export function EditAdditionalInfoDialog({
  userId,
  detail,
  open,
  onOpenChange,
  onSuccess,
}: EditAdditionalInfoDialogProps) {
  const { t } = useTranslation();
  const [detailValue, setDetailValue] = useState(detail.detail_value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      setDetailValue(detail.detail_value);
      setError(null);
    }
  }, [open, detail.detail_value]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!detailValue.trim()) {
      setError(t('profile.editAdditionalInfo.error.fillFields'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await profileApi.updateUserDetail(userId, detail.id, detailValue);

      // Close dialog
      onOpenChange(false);

      // Reload profile to get updated data
      onSuccess();
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || t('profile.editAdditionalInfo.error.failed'));
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Pencil className="mr-2 h-5 w-5" />
            {t('profile.editAdditionalInfo.title')}
          </DialogTitle>
          <DialogDescription>
            {t('profile.editAdditionalInfo.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Detail Type (read-only) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="detail_type" className="text-right">
                {t('profile.editAdditionalInfo.fields.type')}
              </Label>
              <Input
                id="detail_type"
                value={detail.detail_type}
                className="col-span-3 bg-gray-50"
                disabled
                list="detail-types-edit"
              />
              <datalist id="detail-types-edit">
                {DETAIL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {t(type.key)}
                  </option>
                ))}
              </datalist>
            </div>

            {/* Detail Value (editable) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="detail_value" className="text-right">
                {t('profile.editAdditionalInfo.fields.value')}
              </Label>
              <Input
                id="detail_value"
                value={detailValue}
                onChange={(e) => setDetailValue(e.target.value)}
                placeholder={t('profile.editAdditionalInfo.fields.valuePlaceholder')}
                className="col-span-3"
                disabled={isLoading}
                required
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
              {t('profile.editAdditionalInfo.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('profile.editAdditionalInfo.buttons.saveChanges')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditAdditionalInfoDialog;
