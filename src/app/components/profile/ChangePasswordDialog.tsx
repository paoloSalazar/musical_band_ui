import { useState, useEffect } from 'react';
import { profileApi } from '../../lib/api/profile';
import { Button } from '../ui/button';
import { PasswordInput } from '../ui/password-input';
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
import { Loader2, KeyRound } from 'lucide-react';

interface ChangePasswordDialogProps {
  userEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ChangePasswordDialog({
  userEmail,
  open,
  onOpenChange,
  onSuccess,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await profileApi.changePassword(userEmail, currentPassword, newPassword);

      setSuccess(true);
      
      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
      }, 1500);
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setError(null);
      setSuccess(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <KeyRound className="mr-2 h-5 w-5" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                Password changed successfully!
              </div>
            )}

            {/* Current Password */}
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="current_password" className="text-right">
                Current
              </Label>
              <PasswordInput
                id="current_password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="col-span-3"
                disabled={isLoading || success}
                required
              />
            </div>

            {/* New Password */}
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="new_password" className="text-right">
                New
              </Label>
              <PasswordInput
                id="new_password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="col-span-3"
                disabled={isLoading || success}
                required
                minLength={6}
              />
            </div>

            {/* Confirm New Password */}
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="confirm_password" className="text-right">
                Confirm
              </Label>
              <PasswordInput
                id="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="col-span-3"
                disabled={isLoading || success}
                required
                minLength={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading || success}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || success}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {success ? 'Changed!' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePasswordDialog;
