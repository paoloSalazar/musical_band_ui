import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError, translateUserRole, capitalizeFirstLetter } from '../../../../i18n/utils';
import { usersApi } from '../../../lib/api';
import type { User } from '../../../lib/types';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Loader2, User as UserIcon, Mail, Phone, Shield } from 'lucide-react';

interface ViewUserDialogProps {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewUserDialog({ userId, open, onOpenChange }: ViewUserDialogProps) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId) {
      loadUser();
    }
  }, [open, userId]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await usersApi.getById(userId);
      setUser(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user';
      setError(translateApiError(errorMessage, 'user view'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('users.dialog.view.title')}</DialogTitle>
          <DialogDescription>
            {t('users.dialog.view.description')}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">{t('users.form.loadingUser')}</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* User Icon and Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {capitalizeFirstLetter(user.name)} {capitalizeFirstLetter(user.lastname)}
                  {user.second_lastname && ` ${capitalizeFirstLetter(user.second_lastname)}`}
                </h3>
                <p className="text-gray-500">ID: {user.id}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('users.dialog.view.email')}</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              {user.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('users.dialog.view.phoneNumber')}</p>
                    <p className="font-medium">{user.phone_number}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('users.dialog.view.role')}</p>
                  <p className="font-medium">{translateUserRole(user.role)}</p>
                </div>
              </div>

              {user.created_at && (
                <div>
                  <p className="text-sm text-gray-500">{t('users.dialog.view.createdAt')}</p>
                  <p className="font-medium">{new Date(user.created_at).toLocaleString()}</p>
                </div>
              )}

              {user.updated_at && (
                <div>
                  <p className="text-sm text-gray-500">{t('users.dialog.view.updatedAt')}</p>
                  <p className="font-medium">{new Date(user.updated_at).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Permissions */}
            {user.permissions && user.permissions.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">{t('users.dialog.view.permissions')}</p>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">
            {t('users.dialog.view.noData')}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('users.dialog.view.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
