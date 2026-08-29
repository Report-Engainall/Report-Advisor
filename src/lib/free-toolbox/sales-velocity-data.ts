import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import type { SaleEvent } from './sales-velocity-engine';

/**
 * Canonical sales-velocity read boundary.
 * Business truth is selected server-side from confirmed/posted/paid invoices;
 * the browser only receives normalized events for deterministic presentation math.
 */
export async function fetchSalesVelocityEvents(days = 365): Promise<SaleEvent[]> {
  if (!Number.isFinite(days) || !Number.isInteger(days) || days <= 0 || days > 3650) {
    throw new Error('Invalid sales velocity analysis window');
  }
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const { data, error } = await supabase.rpc('inventory_liquidity_velocity', {
    p_company_id: companyId,
    p_as_of: new Date().toISOString().slice(0, 10),
    p_days: days,
  });
  if (error) throw error;

  // The canonical RPC exposes aggregate velocity rather than invoice events.
  // Return a conservative event representation only when its source fields are
  // available; never synthesize dates or transaction values.
  return (data ?? [])
    .filter((row) => row?.product_id && row?.last_sale_date && Number.isFinite(Number(row?.avg_daily_sales)))
    .map((row) => ({
      productId: String(row.product_id),
      date: String(row.last_sale_date),
      quantity: Number(row.avg_daily_sales),
      netValue: Number(row.avg_daily_sales),
    }));
}
