import { useState, useEffect } from 'react';
import { profileApi } from '../../lib/api';
import type { UserProfileWithDetails } from '../../lib/types';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Loader2, User as UserIcon, Mail, Phone, Shield, MapPin } from 'lucide-react';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const [profile, setProfile] = useState<UserProfileWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await profileApi.getCurrentUserWithDetails();
      if (response.success) {
        setProfile(response.data);
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const { user, details } = profile || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>
            View your profile information
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading profile...</span>
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
                  {user.name} {user.lastname}
                  {user.second_lastname && ` ${user.second_lastname}`}
                </h3>
                <p className="text-gray-500">ID: {user.id}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              {user.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{user.phone_number}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{user.role}</p>
                </div>
              </div>

              {user.created_at && (
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">{new Date(user.created_at).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Additional Details */}
            {details && details.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Additional Information</p>
                <div className="space-y-2">
                  {details.map((detail) => (
                    <div key={detail.id} className="flex items-center gap-3">
                      {detail.detail_type === 'address1' || detail.detail_type === 'address' ? (
                        <MapPin className="h-4 w-4 text-gray-400" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-gray-200" />
                      )}
                      <div>
                        <p className="text-sm text-gray-500 capitalize">{detail.detail_type.replace(/_/g, ' ')}</p>
                        <p className="font-medium">{detail.detail_value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Permissions */}
            {user.permissions && user.permissions.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Permissions</p>
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
            No profile data available
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserProfileDialog;
