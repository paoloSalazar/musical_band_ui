import { useState, useEffect } from 'react';
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
  { value: 'address', label: 'Address' },
  { value: 'address1', label: 'Address Line 1' },
  { value: 'address2', label: 'Address Line 2' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State/Province' },
  { value: 'country', label: 'Country' },
  { value: 'postal_code', label: 'Postal Code' },
  { value: 'phone', label: 'Phone' },
  { value: 'bio', label: 'Biography' },
  { value: 'website', label: 'Website' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'instagram', label: 'Instagram' },
];

export function EditAdditionalInfoDialog({
  userId,
  detail,
  open,
  onOpenChange,
  onSuccess,
}: EditAdditionalInfoDialogProps) {
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
      setError('Please enter a value');
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
      setError(error.detail || error.message || 'Failed to update additional info');
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
            Edit Additional Information
          </DialogTitle>
          <DialogDescription>
            Update the additional information for your profile.
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
                Type
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
                    {type.label}
                  </option>
                ))}
              </datalist>
            </div>

            {/* Detail Value (editable) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="detail_value" className="text-right">
                Value
              </Label>
              <Input
                id="detail_value"
                value={detailValue}
                onChange={(e) => setDetailValue(e.target.value)}
                placeholder="Enter the value"
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
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditAdditionalInfoDialog;
