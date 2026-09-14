import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Canonical frontend authentication helpers.
 *
 * Security boundary: database RLS/current_company_id() remains authoritative.
 * The browser session is used only to establish UI state; tenant authority is
 * revalidated through the authenticated current_company_id() RPC before the
 * application becomes ready.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.user ?? null;
}

export async function requireAuthenticatedUser(): Promise<User> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('AUTHENTICATION_REQUIRED');
  return user;
}

export async function hasAuthenticatedSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session?.user);
}

/**
 * Subscribe to auth changes without allowing Supabase's asynchronous
 * INITIAL_SESSION hydration to race the explicit getSession() bootstrap.
 *
 * The callback itself never calls back into Supabase. Events observed while
 * the initial session is hydrating are queued and applied after the canonical
 * getSession() result, preventing a transient null session from replacing a
 * persisted authenticated session during a browser refresh.
 */
export function onAuthStateChange(
  callback: (user: User | null) => void,
): () => void {
  let hydrated = false;
  let pendingUser: User | null | undefined;

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const nextUser = session?.user ?? null;
    if (!hydrated) {
      pendingUser = nextUser;
      return;
    }
    callback(nextUser);
  });

  void getAuthenticatedUser().then((initialUser) => {
    if (hydrated) return;
    hydrated = true;
    callback(initialUser);

    if (pendingUser !== undefined) {
      const initialId = initialUser?.id ?? null;
      const pendingId = pendingUser?.id ?? null;
      if (initialId !== pendingId) callback(pendingUser);
      pendingUser = undefined;
    }
  });

  return () => data.subscription.unsubscribe();
}
