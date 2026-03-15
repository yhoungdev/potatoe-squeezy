import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/store/user.store";
import { useNavigate } from "@tanstack/react-router";
import { AuthService } from "@/services/auth.service";

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { authUser, setAuthUser, clearUser } = useUserStore();
  const navigate = useNavigate();

  const setAuthUserIfChanged = useCallback(
    (nextUser: any | null) => {
      const currentId = authUser?.id ?? null;
      const nextId = nextUser?.id ?? null;
      if (currentId === nextId) return;
      setAuthUser(nextUser);
    },
    [authUser?.id, setAuthUser],
  );

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await AuthService.getSession();
        if (session?.user) {
          setAuthUserIfChanged(session.user);
          setIsAuthenticated(true);
        } else {
          setAuthUserIfChanged(null);
          setIsAuthenticated(false);
        }
      } catch {
        setAuthUserIfChanged(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [setAuthUserIfChanged]);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(async () => {
    await AuthService.signOut();
    clearUser();
    setIsAuthenticated(false);
    navigate({ to: "/" });
  }, [clearUser, navigate]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const session = await AuthService.getSession();
      const ok = !!session?.user;
      setIsAuthenticated(ok);
      setAuthUserIfChanged(session?.user || null);
      return ok;
    } catch {
      setIsAuthenticated(false);
      setAuthUserIfChanged(null);
      return false;
    }
  }, [setAuthUserIfChanged]);

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
