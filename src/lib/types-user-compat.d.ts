import type { User as SupabaseUser } from '@supabase/supabase-js';

declare module '@/lib/types' {
  export type User = SupabaseUser;
}
