import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { LoginForm } from './components/login/LoginForm';
import { HomePage } from './components/home/HomePage';
import { AdminLayout } from './components/admin/AdminLayout';
import { RolesListPage } from './components/admin/roles/RolesListPage';
import { PermissionsListPage } from './components/admin/permissions/PermissionsListPage';
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
        <Route path="roles" element={<RolesListPage />} />
        <Route path="roles/new" element={<div>Create Role Page - Coming Soon</div>} />
        <Route path="roles/:name" element={<div>Role Detail Page - Coming Soon</div>} />
        <Route path="roles/:name/edit" element={<div>Edit Role Page - Coming Soon</div>} />
        <Route path="permissions" element={<PermissionsListPage />} />
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
