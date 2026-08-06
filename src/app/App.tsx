import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { LoginForm } from './components/login/LoginForm';
import { HomePage } from './components/home/HomePage';
import { ProfilePage } from './components/profile/ProfilePage';
import { EventsPage } from './components/events/EventsPage';
import { EventMusicianManagement } from './components/events/EventMusicianManagement';
import { AdminLayout } from './components/admin/AdminLayout';
import { RolesListPage } from './components/admin/roles/RolesListPage';
import { PermissionsListPage } from './components/admin/permissions/PermissionsListPage';
import { RolePermissionsPage } from './components/admin/role-permissions/RolePermissionsPage';
import { UsersListPage } from './components/admin/users/UsersListPage';
import { MusicianAvailabilityPage } from './components/musician-availability/MusicianAvailabilityPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function AppContent() {
  const { isAuthenticated, hasPermission } = useUser();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Routes>
      {/* Main Home Page */}
      <Route path="/" element={<HomePageWrapper />} />

      {/* Profile Page - Available to all authenticated users */}
      <Route path="/profile" element={<ProfilePage />} />

      {/* Events Page - Available to users with read:events permission */}
      <Route
        path="/events"
        element={
          <ProtectedRoute requiredPermission="read:events">
            <EventsPage />
          </ProtectedRoute>
        }
      />

      {/* Event Musician Management - Available to users with read:event_musician permission */}
      <Route
        path="/events/:eventId/musicians"
        element={
          <ProtectedRoute requiredPermission="read:event_musician">
            <EventMusicianManagement />
          </ProtectedRoute>
        }
      />

      {/* Musician Availability Page - For musicians and auxiliar musicians */}
      <Route
        path="/musician-availability"
        element={
          <ProtectedRoute requiredPermission="read:musician_availability">
            <MusicianAvailabilityPageWrapper />
          </ProtectedRoute>
        }
      />

      {/* Login Page */}
      <Route path="/login" element={<LoginForm />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredPermission="read:user_roles">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersListPage />} />
        <Route path="roles" element={<RolesListPage />} />
        <Route path="roles/new" element={<div>Create Role Page - Coming Soon</div>} />
        <Route path="roles/:name" element={<div>Role Detail Page - Coming Soon</div>} />
        <Route path="roles/:name/edit" element={<div>Edit Role Page - Coming Soon</div>} />
        <Route path="permissions" element={<PermissionsListPage />} />
        <Route path="role-permissions" element={<RolePermissionsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function HomePageWrapper() {
  const { logout } = useUser();
  return <HomePage onLogout={logout} />;
}

function MusicianAvailabilityPageWrapper() {
  const { user } = useUser();
  if (!user) return null;
  return <MusicianAvailabilityPage musicianId={user.id} />;
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <p className="text-gray-600">
        Welcome to the Admin Panel. Use the navigation to manage roles and permissions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold">User Roles</h3>
          <p className="text-gray-600 text-sm mt-1">Manage user roles and permissions</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold">Permissions</h3>
          <p className="text-gray-600 text-sm mt-1">View and manage system permissions</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}
