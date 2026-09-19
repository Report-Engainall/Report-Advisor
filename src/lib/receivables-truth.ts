import { supabase } from './supabase';

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

export interface ReceivablesReportPage {
  status: 'CALCULATED' | 'NO_DATA';
  page: number;
  page_size: number;
  total_rows: number;
  total_outstanding: number;
  rows: ReceivablesReportRowCanonical[];
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
  return {
    status: payload.status === 'NO_DATA' ? 'NO_DATA' : 'CALCULATED',
    page: Number(payload.page ?? page),
    page_size: Number(payload.page_size ?? pageSize),
    total_rows: Number(payload.total_rows ?? 0),
    total_outstanding: Number(payload.total_outstanding ?? 0),
    rows: payload.rows as ReceivablesReportRowCanonical[],
  };
}

export async function fetchReceivablesExportRows(): Promise<CanonicalExportRow[]> {
  const companyId = await (async () => {
    const { resolveCurrentCompanyId } = await import('./supabase');
    return resolveCurrentCompanyId();
  })();
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
