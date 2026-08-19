import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase environment variables');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// Compatibility value for existing query modules. It is selected only after authentication.
// Database RLS remains the authoritative tenant boundary; changing this value cannot grant access.
export const COMPANY_ID = localStorage.getItem('report-advisor.company_id') || '00000000-0000-0000-0000-000000000000';
export function setCompanyId(companyId: string) { localStorage.setItem('report-advisor.company_id', companyId); }
export function clearCompanyId() { localStorage.removeItem('report-advisor.company_id'); }
