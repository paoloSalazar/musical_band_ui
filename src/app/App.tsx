import { UserProvider, useUser } from "./contexts/UserContext";
import { LoginForm } from "./components/login/LoginForm";
import { HomePage } from "./components/home/HomePage";

function AppContent() {
  const { isAuthenticated, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  if (isAuthenticated) {
    return <HomePage onLogout={handleLogout} />;
  }

  return <LoginForm />;
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
