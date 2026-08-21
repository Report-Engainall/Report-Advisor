import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase environment variables');
export const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
export const COMPANY_ID = 'a0000000-0000-0000-0000-000000000001';
let activeCompanyId = COMPANY_ID;
export function setCompanyId(companyId:string){ activeCompanyId=companyId; }
export function clearCompanyId(){ activeCompanyId=COMPANY_ID; }
export function getCompanyId(){ return activeCompanyId; }
