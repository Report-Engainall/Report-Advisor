import { supabase, resolveCurrentCompanyId } from './supabase';

export interface CanonicalExecutiveMetrics {
  revenue: number;
  cost: number;
  gross_profit: number;
  gross_margin_pct: number;
  invoice_count: number;
  purchases: number;
  receivables: number;
  payables: number;
  inventory_units: number;
  inventory_value: number;
  reorder_count: number;
  out_of_stock: number;
  active_products: number;
  as_of: string;
}

function finiteNumber(value: unknown, field: string): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error(`REPORT_DATA_UNAVAILABLE: invalid canonical metric '${field}'`);
  return n;
}

export async function fetchCanonicalExecutiveMetrics(options: { from?: string | null; to?: string | null } = {}): Promise<CanonicalExecutiveMetrics | null> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const [{ count: salesCount, error: salesError }, { count: purchaseCount, error: purchaseError }, { count: inventoryCount, error: inventoryError }] = await Promise.all([
    supabase.from('sales_invoices').select('id', { count: 'exact', head: true }),
    supabase.from('purchase_invoices').select('id', { count: 'exact', head: true }),
    supabase.from('inventory_balances').select('id', { count: 'exact', head: true }),
  ]);
  if (salesError) throw salesError;
  if (purchaseError) throw purchaseError;
  if (inventoryError) throw inventoryError;

  if ((salesCount ?? 0) === 0 && (purchaseCount ?? 0) === 0 && (inventoryCount ?? 0) === 0) return null;

  const { data, error } = await supabase.rpc('get_executive_metrics', {
    p_company_id: companyId,
    p_from: options.from ?? null,
    p_to: options.to ?? null,
  });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: canonical executive metrics missing');

  const row = data as Record<string, unknown>;
  return {
    revenue: finiteNumber(row.revenue, 'revenue'),
    cost: finiteNumber(row.cost, 'cost'),
    gross_profit: finiteNumber(row.gross_profit, 'gross_profit'),
    gross_margin_pct: finiteNumber(row.gross_margin_pct, 'gross_margin_pct'),
    invoice_count: finiteNumber(row.invoice_count, 'invoice_count'),
    purchases: finiteNumber(row.purchases, 'purchases'),
    receivables: finiteNumber(row.receivables, 'receivables'),
    payables: finiteNumber(row.payables, 'payables'),
    inventory_units: finiteNumber(row.inventory_units, 'inventory_units'),
    inventory_value: finiteNumber(row.inventory_value, 'inventory_value'),
    reorder_count: finiteNumber(row.reorder_count, 'reorder_count'),
    out_of_stock: finiteNumber(row.out_of_stock, 'out_of_stock'),
    active_products: finiteNumber(row.active_products, 'active_products'),
    as_of: String(row.as_of ?? ''),
  };
}
