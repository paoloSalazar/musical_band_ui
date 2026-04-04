import { useState, useEffect } from 'react';
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
  DialogTrigger,
} from '../../ui/dialog';
import { Loader2, Plus } from 'lucide-react';

interface UserFormDialogProps {
  onSuccess?: (user: User) => void;
  trigger?: React.ReactNode;
}

export function UserFormDialog({ onSuccess, trigger }: UserFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [secondLastname, setSecondLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<string>('');

  useEffect(() => {
    if (open) {
      resetForm();
      loadRoles();
    }
  }, [open]);

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
    setEmail('');
    setPhoneNumber('');
    setPassword('');
    setRoleId('');
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
      setError('Name is required');
      return;
    }
    if (!lastname.trim()) {
      setError('Last name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    if (!roleId) {
      setError('Role is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const userData: UserFormData = {
        name: name.trim(),
        lastname: lastname.trim(),
        second_lastname: secondLastname.trim() || undefined,
        email: email.trim(),
        phone_number: phoneNumber.trim() || undefined,
        password: password.trim(),
        role_id: parseInt(roleId, 10),
      };
      
      const response = await usersApi.create(userData);
      
      // Close dialog and reset form
      setOpen(false);
      resetForm();
      
      // Call success callback
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.detail || error.message || 'Failed to create user');
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
            Create User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. Click save when you're done.
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
                Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Juan"
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            
            {/* Lastname */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastname" className="text-right">
                Last Name *
              </Label>
              <Input
                id="lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="e.g., Perez"
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            
            {/* Second Lastname */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secondLastname" className="text-right">
                Second Last Name
              </Label>
              <Input
                id="secondLastname"
                value={secondLastname}
                onChange={(e) => setSecondLastname(e.target.value)}
                placeholder="e.g., Villarroel"
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            
            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., juan.perez@example.com"
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            
            {/* Phone Number */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., +1234567890"
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            
            {/* Password */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            
            {/* Role */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role *
              </Label>
              <Select value={roleId} onValueChange={setRoleId} disabled={isLoading || isLoadingRoles}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingRoles}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
