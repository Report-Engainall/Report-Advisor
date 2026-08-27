import { supabase } from './supabase';
import { fetchReceivablesReportSnapshot, type ReceivablesReportSnapshot } from './receivables-truth';

export type AnalyticsTruthStatus = 'CALCULATED' | 'INSUFFICIENT_DATA';

export interface RfmTruthRow {
  customerId: string; customerName: string; recencyDays: number | null; frequency: number | null;
  monetary: number | null; rScore: number | null; fScore: number | null; mScore: number | null; segment: string;
}
export interface RfmTruth { rows: RfmTruthRow[]; totalRows: number; incompleteRows: number; status: AnalyticsTruthStatus; }
export interface AbcTruthRow {
  productId: string; productName: string; revenue: number | null; cumulativeRevenue: number | null;
  cumulativePct: number | null; class: 'A' | 'B' | 'C' | 'INSUFFICIENT_DATA';
}
export interface AbcTruth { rows: AbcTruthRow[]; totalRows: number; incompleteRows: number; status: AnalyticsTruthStatus; }

export async function fetchRfmTruth(asOfDate?: string): Promise<RfmTruth> {
  const effectiveAsOfDate = asOfDate ?? new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase.rpc('report_rfm_snapshot', { p_as_of_date: effectiveAsOfDate });
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    customer_id: string; customer_name: string; recency_days: number | null; frequency: number | null; monetary: number | null;
    r_score: number | null; f_score: number | null; m_score: number | null; rfm_segment: string;
    total_rows: number; incomplete_rows: number; status: AnalyticsTruthStatus;
  }>;
  const first = rows[0];
  return {
    rows: rows.map((row) => ({
      customerId: row.customer_id, customerName: row.customer_name,
      recencyDays: row.recency_days == null ? null : Number(row.recency_days),
      frequency: row.frequency == null ? null : Number(row.frequency),
      monetary: row.monetary == null ? null : Number(row.monetary),
      rScore: row.r_score == null ? null : Number(row.r_score),
      fScore: row.f_score == null ? null : Number(row.f_score),
      mScore: row.m_score == null ? null : Number(row.m_score), segment: row.rfm_segment,
    })),
    totalRows: Number(first?.total_rows ?? 0), incompleteRows: Number(first?.incomplete_rows ?? 0),
    status: first?.status ?? 'INSUFFICIENT_DATA',
  };
}

export async function fetchAbcTruth(): Promise<AbcTruth> {
  const { data, error } = await supabase.rpc('report_abc_snapshot');
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    product_id: string; product_name: string; revenue: number | null; cumulative_revenue: number | null;
    cumulative_pct: number | null; class: 'A' | 'B' | 'C' | 'INSUFFICIENT_DATA'; total_rows: number; incomplete_rows: number; status: AnalyticsTruthStatus;
  }>;
  const first = rows[0];
  return {
    rows: rows.map((row) => ({
      productId: row.product_id, productName: row.product_name,
      revenue: row.revenue == null ? null : Number(row.revenue),
      cumulativeRevenue: row.cumulative_revenue == null ? null : Number(row.cumulative_revenue),
      cumulativePct: row.cumulative_pct == null ? null : Number(row.cumulative_pct), class: row.class,
    })),
    totalRows: Number(first?.total_rows ?? 0), incompleteRows: Number(first?.incomplete_rows ?? 0),
    status: first?.status ?? 'INSUFFICIENT_DATA',
  };
}

export async function fetchAgingTruth(asOfDate?: string): Promise<ReceivablesReportSnapshot> {
  const effectiveAsOfDate = asOfDate ?? new Date().toISOString().slice(0, 10);
  return fetchReceivablesReportSnapshot(0, 500, effectiveAsOfDate);
}
