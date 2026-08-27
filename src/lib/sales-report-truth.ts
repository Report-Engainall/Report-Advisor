import { supabase } from './supabase';

export interface SalesReportTruth {
  totalSales: number | null;
  invoiceCount: number;
  avgInvoiceValue: number | null;
  totalPaid: number | null;
  collectionRate: number | null;
  status: 'CALCULATED' | 'INSUFFICIENT_DATA';
}

export async function fetchSalesReportTruth(): Promise<SalesReportTruth> {
  const { data, error } = await supabase.rpc('report_sales_truth');
  if (error) throw error;
  const row = (data?.[0] ?? null) as Record<string, unknown> | null;
  if (!row) {
    return {
      totalSales: null,
      invoiceCount: 0,
      avgInvoiceValue: null,
      totalPaid: null,
      collectionRate: null,
      status: 'INSUFFICIENT_DATA',
    };
  }
  const numberOrNull = (value: unknown) => value == null ? null : Number(value);
  return {
    totalSales: numberOrNull(row.total_sales),
    invoiceCount: Number(row.invoice_count ?? 0),
    avgInvoiceValue: numberOrNull(row.avg_invoice_value),
    totalPaid: numberOrNull(row.total_paid),
    collectionRate: numberOrNull(row.collection_rate),
    status: row.status === 'CALCULATED' ? 'CALCULATED' : 'INSUFFICIENT_DATA',
  };
}
