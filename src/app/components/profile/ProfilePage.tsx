import { useState, useEffect } from 'react';
import { profileApi } from '../../lib/api';
import type { UserProfileWithDetails, UserDetail } from '../../lib/types';
import { Button } from '../ui/button';
import { Loader2, User as UserIcon, Mail, Phone, Shield, MapPin, ArrowLeft, Pencil, Plus, Trash2, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditProfileDialog } from './EditProfileDialog';
import { AddAdditionalInfoDialog } from './AddAdditionalInfoDialog';
import { EditAdditionalInfoDialog } from './EditAdditionalInfoDialog';
import { DeleteAdditionalInfoDialog } from './DeleteAdditionalInfoDialog';
import { ChangePasswordDialog } from './ChangePasswordDialog';

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddInfoDialogOpen, setIsAddInfoDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<UserDetail | null>(null);
  const [isEditDetailDialogOpen, setIsEditDetailDialogOpen] = useState(false);
  const [isDeleteDetailDialogOpen, setIsDeleteDetailDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

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

  const handleProfileUpdate = async () => {
    // Reload the full profile to ensure all data (details, permissions) is preserved
    await loadProfile();
  };

  const { user, details } = profile || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-red-600 text-center py-8">
          <p className="font-medium text-lg">Error</p>
          <p className="text-sm">{error}</p>
          <Button onClick={loadProfile} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-gray-500 text-center py-8">
          No profile data available
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Back to Home */}
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          {user && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangePasswordDialogOpen(true)}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* User Icon and Basic Info */}
          <div className="flex items-center space-x-6 pb-6 border-b">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user.name} {user.lastname}
                {user.second_lastname && ` ${user.second_lastname}`}
              </h2>
              <p className="text-gray-500">ID: {user.id}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              {user.phone_number && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{user.phone_number}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>

              {user.created_at && (
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddInfoDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Info
              </Button>
            </div>
            {details && details.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {details.map((detail) => (
                  <div key={detail.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      {detail.detail_type === 'address1' || detail.detail_type === 'address' ? (
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-gray-200 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm text-gray-500 capitalize">{detail.detail_type.replace(/_/g, ' ')}</p>
                        <p className="font-medium">{detail.detail_value}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedDetail(detail);
                          setIsEditDetailDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedDetail(detail);
                          setIsDeleteDetailDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No additional information added yet. Click "Add Info" to add details like address, city, or other information.</p>
            )}
          </div>

          {/* Permissions */}
          {user.permissions && user.permissions.length > 0 && (
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">My Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {user && (
        <EditProfileDialog
          user={user}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleProfileUpdate}
        />
      )}

      {/* Add Additional Info Dialog */}
      {user && (
        <AddAdditionalInfoDialog
          userId={user.id}
          open={isAddInfoDialogOpen}
          onOpenChange={setIsAddInfoDialogOpen}
          onSuccess={handleProfileUpdate}
        />
      )}

      {/* Edit Additional Info Dialog */}
      {user && selectedDetail && (
        <EditAdditionalInfoDialog
          userId={user.id}
          detail={selectedDetail}
          open={isEditDetailDialogOpen}
          onOpenChange={setIsEditDetailDialogOpen}
          onSuccess={handleProfileUpdate}
        />
      )}

      {/* Delete Additional Info Dialog */}
      {user && selectedDetail && (
        <DeleteAdditionalInfoDialog
          userId={user.id}
          detail={selectedDetail}
          open={isDeleteDetailDialogOpen}
          onOpenChange={setIsDeleteDetailDialogOpen}
          onSuccess={handleProfileUpdate}
        />
      )}

      {/* Change Password Dialog */}
      {user && (
        <ChangePasswordDialog
          userEmail={user.email}
          open={isChangePasswordDialogOpen}
          onOpenChange={setIsChangePasswordDialogOpen}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}

export default ProfilePage;
