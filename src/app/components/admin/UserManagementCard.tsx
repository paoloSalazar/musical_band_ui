import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { User as UserIcon, Shield, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Permission } from "./PermissionCard";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissionIds: string[];
}

interface UserManagementCardProps {
  user: User;
  permissions: Permission[];
  onAssignPermissions: (user: User) => void;
  onDelete: (id: string) => void;
}

export function UserManagementCard({ 
  user, 
  permissions,
  onAssignPermissions, 
  onDelete 
}: UserManagementCardProps) {
  const userPermissions = permissions.filter(p => user.permissionIds.includes(p.id));

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="mt-2 text-xs">
              {user.role}
            </Badge>
          </div>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDelete(user.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {userPermissions.length} permission{userPermissions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onAssignPermissions(user)}
          >
            Manage Permissions
          </Button>
        </div>
        
        {userPermissions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {userPermissions.slice(0, 3).map((permission) => (
              <Badge key={permission.id} variant="secondary" className="text-xs">
                {permission.name}
              </Badge>
            ))}
            {userPermissions.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{userPermissions.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
