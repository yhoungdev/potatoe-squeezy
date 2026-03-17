import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/store/user.store";
import { useNavigate } from "@tanstack/react-router";
import { AuthService } from "@/services/auth.service";
import UserService from "@/services/user.service";

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { authUser, setAuthUser, setUser, setWallet, clearUser } =
    useUserStore();
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
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const token = localStorage.getItem("bearer_token");
        if (!token) {
          if (!cancelled) {
            setAuthUserIfChanged(null);
            setIsAuthenticated(false);
          }
          return;
        }

        const profile = (await UserService.fetchUserProfile()) as any;
        if (!cancelled) {
          if (profile?.user) {
            setAuthUserIfChanged(profile.user);
            if (profile.wallet) {
              setWallet(profile.wallet);
            }
            setUser(profile.user);
            setIsAuthenticated(true);
          } else {
            setAuthUserIfChanged(null);
            setIsAuthenticated(false);
          }
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem("bearer_token");
          setAuthUserIfChanged(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [setAuthUserIfChanged, setUser, setWallet]);

  const handleLogout = useCallback(async () => {
    await AuthService.signOut();
    localStorage.removeItem("bearer_token");
    clearUser();
    navigate({ to: "/" });
  }, [clearUser, navigate]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        setAuthUserIfChanged(null);
        setIsAuthenticated(false);
        return false;
      }

      const profile = (await UserService.fetchUserProfile()) as any;
      const ok = Boolean(profile?.user);
      setAuthUserIfChanged(profile?.user || null);
      setIsAuthenticated(ok);
      if (ok) {
        if (profile.wallet) setWallet(profile.wallet);
        setUser(profile.user);
      }
      return ok;
    } catch {
      localStorage.removeItem("bearer_token");
      setAuthUserIfChanged(null);
      setIsAuthenticated(false);
      return false;
    }
  }, [setAuthUserIfChanged, setUser, setWallet]);

  return {
    isAuthenticated,
    isLoading,
    user: authUser,
    logout: handleLogout,
    checkAuthStatus,
  };
}

export default useAuth;
