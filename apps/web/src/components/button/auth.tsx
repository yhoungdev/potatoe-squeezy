import React from "react";
import { webSupabase } from "../../../libs/supabase.ts";

function AuthButton() {
  const SignInWithGithub = async () => {
    const signIn = await webSupabase.auth.signInWithOAuth({
      provider: "github",
    });
  };

  return (
    <div>
      <button
        className=" rounded-xl mx-auto flex items-center gap-2 justify-center bg-gray-800 w-fit px-4 py-2"
        onClick={SignInWithGithub}
      >
        Sign in with Github
      </button>
    </div>
  );
}
export default AuthButton;
