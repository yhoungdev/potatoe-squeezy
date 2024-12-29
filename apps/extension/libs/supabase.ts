import initializeSupabase from "../../../libs/supabase";

// @ts-ignore
const env = import.meta.env;
export const supabaseObject = initializeSupabase(
  env.VITE_APP_PROJECT_URL,
  env.VITE_APP_PRIVATE_KEY
);
