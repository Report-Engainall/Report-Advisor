import { supabase, resolveCurrentCompanyId } from './supabase';

export type RFMRow = { customer_id: string; customer_name: string; recency: number; frequency: number; monetary: number; r_score: number; f_score: number; m_score: number; rfm_segment: string };
export type ABCRow = { product_id: string; product_name: string; revenue: number; cumulative: number; cumulative_pct: number; class: string };
export type AgingBucket = { name: string; amount: number; count: number };

async function companyId(): Promise<string> {
  const id = await resolveCurrentCompanyId();
  if (!id) throw new Error('TENANT_REQUIRED');
  return id;
}

function arrayPayload(data: unknown): unknown[] {
  return Array.isArray(data) ? data : [];
}

function finite(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`ANALYTICS_DATA_UNAVAILABLE: invalid '${field}'`);
  return n;
}

export async function fetchRFMAnalysis(asOf?: string): Promise<RFMRow[]> {
  const id = await companyId();
  const { data, error } = await supabase.rpc('get_sales_rfm_truth', { p_company_id: id, p_as_of: asOf ?? null });
  if (error) throw error;
  return arrayPayload(data).map((raw) => {
    const row = raw as Record<string, unknown>;
    return {
      customer_id: String(row.customer_id ?? ''),
      customer_name: String(row.customer_name ?? ''),
      recency: finite(row.recency, 'recency'),
      frequency: finite(row.frequency, 'frequency'),
      monetary: finite(row.monetary, 'monetary'),
      r_score: finite(row.r_score, 'r_score'),
      f_score: finite(row.f_score, 'f_score'),
      m_score: finite(row.m_score, 'm_score'),
      rfm_segment: String(row.rfm_segment ?? ''),
    };
  });
}

export async function fetchABCAnalysis(): Promise<ABCRow[]> {
  const id = await companyId();
  const { data, error } = await supabase.rpc('get_sales_abc_truth', { p_company_id: id });
  if (error) throw error;
  return arrayPayload(data).map((raw) => {
    const row = raw as Record<string, unknown>;
    return {
      product_id: String(row.product_id ?? ''),
      product_name: String(row.product_name ?? ''),
      revenue: finite(row.revenue, 'revenue'),
      cumulative: finite(row.cumulative, 'cumulative'),
      cumulative_pct: finite(row.cumulative_pct, 'cumulative_pct'),
      class: String(row.class ?? ''),
    };
  });
}

export async function fetchAgingAnalysis(asOf?: string): Promise<AgingBucket[]> {
  const id = await companyId();
  const { data, error } = await supabase.rpc('get_receivables_aging_truth_as_of', { p_company_id: id, p_as_of: asOf ?? null });
  if (error) throw error;
  const payload = (data ?? {}) as { rows?: unknown[]; status?: string };
  if (payload.status === 'INSUFFICIENT_DATA') throw new Error('ANALYTICS_DATA_UNAVAILABLE: receivables aging is incomplete');
  return arrayPayload(payload.rows).map((raw) => {
    const row = raw as Record<string, unknown>;
    return { name: String(row.bucket ?? 'UNDATED'), amount: finite(row.amount, 'aging amount'), count: finite(row.count, 'aging count') };
  });
}
