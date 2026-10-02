import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const AUTH_RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const AUTH_MAX_ATTEMPTS = 3;
const AUTH_TIMEOUT_MS = 20000;
const wait = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));

async function authResilientFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (!url.includes('/auth/v1/token')) return fetch(input, init);

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= AUTH_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(new Error('AUTH_REQUEST_TIMEOUT')), AUTH_TIMEOUT_MS);
    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      if (!AUTH_RETRYABLE_STATUS.has(response.status) || attempt === AUTH_MAX_ATTEMPTS) return response;
      lastError = new Error('AUTH_RETRYABLE_HTTP_' + response.status);
    } catch (error) {
      lastError = error;
      if (attempt === AUTH_MAX_ATTEMPTS) throw error;
    } finally {
      window.clearTimeout(timer);
    }
    await wait(Math.min(4000, 500 * 2 ** (attempt - 1)));
  }

  throw lastError instanceof Error ? lastError : new Error('AUTH_RETRY_EXHAUSTED');
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
  global: {
    fetch: authResilientFetch,
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
