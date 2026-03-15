import React, { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { AuthService } from "@/services/auth.service";
import { useNavigate } from "@tanstack/react-router";
function AuthButton() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      navigate({ to: "/app", replace: true });
    }
  }, [isAuthenticated, navigate]);

  const signInWithGithub = async () => {
    try {
      const callbackURL = import.meta.env.VITE_GITHUB_OAUTH_CALLBACK_URL || `${window.location.origin}/callback/github`;
      const errorCallbackURL = `${window.location.origin}/status/error`;
      const { url } = await AuthService.signInWithGithub({
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
      });
      window.location.href = url;
    } catch (err) {
      console.error("Unexpected error during sign-in:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <button
        className="rounded-xl mx-auto flex items-center gap-2 justify-center bg-gray-800 w-fit px-4 py-2"
        onClick={signInWithGithub}
      >
        Sign in with Github
      </button>
    </div>
  );
}

export default AuthButton;
