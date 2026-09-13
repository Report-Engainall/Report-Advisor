import { supabase, resolveCurrentCompanyId } from '../supabase';

export type DashboardEvidenceKpi =
  | 'dashboard.total_sales'
  | 'dashboard.total_cost'
  | 'dashboard.gross_profit'
  | 'dashboard.receivables'
  | 'dashboard.overdue_receivables'
  | 'dashboard.payables'
  | 'dashboard.inventory_value'
  | 'dashboard.invoice_count';

export interface KpiEvidenceSnapshot {
  id: string;
  companyId: string;
  kpiKey: DashboardEvidenceKpi;
  value: number;
  observedAt: string;
  quality: 'verified' | 'estimated' | 'insufficient';
  sourceEvidence: Record<string, unknown>;
}

/** Capture a KPI snapshot from the canonical dashboard source. */
export async function captureDashboardKpiEvidence(
  kpiKey: DashboardEvidenceKpi,
  asOf = new Date().toISOString().slice(0, 10),
  months = 6,
): Promise<KpiEvidenceSnapshot> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');

  const { data, error } = await supabase.rpc('capture_kpi_evidence_snapshot', {
    p_kpi_key: kpiKey,
    p_as_of: asOf,
    p_months: months,
  });
  if (error) throw error;

  const row = data as {
    id?: unknown;
    company_id?: unknown;
    kpi_key?: unknown;
    value?: unknown;
    observed_at?: unknown;
    quality?: unknown;
    source_evidence?: unknown;
  } | null;
  if (!row?.id || String(row.company_id) !== companyId || String(row.kpi_key) !== kpiKey) {
    throw new Error('KPI_EVIDENCE_RESULT_MISMATCH');
  }
  const value = Number(row.value);
  if (!Number.isFinite(value)) throw new Error('KPI_EVIDENCE_VALUE_INVALID');

  return {
    id: String(row.id),
    companyId,
    kpiKey,
    value,
    observedAt: String(row.observed_at),
    quality: row.quality as KpiEvidenceSnapshot['quality'],
    sourceEvidence: (row.source_evidence ?? {}) as Record<string, unknown>,
  };
}
