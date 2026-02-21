import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { User } from "./UserManagementCard";
import { Permission } from "./PermissionCard";
import { Badge } from "@/app/components/ui/badge";

interface UserPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, permissionIds: string[]) => void;
  user: User | null;
  permissions: Permission[];
}

export function UserPermissionsDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  user,
  permissions 
}: UserPermissionsDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setSelectedPermissions(user.permissionIds || []);
    } else {
      setSelectedPermissions([]);
    }
  }, [user, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onSave(user.id, selectedPermissions);
      onOpenChange(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Permissions</DialogTitle>
            <DialogDescription>
              {user && `Manage permissions for ${user.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4 py-4">
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category}>
                  <h4 className="mb-3 font-medium flex items-center gap-2">
                    {category}
                    <Badge variant="secondary" className="text-xs">
                      {categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length} / {categoryPermissions.length}
                    </Badge>
                  </h4>
                  <div className="space-y-3 ml-2">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={permission.id}
                            className="cursor-pointer font-medium"
                          >
                            {permission.name}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {permissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No permissions available. Create permissions first.
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Permissions
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
