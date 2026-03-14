import React, { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { AuthService } from "@/services/auth.service";
function AuthButton() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      window.location.href = "/app";
    }
  }, [isAuthenticated]);

  const signInWithGithub = async () => {
    try {
      const callbackURL = `${window.location.origin}/app`;
      const { url } = await AuthService.signInWithGithub(callbackURL);
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
