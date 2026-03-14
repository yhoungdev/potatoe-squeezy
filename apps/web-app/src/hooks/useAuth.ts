import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user.store";
import { useNavigate } from "@tanstack/react-router";
import { AuthService } from "@/services/auth.service";

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { authUser, setAuthUser, clearUser } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await AuthService.getSession();
        if (session?.user) {
          setAuthUser(session.user);
          setIsAuthenticated(true);
        } else {
          setAuthUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        setAuthUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [setAuthUser]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AuthService.signOut();
    clearUser();
    setIsAuthenticated(false);
    navigate({ to: "/" });
  };

  const checkAuthStatus = async () => {
    try {
      const session = await AuthService.getSession();
      const ok = !!session?.user;
      setIsAuthenticated(ok);
      setAuthUser(session?.user || null);
      return ok;
    } catch {
      setIsAuthenticated(false);
      setAuthUser(null);
      return false;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user: authUser,
    login: handleLogin,
    logout: handleLogout,
    checkAuthStatus,
  };
}

export default useAuth;
