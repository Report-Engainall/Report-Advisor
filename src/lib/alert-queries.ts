import { supabase, resolveCurrentCompanyId } from './supabase';

/**
 * Canonical alert mutation boundary.
 * Tenant authority comes from the authenticated session, never from caller input.
 */
export async function markAlertRead(id: string): Promise<void> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const { error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('id', id)
    .eq('company_id', companyId);

  if (error) throw error;
}
