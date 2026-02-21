import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Pencil, Trash2, Shield } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PermissionCardProps {
  permission: Permission;
  onEdit: (permission: Permission) => void;
  onDelete: (id: string) => void;
}

export function PermissionCard({ permission, onEdit, onDelete }: PermissionCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{permission.name}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {permission.category}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={() => onEdit(permission)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={() => onDelete(permission.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{permission.description}</p>
      </CardContent>
    </Card>
  );
}
