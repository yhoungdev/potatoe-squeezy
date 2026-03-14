import React, { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { BASE_API_URL } from "@/constant";
import API_ENDPOINTS from "@/enums/API_ENUM";
function AuthButton() {
  const { session, loading, error } = useAuth();

  useEffect(() => {
    if (session && typeof window !== "undefined") {
      window.location.href = "/app";
    }
  }, [session]);

  const signInWithGithub = async () => {
    try {
      const loginUrl = `${BASE_API_URL}${API_ENDPOINTS.GITHUB_AUTH}`;
      window.location.href = loginUrl;
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
