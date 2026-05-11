import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      setError(error.detail || error.message || t('profile.editProfile.error.failed'));
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
            {t('profile.editProfile.title')}
          </DialogTitle>
          <DialogDescription>
            {t('profile.editProfile.description')}
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
                {t('profile.editProfile.fields.name')}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('profile.editProfile.fields.namePlaceholder')}
                className="col-span-3"
                disabled={isLoading}
                required
              />
            </div>

            {/* Lastname */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastname" className="text-right">
                {t('profile.editProfile.fields.lastname')}
              </Label>
              <Input
                id="lastname"
                value={formData.lastname}
                onChange={(e) => handleChange('lastname', e.target.value)}
                placeholder={t('profile.editProfile.fields.lastnamePlaceholder')}
                className="col-span-3"
                disabled={isLoading}
                required
              />
            </div>

            {/* Second Lastname */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="second_lastname" className="text-right">
                {t('profile.editProfile.fields.secondLastname')}
              </Label>
              <Input
                id="second_lastname"
                value={formData.second_lastname}
                onChange={(e) => handleChange('second_lastname', e.target.value)}
                placeholder={t('profile.editProfile.fields.secondLastnamePlaceholder')}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>

            {/* Phone Number */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone_number" className="text-right">
                {t('profile.editProfile.fields.phoneNumber')}
              </Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                placeholder={t('profile.editProfile.fields.phoneNumberPlaceholder')}
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
              {t('profile.editProfile.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('profile.editProfile.buttons.saveChanges')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditProfileDialog;
