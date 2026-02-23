import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { NavBar, Footer } from "@/app/components/layout";
import { HomePage, AdminPage, LoginPage } from "@/app/pages";
import { AuthProvider, useAuth } from "@/app/contexts/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background d-flex flex-column min-vh-100">
              <NavBar />
              <main className="flex-grow">
                <HomePage />
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background d-flex flex-column min-vh-100">
              <NavBar />
              <main className="flex-grow">
                <AdminPage />
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
