import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_PROJECT_URL;
const supabaseKey = import.meta.env.PUBLIC_APP_PRIVATE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export default supabase;
