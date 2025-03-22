import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useUserStore } from "@/store/user.store";
import { useNavigate } from "@tanstack/react-router";

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = Cookies.get("auth-token");
    return !!token;
  });

  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("auth-token");
    if (!token && isAuthenticated) {
      handleLogout();
    }
  }, [isAuthenticated]);

  const handleLogin = (token: string) => {
    Cookies.set("auth-token", token, {
      secure: true,
      sameSite: "lax",
      expires: 7,
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    Cookies.remove("auth-token");
    clearUser();
    setIsAuthenticated(false);
    navigate({ to: "/" });
  };

  const checkAuthStatus = () => {
    const token = Cookies.get("auth-token");
    const isValid = !!token;
    setIsAuthenticated(isValid);

    if (!isValid) {
      handleLogout();
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    user,
    login: handleLogin,
    logout: handleLogout,
    checkAuthStatus,
  };
}

export default useAuth;
