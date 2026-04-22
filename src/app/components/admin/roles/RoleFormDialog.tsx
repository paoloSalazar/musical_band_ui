import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rolesApi } from '../../../lib/api';
import { translateApiError } from '../../../../i18n/utils';
import type { Role } from '../../../lib/types';
import type { ApiError } from '../../../lib/api/client';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { Loader2, Plus } from 'lucide-react';

interface RoleFormDialogProps {
  onSuccess?: (role: Role) => void;
  trigger?: React.ReactNode;
}

export function RoleFormDialog({ onSuccess, trigger }: RoleFormDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setError(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(t('roles.form.validation.nameRequired'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await rolesApi.create({ name: name.trim(), description: description.trim() });
      
      // Close dialog and reset form
      setOpen(false);
      resetForm();
      
      // Call success callback
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const error = err as ApiError;
      const rawErrorMessage = error.detail || error.message;
      setError(rawErrorMessage ? translateApiError(rawErrorMessage, 'role creation') : t('roles.form.failedToCreate'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('roles.createRole')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('roles.form.create.title')}</DialogTitle>
          <DialogDescription>
            {t('roles.form.create.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('roles.form.fields.name')}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('roles.form.fields.namePlaceholder')}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t('roles.form.fields.description')}
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('roles.form.fields.descriptionPlaceholder')}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              {t('roles.form.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('roles.form.buttons.saveRole')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
