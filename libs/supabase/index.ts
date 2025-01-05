import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * @param {string} supabaseUrl - The Supabase project URL.
 * @param {string} supabaseAnonKey - The Supabase public anonymous key.
 * @returns {SupabaseClient} The initialized Supabase client.
 */
const initializeSupabase = (
  supabaseUrl: string,
  supabaseAnonKey: string
): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and Anon Key are required to initialize the client."
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export default initializeSupabase;
