import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase environment variables');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// Live module binding: existing query modules automatically switch tenant after login.
// This is only a client-side filter; Supabase RLS is the authoritative security boundary.
export let COMPANY_ID = localStorage.getItem('report-advisor.company_id') || '00000000-0000-0000-0000-000000000000';
export function setCompanyId(companyId: string) { COMPANY_ID = companyId; localStorage.setItem('report-advisor.company_id', companyId); }
export function clearCompanyId() { COMPANY_ID = '00000000-0000-0000-0000-000000000000'; localStorage.removeItem('report-advisor.company_id'); }
