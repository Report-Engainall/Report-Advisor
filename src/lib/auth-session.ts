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
 * Subscribe only to subsequent auth changes. AuthGate owns the single
 * canonical initial getSession() hydration and passes that result here,
 * avoiding duplicate bootstrap RPCs and INITIAL_SESSION races.
 *
 * Supabase documents a client deadlock when async Supabase work is started
 * from inside the onAuthStateChange callback. Defer the consumer callback
 * until the auth callback has returned so tenant/RPC reads cannot deadlock
 * the shared browser client.
 */
export function onAuthStateChange(
  callback: (user: User | null) => void,
  initialUser?: User | null,
): () => void {
  let initialResolved = initialUser !== undefined;
  let queuedUser: User | null | undefined;
  let active = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  const deferCallback = (user: User | null) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (active) callback(user);
    }, 0);
    timers.add(timer);
  };

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const nextUser = session?.user ?? null;
    if (!initialResolved) {
      queuedUser = nextUser;
      return;
    }
    deferCallback(nextUser);
  });

  if (initialUser !== undefined) {
    deferCallback(initialUser);
  } else {
    void getAuthenticatedUser().then((user) => {
      if (!active || initialResolved) return;
      initialResolved = true;
      deferCallback(user);

      if (queuedUser !== undefined) {
        const initialId = user?.id ?? null;
        const queuedId = queuedUser?.id ?? null;
        if (initialId !== queuedId) deferCallback(queuedUser);
        queuedUser = undefined;
      }
    });
  }

  return () => {
    active = false;
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
    data.subscription.unsubscribe();
  };
}
