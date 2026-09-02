import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Canonical browser client.
 * Session persistence is enabled so authenticated tenant membership can be
 * resolved consistently across navigation/reloads. RLS and the database
 * current_company_id() resolver remain the authoritative security boundary.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Resolve the authenticated user's tenant exclusively through the database
 * authority. No mutable module-level tenant id, demo id, browser fallback, or
 * client-selected tenant is retained here.
 */
export async function resolveCurrentCompanyId(): Promise<string | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) return null;

  const { data, error } = await supabase.rpc('current_company_id');
  if (error || !data) return null;

  return String(data);
}
