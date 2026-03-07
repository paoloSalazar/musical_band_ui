import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useIsMobile } from '../ui/use-mobile';
import { 
  Users, 
  Shield, 
  Settings, 
  ChevronRight,
  LayoutDashboard,
  Key,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

/**
 * Admin Layout Component
 * Provides navigation sidebar for admin pages
 */
export function AdminLayout() {
  const location = useLocation();
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'User Roles',
      href: '/admin/roles',
      icon: Users,
    },
    {
      name: 'Permissions',
      href: '/admin/permissions',
      icon: Shield,
    },
    {
      name: 'Role Permissions',
      href: '/admin/role-permissions',
      icon: Key,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  // Navigation items content - used by both desktop sidebar and mobile sheet
  const NavItems = ({ onClick }: { onClick?: () => void }) => (
    <ul className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <li key={item.name}>
            <Link
              to={item.href}
              onClick={onClick}
              className={cn(
                'flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className={cn('mr-3 h-5 w-5', active ? 'text-blue-600' : 'text-gray-400')} />
              {item.name}
              {active && (
                <ChevronRight className="ml-auto h-4 w-4 text-blue-600" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Mobile menu button */}
              {isMobile && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72">
                    <SheetHeader className="mb-4">
                      <SheetTitle className="flex items-center space-x-2">
                        <Settings className="h-6 w-6 text-blue-600" />
                        <span>Admin Panel</span>
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="mt-4">
                      <NavItems onClick={() => setSidebarOpen(false)} />
                    </nav>
                  </SheetContent>
                </Sheet>
              )}
              
              <Settings className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Logged in as: <span className="font-medium">{user?.name}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar Navigation - hidden on mobile */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border p-4 sticky top-20">
              <NavItems />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
