import { supabase, clearCompanyId, setCompanyId } from './supabase';

export interface TenantMembership {
  company_id: string;
  role: string;
  status: string;
  company?: { id: string; name: string } | null;
}

/**
 * The local company id is only a UX hint. This bootstrap verifies it against
 * the authenticated user's membership before any tenant-scoped query runs.
 * RLS remains the authoritative boundary.
 */
export async function resolveTenantContext(preferredCompanyId?: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    clearCompanyId();
    return { user: null, memberships: [] as TenantMembership[], active: null as TenantMembership | null };
  }

  const { data, error } = await supabase
    .from('tenant_memberships')
    .select('company_id, role, status, company:companies(id,name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) throw error;
  const memberships = (data ?? []) as TenantMembership[];
  const active = memberships.find(m => m.company_id === preferredCompanyId) ?? memberships[0] ?? null;

  if (active) setCompanyId(active.company_id);
  else clearCompanyId();

  return { user, memberships, active };
}

export function isTenantSelected(companyId: string | null | undefined, memberships: TenantMembership[]) {
  return !!companyId && memberships.some(m => m.company_id === companyId && m.status === 'active');
}
