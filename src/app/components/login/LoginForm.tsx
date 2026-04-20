import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Music, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { useUser } from "@/app/contexts/UserContext";
import { useTranslation } from "react-i18next";

export function LoginForm() {
  const { login, isLoading } = useUser();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple validation
    if (!email || !password) {
      setError(t("login.validation.required"));
      return;
    }

    try {
      // Use the login from UserContext
      await login(email, password);
      // Login success - UserContext will update isAuthenticated
      console.log("Login successful!");
    } catch (err) {
      // Handle authentication error
      const errorMessage = err instanceof Error ? err.message : t("auth.loginError");
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4">
            <Music className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl text-white mb-2">{t("login.title")}</h1>
          <p className="text-white/70">{t("login.subtitle")}</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>{t("login.welcomeBack")}</CardTitle>
            <CardDescription>
              {t("login.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("login.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("login.signingIn") : t("login.signIn")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          {t("login.footer")}
        </p>
      </div>
    </div>
  );
}
