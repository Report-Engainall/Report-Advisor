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
 * Transitional compatibility value for legacy UI consumers.
 * It is NEVER a default/demo tenant: AuthGate resolves it from the canonical
 * database current_company_id() function before protected UI is rendered.
 * New code should rely on RLS and avoid reading this value directly.
 */
export let COMPANY_ID = '';

export async function resolveCurrentCompanyId(): Promise<string | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    COMPANY_ID = '';
    return null;
  }

  const { data, error } = await supabase.rpc('current_company_id');
  if (error || !data) {
    COMPANY_ID = '';
    return null;
  }

  COMPANY_ID = String(data);
  return COMPANY_ID;
}

export function setCompanyId(companyId: string) {
  COMPANY_ID = companyId;
}

export function clearCompanyId() {
  COMPANY_ID = '';
}

export function getCompanyId(): string | null {
  return COMPANY_ID || null;
}
