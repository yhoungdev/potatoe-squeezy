import React from "react";
import { supabaseObject } from "../../libs/supabase";
import Button from "../components/ui/button";
//@ts-ignore
import { FaGithub } from "react-icons/fa";

function SignIn() {
  const signInWithGithub = async () => {
    const { data, error } = await supabaseObject.auth.signInWithOAuth({
      provider: 'github'

    });

    window.open(data?.url);
  }
  return (
      <div
          className={`
            container flex flex-col items-center justify-center h-[100vh]
            bg-gradient-to-b  px-[2em]from-black to-orange-600/10
        `}
      >
        <div className="w-full max-w-md p-8 space-y-6 rounded-lg ">
          <div className="space-y-2 text-center">
            <h1 className="text-xl text-white font-bold">Welcome Back</h1>
            <p className="text-gray-500">Sign in to your account using GitHub</p>
          </div>

          <button
              className="w-full
        bg-gray-800 py-2 px-2  flex items-center justify-center gap-4 text-white"
              onClick={signInWithGithub}
          >
            <FaGithub className="w-5 h-5 mr-2" />
            Sign in with GitHub
          </button>
        </div>
      </div>
  );
}

export default SignIn;
