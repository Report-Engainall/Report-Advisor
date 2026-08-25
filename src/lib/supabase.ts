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
 * Legacy compatibility surface. It is intentionally nullable: there is no
 * longer a silent fallback to the demo company. New production code must use
 * authenticated session context and database RLS for tenant authorization.
 */
let activeCompanyId: string | null = null;

export function setCompanyId(companyId: string) {
  activeCompanyId = companyId;
}

export function clearCompanyId() {
  activeCompanyId = null;
}

export function getCompanyId(): string | null {
  return activeCompanyId;
}
