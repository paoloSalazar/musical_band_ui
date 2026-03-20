import { useState } from 'react';
import { profileApi, type UserDetailCreateData } from '../../lib/api/profile';
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
import { Loader2, Plus } from 'lucide-react';

interface AddAdditionalInfoDialogProps {
  userId: number;
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

export function AddAdditionalInfoDialog({
  userId,
  open,
  onOpenChange,
  onSuccess,
}: AddAdditionalInfoDialogProps) {
  const [formData, setFormData] = useState<UserDetailCreateData>({
    user_id: userId,
    detail_type: '',
    detail_value: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setFormData({
        user_id: userId,
        detail_type: '',
        detail_value: '',
      });
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleChange = (field: keyof UserDetailCreateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.detail_type || !formData.detail_value) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await profileApi.createUserDetail(
        formData.user_id,
        formData.detail_type,
        formData.detail_value
      );

      // Close dialog
      onOpenChange(false);

      // Reload profile to get updated data
      onSuccess();
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to add additional info');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Add Additional Information
          </DialogTitle>
          <DialogDescription>
            Add new additional information to your profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Detail Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="detail_type" className="text-right">
                Type
              </Label>
              <Input
                id="detail_type"
                value={formData.detail_type}
                onChange={(e) => handleChange('detail_type', e.target.value)}
                placeholder="e.g., address, city, phone"
                className="col-span-3"
                disabled={isLoading}
                required
                list="detail-types"
              />
              <datalist id="detail-types">
                {DETAIL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </datalist>
            </div>

            {/* Detail Value */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="detail_value" className="text-right">
                Value
              </Label>
              <Input
                id="detail_value"
                value={formData.detail_value}
                onChange={(e) => handleChange('detail_value', e.target.value)}
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
              Add Info
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddAdditionalInfoDialog;
