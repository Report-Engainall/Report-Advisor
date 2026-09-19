import { supabase, resolveCurrentCompanyId } from './supabase';

export interface ReceivablesReportRow {
  id: string;
  company_id: string;
  customer_id: string | null;
  invoice_number: string;
  invoice_date: string | null;
  due_date: string | null;
  total: number | null;
  paid_amount: number | null;
  outstanding: number | null;
  bucket: '0-30' | '31-60' | '61-90' | '90+' | 'UNDATED';
}

export type ReceivablesReportRowCanonical = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  total: number | null;
  paid_amount: number | null;
  balance: number;
  status: string | null;
  customer: { id: string | null; name: string | null } | null;
};

export interface ReceivablesTruthProvenance {
  source: 'sales_invoices';
  formula: string;
  tenant_id: string;
  as_of: string;
  freshness: 'query_time';
  period: { kind: 'as_of'; as_of_date: string };
  evidence: { rpc: 'get_receivables_report_page'; filter: string };
}
export interface ReceivablesReportPage {
  status: 'CALCULATED' | 'NO_DATA';
  page: number;
  page_size: number;
  total_rows: number;
  total_outstanding: number;
  rows: ReceivablesReportRowCanonical[];
  provenance: ReceivablesTruthProvenance;
}

export type CanonicalExportRow = { [key: string]: string | number | null };

export interface ReceivablesReportSnapshot {
  rows: ReceivablesReportRow[];
  totalRows: number;
  totalOutstanding: number | null;
  undatedRows: number;
  buckets: Record<'0-30' | '31-60' | '61-90' | '90+', number>;
  status: 'CALCULATED' | 'INSUFFICIENT_DATA';
}

export async function fetchReceivablesReportSnapshot(page = 0, pageSize = 25, asOfDate?: string): Promise<ReceivablesReportSnapshot> {
  if (!Number.isInteger(page) || page < 0) throw new Error('REPORT_QUERY_INVALID_PAGE');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 500) throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');

  const { data, error } = await supabase.rpc('report_receivables_snapshot', {
    p_page: page,
    p_page_size: pageSize,
    ...(asOfDate ? { p_as_of_date: asOfDate } : {}),
  });
  if (error) throw error;

  const rows = (data ?? []) as Array<ReceivablesReportRow & {
    total_rows: number;
    total_outstanding: number | null;
    undated_rows: number;
    bucket_0_30: number;
    bucket_31_60: number;
    bucket_61_90: number;
    bucket_90_plus: number;
    status: ReceivablesReportSnapshot['status'];
  }>;
  const first = rows[0];
  const totalRows = Number(first?.total_rows ?? 0);
  const totalOutstanding = first?.total_outstanding == null ? null : Number(first.total_outstanding);

  return {
    rows: rows.map(({ total_rows: _a, total_outstanding: _b, undated_rows: _c, bucket_0_30: _d, bucket_31_60: _e, bucket_61_90: _f, bucket_90_plus: _g, status: _h, ...row }) => row),
    totalRows,
    totalOutstanding,
    undatedRows: Number(first?.undated_rows ?? 0),
    buckets: {
      '0-30': Number(first?.bucket_0_30 ?? 0),
      '31-60': Number(first?.bucket_31_60 ?? 0),
      '61-90': Number(first?.bucket_61_90 ?? 0),
      '90+': Number(first?.bucket_90_plus ?? 0),
    },
    status: first?.status ?? 'INSUFFICIENT_DATA',
  };
}

export async function fetchReceivablesReportPage(page = 0, pageSize = 25): Promise<ReceivablesReportPage> {
  if (!Number.isInteger(page) || page < 0) throw new Error('REPORT_QUERY_INVALID_PAGE');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');
  const { data, error } = await supabase.rpc('get_receivables_report_page', { p_page: page, p_page_size: pageSize });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: receivables snapshot missing');
  const payload = data as Record<string, unknown>;
  if (!Array.isArray(payload.rows)) throw new Error('REPORT_DATA_UNAVAILABLE: receivables rows missing');
  const requiredString = (value: unknown, field: string): string => {
    if (typeof value !== 'string' || value.trim() === '') throw new Error(`REPORT_DATA_UNAVAILABLE: receivables ${field} missing`);
    return value;
  };
  const provenance = payload.provenance;
  if (!provenance || typeof provenance !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: receivables provenance missing');
  const p = provenance as Record<string, unknown>;
  const period = p.period;
  const evidence = p.evidence;
  if (!period || typeof period !== 'object' || !evidence || typeof evidence !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: receivables provenance incomplete');
  const periodObj = period as Record<string, unknown>;
  const evidenceObj = evidence as Record<string, unknown>;
  if (p.source !== 'sales_invoices' || p.freshness !== 'query_time' || periodObj.kind !== 'as_of' || evidenceObj.rpc !== 'get_receivables_report_page') {
    throw new Error('REPORT_DATA_UNAVAILABLE: receivables provenance contract mismatch');
  }
  if (!Array.isArray(payload.rows)) throw new Error('REPORT_DATA_UNAVAILABLE: receivables rows missing');
  if (typeof payload.total_rows !== 'number' || !Number.isFinite(payload.total_rows)) throw new Error('REPORT_DATA_UNAVAILABLE: receivables total_rows missing');
  if (typeof payload.total_outstanding !== 'number' || !Number.isFinite(payload.total_outstanding)) throw new Error('REPORT_DATA_UNAVAILABLE: receivables total_outstanding missing');
  if (typeof payload.page !== 'number' || !Number.isInteger(payload.page)) throw new Error('REPORT_DATA_UNAVAILABLE: receivables page missing');
  if (typeof payload.page_size !== 'number' || !Number.isInteger(payload.page_size)) throw new Error('REPORT_DATA_UNAVAILABLE: receivables page_size missing');
  const asOf = requiredString(p.as_of, 'as_of');
  const tenantId = requiredString(p.tenant_id, 'tenant_id');
  const asOfDate = requiredString(periodObj.as_of_date, 'period.as_of_date');
  const formula = requiredString(p.formula, 'formula');
  const filter = requiredString(evidenceObj.filter, 'evidence.filter');
  return {
    status: payload.status === 'NO_DATA' ? 'NO_DATA' : 'CALCULATED',
    page: payload.page,
    page_size: payload.page_size,
    total_rows: payload.total_rows,
    total_outstanding: payload.total_outstanding,
    rows: payload.rows as ReceivablesReportRowCanonical[],
    provenance: {
      source: 'sales_invoices',
      formula,
      tenant_id: tenantId,
      as_of: asOf,
      freshness: 'query_time',
      period: { kind: 'as_of', as_of_date: asOfDate },
      evidence: { rpc: 'get_receivables_report_page', filter },
    },
  };
}

export async function fetchReceivablesExportRows(): Promise<CanonicalExportRow[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.rpc('get_receivables_export_rows', {
    p_company_id: companyId,
    p_max_rows: 10000,
  });
  if (error) throw error;
  const payload = (data ?? {}) as Record<string, unknown>;
  if (!Array.isArray(payload.rows)) throw new Error('REPORT_DATA_UNAVAILABLE: receivables export rows missing');
  return payload.rows as CanonicalExportRow[];
}
