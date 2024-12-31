import React, { useEffect, useState } from "react";
import { supabaseObject } from "../../libs/supabase";
import { FaGithub } from "react-icons/fa";
import browser from "webextension-polyfill";
import { checkSession } from "../utils/auth";

function SignIn() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth state when component mounts
    checkAuthState();

    // Listen for auth state changes
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === "AUTH_SUCCESS") {
        setIsAuthenticated(true);
        setIsLoading(false);
      } else if (message.type === "AUTH_FAILURE") {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    });
  }, []);

  const checkAuthState = async () => {
    try {
      const session = await checkSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error("Error checking auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initiates the GitHub OAuth sign-in process
  const signInWithGithub = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseObject.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: browser.identity.getRedirectURL(),
        },
      });

      if (error) {
        console.error("Error during GitHub sign-in:", error.message);
        throw error;
      }

      if (data?.url) {
        await browser.tabs.create({ url: data.url });
        console.log("GitHub sign-in initiated, redirected to:", data.url);
      }
    } catch (err) {
      console.error("Failed to sign in with GitHub:", err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center h-[100vh]">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="container flex items-center justify-center h-[100vh]">
        <div className="text-center">
          <h2 className="text-xl text-white font-bold mb-4">
            Successfully Authenticated!
          </h2>
          <p className="text-gray-400">You can now use the extension.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        container flex flex-col items-center justify-center h-[100vh]
        bg-gradient-to-b px-[2em] from-black to-orange-600/10
      `}
    >
      <div className="w-full max-w-md p-8 space-y-6 rounded-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-xl text-white font-bold">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your account using GitHub</p>
        </div>

        <button
          className="w-full bg-gray-800 py-2 px-2 flex items-center justify-center gap-4 text-white"
          onClick={signInWithGithub}
          disabled={isLoading}
        >
          <FaGithub className="w-5 h-5 mr-2" />
          {isLoading ? "Signing in..." : "Sign in with GitHub"}
        </button>
      </div>
    </div>
  );
}

export default SignIn;
