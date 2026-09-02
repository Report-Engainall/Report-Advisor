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

export function onAuthStateChange(
  callback: (user: User | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => data.subscription.unsubscribe();
}
