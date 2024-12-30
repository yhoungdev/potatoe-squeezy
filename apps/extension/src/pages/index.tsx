import React from "react";
import { supabaseObject } from "../../libs/supabase";
import { FaGithub } from "react-icons/fa";
import browser from "webextension-polyfill";

function SignIn() {
  // Initiates the GitHub OAuth sign-in process
  const signInWithGithub = async () => {
    try {
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
    }
  };


  const getUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabaseObject.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        throw error;
      }

      console.log("Logged-in user:", user);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  return (
      <div
          className={`
        container flex flex-col items-center justify-center h-[100vh]
        bg-gradient-to-b px-[2em] from-black to-orange-600/10
      `}
      >
        <div className="w-full max-w-md p-8 space-y-6 rounded-lg ">
          <div className="space-y-2 text-center">
            <h1 className="text-xl text-white font-bold">Welcome Back</h1>
            <p className="text-gray-500">Sign in to your account using GitHub</p>
          </div>

          <button
              className="w-full bg-gray-800 py-2 px-2 flex items-center justify-center gap-4 text-white"
              onClick={signInWithGithub}
          >
            <FaGithub className="w-5 h-5 mr-2" />
            Sign in with GitHub
          </button>

          {/*<button*/}
          {/*    className="w-full bg-gray-700 py-2 px-2 flex items-center justify-center gap-4 text-white mt-4"*/}
          {/*    onClick={getUser}*/}
          {/*>*/}
          {/*  Get Current User*/}
          {/*</button>*/}
        </div>
      </div>
  );
}

export default SignIn;
