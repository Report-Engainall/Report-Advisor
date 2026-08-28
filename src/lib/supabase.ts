import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Canonical browser client.
 * The publishable key is preferred; the legacy anon key remains a compatibility
 * fallback while Supabase transitions key formats. RLS is the authoritative
 * data-security boundary.
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Resolve the authenticated user's tenant exclusively through the database
 * authority. Identity is verified by Auth before asking the database for the
 * current company; no browser-selected tenant is trusted here.
 */
export async function resolveCurrentCompanyId(): Promise<string | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const { data, error } = await supabase.rpc('current_company_id');
  if (error || !data) return null;

  return String(data);
}
