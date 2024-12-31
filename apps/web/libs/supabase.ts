import initializeSupabase from "../../../libs/supabase";

const env = import.meta.env;
export const webSupabase =
    initializeSupabase(env.PUBLIC_APP_PRIVATE_KEY, env.PUBLIC_PROJECT_URL);
