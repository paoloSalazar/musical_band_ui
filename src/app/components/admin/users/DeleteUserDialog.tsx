import { useState, useEffect } from 'react';
import { usersApi } from '../../../lib/api';
import type { User } from '../../../lib/types';
import type { ApiError } from '../../../lib/api/client';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteUserDialogProps {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteUserDialog({ userId, open, onOpenChange, onSuccess }: DeleteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (open && userId) {
      setError(null);
      loadUser();
    } else if (!open) {
      setError(null);
      setUser(null);
    }
  }, [open, userId]);

  const loadUser = async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      const response = await usersApi.getById(userId);
      setUser(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);
      
      await usersApi.delete(userId);
      
      // Close dialog
      onOpenChange(false);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingData ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading user...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center py-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            {user && (
              <div className="text-center">
                <p className="font-medium text-gray-900">
                  {user.name} {user.lastname}
                </p>
                <p className="text-sm text-gray-500">
                  {user.email}
                </p>
                {user.phone_number && (
                  <p className="text-sm text-gray-500">
                    {user.phone_number}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  ID: {user.id}
                </p>
              </div>
            )}
          </>
        )}
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="destructive" 
            disabled={isLoading || isLoadingData}
            onClick={handleSubmit}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
