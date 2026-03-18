import { Button } from "@/app/components/ui/button";
import { Music, Users, Calendar, Shield, LogOut, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useUser } from "@/app/contexts/UserContext";
import { Can } from "@/app/components/auth/Can";
import { CanRole } from "@/app/components/auth/CanRole";
import { Link } from "react-router-dom";

interface HomePageProps {
  onLogout: () => void;
}

export function HomePage({ onLogout }: HomePageProps) {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden bg-gradient-to-br from-purple-900 to-black">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <Music className="h-16 w-16 mb-4 text-white" />
          <h1 className="text-5xl mb-4 text-white">The Electric Dreams</h1>
          <p className="text-xl text-white/90 max-w-2xl mb-6">
            Rock band creating unforgettable music experiences since 2015
          </p>
          
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-4 mb-4 text-white/80">
              <User className="h-5 w-5" />
              <span>{user.name} {user.lastname}</span>
              <span className="px-2 py-1 bg-white/20 rounded text-sm capitalize">
                {user.role}
              </span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Link to="/profile">
              <Button 
                variant="outline" 
                className="text-black border-white hover:bg-white hover:text-gray-400"
              >
                <User className="h-4 w-4 mr-2" />
                My Profile
              </Button>
            </Link>
            <Button 
              variant="outline" 
                className="text-black border-white hover:bg-white hover:text-gray-400"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="mb-2">Welcome to Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your band website from here
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Band Members - Visible to all authenticated users */}
          <Can permission="read:users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Band Members</CardTitle>
                <CardDescription>
                  Manage band member profiles and bios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Manage Members
                </Button>
              </CardContent>
            </Card>
          </Can>

          {/* Events - Visible to all authenticated users */}
          <Can permission="read:events">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Events</CardTitle>
                <CardDescription>
                  Schedule and manage upcoming shows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Manage Events
                </Button>
              </CardContent>
            </Card>
          </Can>

          {/* Admin Panel - Only for admins */}
          <CanRole roles="admin">
            <Link to="/admin/roles">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Admin Panel</CardTitle>
                  <CardDescription>
                    User management and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full">
                    Manage Admin
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </CanRole>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Can permission="read:users">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Band Members</CardDescription>
                <CardTitle className="text-4xl">2</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Active members</p>
              </CardContent>
            </Card>
          </Can>

          <Can permission="read:events">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Upcoming Events</CardDescription>
                <CardTitle className="text-4xl">1</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Scheduled shows</p>
              </CardContent>
            </Card>
          </Can>

          <CanRole roles="admin">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Admin Users</CardDescription>
                <CardTitle className="text-4xl">2</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Active administrators</p>
              </CardContent>
            </Card>
          </CanRole>
        </div>
        
        {/* User Permissions Debug - Useful for development */}
        {process.env.NODE_ENV === 'development' && user && (
          <div className="mt-12 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Debug: Your Permissions</h3>
            <p className="text-sm text-muted-foreground mb-2">Role: {user.role}</p>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((perm) => (
                <span key={perm} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  {perm}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
