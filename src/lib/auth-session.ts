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
 * Subscribe to auth changes without allowing INITIAL_SESSION to race the
 * canonical bootstrap. AuthGate owns the single initial hydration call; this
 * listener only applies subsequent auth changes.
 */
export function onAuthStateChange(
  callback: (user: User | null) => void,
): () => void {
  let initialResolved = false;
  let queuedUser: User | null | undefined;

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const nextUser = session?.user ?? null;
    if (!initialResolved) {
      queuedUser = nextUser;
      return;
    }
    callback(nextUser);
  });

  void getAuthenticatedUser().then((initialUser) => {
    if (initialResolved) return;
    initialResolved = true;
    callback(initialUser);

    if (queuedUser !== undefined) {
      const initialId = initialUser?.id ?? null;
      const queuedId = queuedUser?.id ?? null;
      if (initialId !== queuedId) callback(queuedUser);
      queuedUser = undefined;
    }
  });

  return () => data.subscription.unsubscribe();
}
