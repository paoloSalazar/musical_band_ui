import { Link, useLocation, Outlet } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { 
  Users, 
  Shield, 
  Settings, 
  ChevronRight,
  LayoutDashboard,
  Key
} from 'lucide-react';
import { cn } from '../ui/utils';

/**
 * Admin Layout Component
 * Provides navigation sidebar for admin pages
 */
export function AdminLayout() {
  const location = useLocation();
  const { user } = useUser();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Logged in as: <span className="font-medium">{user?.name}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border p-4">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
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
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
