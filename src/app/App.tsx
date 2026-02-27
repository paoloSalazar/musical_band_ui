import { useState } from "react";
import { LoginForm } from "./components/login/LoginForm";
import { HomePage } from "./components/home/HomePage";
import { authService } from "./lib/api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return authService.isAuthenticated();
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return <HomePage onLogout={handleLogout} />;
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}
