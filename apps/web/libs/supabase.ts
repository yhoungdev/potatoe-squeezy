import initializeSupabase from "../../../libs/supabase";

const env = import.meta.env;
export const webSupabase = initializeSupabase(
  env.PUBLIC_PROJECT_URL,
  env.PUBLIC_APP_PRIVATE_KEY
);
