import { supabase } from './supabase';

/**
 * Tenant-native data-quality reads. RLS/current tenant context remains the
 * authorization boundary; this module does not accept a client tenant id.
 *
 * These are display inputs for the existing DataQualityPage, not a source of
 * business truth. Until the page is migrated to a server-side quality snapshot,
 * each collection is explicitly bounded and fails closed instead of silently
 * calculating a partial quality score.
 */
export interface DataQualityDatasets {
  customers: Record<string, unknown>[];
  products: Record<string, unknown>[];
  invoices: Record<string, unknown>[];
  balances: Record<string, unknown>[];
}
const MAX_QUALITY_ROWS = 500;
export async function fetchDataQualityDatasets(): Promise<DataQualityDatasets> {
  const [customersRes, productsRes, invoicesRes, balancesRes] = await Promise.all([
    supabase.from('customers').select('name,phone,code', { count: 'exact' }).range(0, MAX_QUALITY_ROWS - 1),
    supabase.from('products').select('sku,name,cost_price,selling_price,reorder_point', { count: 'exact' }).range(0, MAX_QUALITY_ROWS - 1),
    supabase.from('sales_invoices').select('total,paid_amount,customer_id,invoice_date,invoice_number', { count: 'exact' }).range(0, MAX_QUALITY_ROWS - 1),
    supabase.from('inventory_balances').select('quantity,unit_cost,product_id,warehouse_id', { count: 'exact' }).range(0, MAX_QUALITY_ROWS - 1),
  ]);
  const firstError = customersRes.error || productsRes.error || invoicesRes.error || balancesRes.error;
  if (firstError) throw firstError;
  const counts = { customers: customersRes.count ?? 0, products: productsRes.count ?? 0, invoices: invoicesRes.count ?? 0, balances: balancesRes.count ?? 0 };
  const oversized = Object.entries(counts).find(([, count]) => count > MAX_QUALITY_ROWS);
  if (oversized) throw new Error(`REPORT_QUERY_LIMIT_EXCEEDED: data-quality ${oversized[0]} require a server-side quality snapshot`);
  return { customers: (customersRes.data || []) as Record<string, unknown>[], products: (productsRes.data || []) as Record<string, unknown>[], invoices: (invoicesRes.data || []) as Record<string, unknown>[], balances: (balancesRes.data || []) as Record<string, unknown>[] };
}
