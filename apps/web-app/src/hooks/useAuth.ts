import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/store/user.store";
import { useNavigate } from "@tanstack/react-router";
import { AuthService } from "@/services/auth.service";
import UserService from "@/services/user.service";
import Cookies from "js-cookie";

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { authUser, setAuthUser, setUser, setWallet, clearUser } =
    useUserStore();
  const navigate = useNavigate();

  const loadUserProfile = useCallback(async () => {
    try {
      const profile = (await UserService.fetchUserProfile()) as any;
      if (profile) {
        if (profile.user) {
          setUser(profile.user);
        }
        if (profile.wallet) {
          setWallet(profile.wallet);
        }
        if (profile.token) {
          Cookies.set("auth-token", profile.token, { expires: 7 });
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  }, [setUser, setWallet]);

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
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (token) {
      Cookies.set("auth-token", token, { expires: 7 });

      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.pathname);
    }

    const loadSession = async () => {
      try {
        const session = await AuthService.getSession();
        if (session?.user) {
          setAuthUserIfChanged(session.user);
          setIsAuthenticated(true);
          await loadUserProfile();
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
  }, [setAuthUserIfChanged, loadUserProfile]);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    loadUserProfile();
  }, [loadUserProfile]);

  const handleLogout = useCallback(async () => {
    await AuthService.signOut();
    Cookies.remove("auth-token");
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
      if (ok) {
        await loadUserProfile();
      }
      return ok;
    } catch {
      setIsAuthenticated(false);
      setAuthUserIfChanged(null);
      return false;
    }
  }, [setAuthUserIfChanged, loadUserProfile]);

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
