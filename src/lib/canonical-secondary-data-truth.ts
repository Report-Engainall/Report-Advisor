import { supabase, resolveCurrentCompanyId } from './supabase';

export interface CanonicalTopEntity { id: string; name: string; value: number | null; secondary?: number | null; }
export interface CanonicalCategoryBreakdown { name: string; sales: number | null; profit: number | null; quantity: number | null; }
export interface CanonicalAgingBucket { bucket: string; amount: number; count: number; }
export type CanonicalSecondaryStatus = 'CALCULATED' | 'INSUFFICIENT_DATA';

function finiteOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function tenantId(): Promise<string> {
  const id = await resolveCurrentCompanyId();
  if (!id) throw new Error('TENANT_REQUIRED');
  return id;
}

export async function fetchCanonicalMonthlyTrend(months = 6) {
  const companyId = await tenantId();
  const { data, error } = await supabase.rpc('get_sales_monthly_truth', { p_company_id: companyId, p_months: months });
  if (error) throw error;
  const rows = Array.isArray(data) ? data as Array<{month:string;sales:number|null;cost:number|null;profit:number|null;invoices:number;status:string}> : [];
  return rows.map(r => ({ month: r.month, label: r.month, sales: finiteOrNull(r.sales), cost: finiteOrNull(r.cost), profit: finiteOrNull(r.profit), invoices: Number(r.invoices ?? 0), status: r.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' as const : 'CALCULATED' as const }));
}

async function secondaryRpc(name: string, params: Record<string, unknown>): Promise<{ status: CanonicalSecondaryStatus; rows: unknown[] }> {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw error;
  const payload = (data ?? {}) as { status?: string; rows?: unknown[] };
  return { status: payload.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED', rows: Array.isArray(payload.rows) ? payload.rows : [] };
}

export async function fetchCanonicalTopCustomers(limit = 5): Promise<CanonicalTopEntity[]> {
  const companyId = await tenantId();
  const result = await secondaryRpc('get_sales_top_customers', { p_company_id: companyId, p_limit: limit });
  return result.rows.map((r) => {
    const row = r as { id?: unknown; name?: unknown; value?: unknown; secondary?: unknown };
    return { id: String(row.id ?? ''), name: String(row.name ?? ''), value: finiteOrNull(row.value), secondary: finiteOrNull(row.secondary) };
  });
}

export async function fetchCanonicalTopProducts(limit = 5): Promise<CanonicalTopEntity[]> {
  const companyId = await tenantId();
  const result = await secondaryRpc('get_sales_top_products', { p_company_id: companyId, p_limit: limit });
  return result.rows.map((r) => {
    const row = r as { id?: unknown; name?: unknown; value?: unknown; secondary?: unknown };
    return { id: String(row.id ?? ''), name: String(row.name ?? ''), value: finiteOrNull(row.value), secondary: finiteOrNull(row.secondary) };
  });
}

export async function fetchCanonicalCategoryBreakdown(): Promise<CanonicalCategoryBreakdown[]> {
  const companyId = await tenantId();
  const result = await secondaryRpc('get_sales_category_breakdown', { p_company_id: companyId });
  return result.rows.map((r) => {
    const row = r as { name?: unknown; sales?: unknown; profit?: unknown; quantity?: unknown };
    return { name: String(row.name ?? 'غير مصنف'), sales: finiteOrNull(row.sales), profit: finiteOrNull(row.profit), quantity: finiteOrNull(row.quantity) };
  });
}

export async function fetchCanonicalAgingBuckets(): Promise<CanonicalAgingBucket[]> {
  const companyId = await tenantId();
  const result = await secondaryRpc('get_receivables_aging_truth', { p_company_id: companyId });
  return result.rows.map((r) => {
    const row = r as { bucket?: unknown; amount?: unknown; count?: unknown };
    return { bucket: String(row.bucket ?? 'UNDATED'), amount: finiteOrNull(row.amount) ?? 0, count: Number(row.count ?? 0) };
  });
}
