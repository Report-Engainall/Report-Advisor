import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import type { SaleEvent } from './sales-velocity-engine';

/** Canonical tenant-scoped sales events for deterministic velocity analysis. */
export async function fetchSalesVelocityEvents(days = 365): Promise<SaleEvent[]> {
  if (!Number.isFinite(days) || !Number.isInteger(days) || days <= 0 || days > 3650) {
    throw new Error('Invalid sales velocity analysis window');
  }
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 86400000);
  const { data, error } = await supabase.rpc('sales_velocity_events', {
    p_company_id: companyId,
    p_from: from.toISOString().slice(0, 10),
    p_to: to.toISOString().slice(0, 10),
  });
  if (error) throw error;

  return (data ?? [])
    .filter((row) =>
      row?.product_id &&
      row?.event_date &&
      Number.isFinite(Number(row?.quantity)) &&
      Number.isFinite(Number(row?.net_value)),
    )
    .map((row) => ({
      productId: String(row.product_id),
      date: String(row.event_date),
      quantity: Number(row.quantity),
      netValue: Number(row.net_value),
    }));
}
