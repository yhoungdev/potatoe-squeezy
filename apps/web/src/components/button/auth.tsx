import React, { useEffect } from "react";
import { webSupabase } from "../../../libs/supabase";
import useAuth from "../../hooks/useAuth";

function AuthButton() {
  const { session, loading, error } = useAuth();

  useEffect(() => {
    if (session && typeof window !== "undefined") {
      window.location.href = "/app";
    }
  }, [session]);

  const signInWithGithub = async () => {
    try {
      const { error } = await webSupabase.auth.signInWithOAuth({
        provider: "github",
      });

      if (error) {
        console.error("Error signing in:", error.message);
        alert("Failed to sign in. Please try again.");
      }
    } catch (err) {
      console.error("Unexpected error during sign-in:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
