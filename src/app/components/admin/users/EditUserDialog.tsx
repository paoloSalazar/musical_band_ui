import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError, capitalizeFirstLetter } from '../../../../i18n/utils';
import { usersApi, rolesApi } from '../../../lib/api';
import type { User, UserFormData, Role } from '../../../lib/types';
import type { ApiError } from '../../../lib/api/client';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Loader2 } from 'lucide-react';

interface EditUserDialogProps {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (user: User) => void;
}

export function EditUserDialog({ userId, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [secondLastname, setSecondLastname] = useState('');
  const [ci, setCi] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [roleId, setRoleId] = useState<string>('');

  useEffect(() => {
    if (open && userId) {
      loadUser();
      loadRoles();
    }
  }, [open, userId]);

  const loadUser = async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      const response = await usersApi.getById(userId);
      const user = response.data;
      
      setName(user.name);
      setLastname(user.lastname);
      setSecondLastname(user.second_lastname || '');
      setCi(user.ci || '');
      setPhoneNumber(user.phone_number || '');
      setRoleId(user.role_id.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const response = await rolesApi.list();
      setRoles(response.data);
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const resetForm = () => {
    setName('');
    setLastname('');
    setSecondLastname('');
    setCi('');
    setPhoneNumber('');
    setRoleId('');
    setError(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(t('users.form.validation.nameRequired'));
      return;
    }
    if (!lastname.trim()) {
      setError(t('users.form.validation.lastNameRequired'));
      return;
    }
    if (!roleId) {
      setError(t('users.form.validation.roleRequired'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const userData: Partial<UserFormData> = {
        name: name.trim(),
        lastname: lastname.trim(),
        second_lastname: secondLastname.trim() || undefined,
        ci: ci.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        role_id: parseInt(roleId, 10),
      };
      
      const response = await usersApi.update(userId, userData);
      
      // Close dialog
      handleOpenChange(false);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const error = err as ApiError;
      const rawErrorMessage = error.detail || error.message;
      setError(rawErrorMessage ? translateApiError(rawErrorMessage, 'user update') : t('users.form.failedToUpdate'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('users.form.edit.title')}</DialogTitle>
          <DialogDescription>
            {t('users.form.edit.description')}
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">{t('users.form.loadingUser')}</span>
          </div>
        ) : error && !isLoading ? (
          <div className="text-red-600 text-center py-4">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              {/* Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  {t('users.form.fields.name')} *
                </Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Juan"
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
              
              {/* Lastname */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-lastname" className="text-right">
                  {t('users.form.fields.lastName')} *
                </Label>
                <Input
                  id="edit-lastname"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="e.g., Perez"
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
              
              {/* Second Lastname */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-secondLastname" className="text-right">
                  {t('users.form.fields.secondLastName')}
                </Label>
                <Input
                  id="edit-secondLastname"
                  value={secondLastname}
                  onChange={(e) => setSecondLastname(e.target.value)}
                  placeholder="e.g., Villarroel"
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
              
              {/* CI */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-ci" className="text-right">
                  {t('users.form.fields.ci')}
                </Label>
                <Input
                  id="edit-ci"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  placeholder="e.g., 12345678"
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
              
              {/* Phone Number */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phoneNumber" className="text-right">
                  {t('users.form.fields.phoneNumber')}
                </Label>
                <Input
                  id="edit-phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., +1234567890"
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
              
              {/* Role */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  {t('users.form.fields.role')} *
                </Label>
                <Select value={roleId} onValueChange={setRoleId} disabled={isLoading || isLoadingRoles}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('users.form.fields.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                {t('users.form.buttons.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingRoles}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('users.form.buttons.saveChanges')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
