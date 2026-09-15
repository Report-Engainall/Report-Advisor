import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Canonical frontend authentication helpers.
 *
 * Security boundary: database RLS/current_company_id() remains authoritative.
 * These helpers prevent UI code from treating a demo company or hard-coded
 * identity as an authenticated tenant context.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
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
 * Subscribe to auth changes without starting async Supabase work inside the
 * onAuthStateChange callback. Supabase documents a client deadlock when an
 * async Supabase call is made from that callback. Defer the consumer until
 * the auth callback has returned so tenant/RPC reads cannot deadlock the
 * shared browser client.
 */
export function onAuthStateChange(
  callback: (user: User | null) => void,
): () => void {
  let active = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (active) callback(session?.user ?? null);
    }, 0);
    timers.add(timer);
  });

  return () => {
    active = false;
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
    data.subscription.unsubscribe();
  };
}
