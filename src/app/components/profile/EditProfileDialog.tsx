import { useState, useEffect } from 'react';
import { profileApi, type ProfileUpdateData } from '../../lib/api/profile';
import type { User } from '../../lib/types';
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

interface EditProfileDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditProfileDialogProps) {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: '',
    lastname: '',
    second_lastname: '',
    phone_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when dialog opens with user data
  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || '',
        lastname: user.lastname || '',
        second_lastname: user.second_lastname || '',
        phone_number: user.phone_number || '',
      });
      setError(null);
    }
  }, [open, user]);

  const handleChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      await profileApi.updateCurrentUser(formData);

      // Close dialog
      onOpenChange(false);

      // Reload profile to get updated data
      onSuccess();
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to update profile');
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
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your basic profile information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your name"
                className="col-span-3"
                disabled={isLoading}
                required
              />
            </div>

            {/* Lastname */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastname" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastname"
                value={formData.lastname}
                onChange={(e) => handleChange('lastname', e.target.value)}
                placeholder="Enter your last name"
                className="col-span-3"
                disabled={isLoading}
                required
              />
            </div>

            {/* Second Lastname */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="second_lastname" className="text-right">
                Second Last Name
              </Label>
              <Input
                id="second_lastname"
                value={formData.second_lastname}
                onChange={(e) => handleChange('second_lastname', e.target.value)}
                placeholder="Enter your second last name (optional)"
                className="col-span-3"
                disabled={isLoading}
              />
            </div>

            {/* Phone Number */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone_number" className="text-right">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                placeholder="+1234567890"
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
      </DialogContent>
    </Dialog>
  );
}

export default EditProfileDialog;
