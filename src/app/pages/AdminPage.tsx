import { useState } from "react";
import { 
  PermissionCard, 
  PermissionDialog, 
  UserManagementCard, 
  UserDialog, 
  UserPermissionsDialog,
  Permission,
  User
} from "@/app/components/admin";
import { Button } from "@/app/components/ui/button";
import { Shield, Plus, UserCog } from "lucide-react";

export function AdminPage() {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "1",
      name: "Edit Band Members",
      description: "Can add, edit, and delete band member profiles",
      category: "Band Management"
    },
    {
      id: "2",
      name: "Manage Events",
      description: "Can create, update, and delete events",
      category: "Event Management"
    },
    {
      id: "3",
      name: "View Analytics",
      description: "Can access website analytics and reports",
      category: "System Administration"
    },
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@electricdreams.com",
      role: "Band Manager",
      permissionIds: ["1", "2"]
    },
    {
      id: "2",
      name: "Mike Peters",
      email: "mike@electricdreams.com",
      role: "Event Coordinator",
      permissionIds: ["2"]
    },
  ]);

  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userPermissionsDialogOpen, setUserPermissionsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assigningPermissionsUser, setAssigningPermissionsUser] = useState<User | null>(null);

  const handleSavePermission = (permissionData: Omit<Permission, "id"> & { id?: string }) => {
    if (permissionData.id) {
      setPermissions(permissions.map(p => 
        p.id === permissionData.id ? { ...permissionData, id: permissionData.id } : p
      ));
    } else {
      const newPermission: Permission = {
        ...permissionData,
        id: Date.now().toString(),
      };
      setPermissions([...permissions, newPermission]);
    }
    setEditingPermission(null);
  };

  const handleDeletePermission = (id: string) => {
    setPermissions(permissions.filter(p => p.id !== id));
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setPermissionDialogOpen(true);
  };

  const handleSaveUser = (userData: Omit<User, "id"> & { id?: string }) => {
    if (userData.id) {
      setUsers(users.map(u => 
        u.id === userData.id ? { ...userData, id: userData.id } : u
      ));
    } else {
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
      };
      setUsers([...users, newUser]);
    }
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  };

  const handleAssignPermissions = (user: User) => {
    setAssigningPermissionsUser(user);
    setUserPermissionsDialogOpen(true);
  };

  const handleSaveUserPermissions = (userId: string, permissionIds: string[]) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, permissionIds } : u
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="space-y-12">
        {/* Permissions Section */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="mb-2">Permissions</h2>
              <p className="text-muted-foreground">
                Create and manage admin tasks and permissions
              </p>
            </div>
            <Button 
              onClick={() => {
                setEditingPermission(null);
                setPermissionDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Permission
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {permissions.map((permission) => (
              <PermissionCard
                key={permission.id}
                permission={permission}
                onEdit={handleEditPermission}
                onDelete={handleDeletePermission}
              />
            ))}
          </div>

          {permissions.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No permissions yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first permission to get started
              </p>
              <Button onClick={() => setPermissionDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Permission
              </Button>
            </div>
          )}
        </div>

        {/* User Management Section */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="mb-2">User Management</h2>
              <p className="text-muted-foreground">
                Manage users and assign permissions
              </p>
            </div>
            <Button 
              onClick={() => {
                setEditingUser(null);
                setUserDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map((user) => (
              <UserManagementCard
                key={user.id}
                user={user}
                permissions={permissions}
                onAssignPermissions={handleAssignPermissions}
                onDelete={handleDeleteUser}
              />
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <UserCog className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No users yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first user to get started
              </p>
              <Button onClick={() => setUserDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <PermissionDialog
        open={permissionDialogOpen}
        onOpenChange={(open) => {
          setPermissionDialogOpen(open);
          if (!open) setEditingPermission(null);
        }}
        onSave={handleSavePermission}
        permission={editingPermission}
      />

      <UserDialog
        open={userDialogOpen}
        onOpenChange={(open) => {
          setUserDialogOpen(open);
          if (!open) setEditingUser(null);
        }}
        onSave={handleSaveUser}
        user={editingUser}
      />

      <UserPermissionsDialog
        open={userPermissionsDialogOpen}
        onOpenChange={(open) => {
          setUserPermissionsDialogOpen(open);
          if (!open) setAssigningPermissionsUser(null);
        }}
        user={assigningPermissionsUser}
        permissions={permissions}
        onSave={handleSaveUserPermissions}
      />
    </div>
  );
}
