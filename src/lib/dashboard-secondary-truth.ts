import { supabase } from './supabase';

export interface DashboardSecondaryTruth {
  status: 'CALCULATED' | 'INSUFFICIENT_DATA';
  incompleteRows: number;
  trend: Array<{ month: string; sales: number | null; cost: number | null; profit: number | null; invoices: number }>;
  topCustomers: Array<{ id: string; name: string; value: number | null }>;
  topProducts: Array<{ id: string; name: string; value: number | null; secondary: number | null }>;
  categories: Array<{ name: string; sales: number | null; profit: number | null; quantity: number | null }>;
}

export async function fetchDashboardSecondaryTruth(months = 6): Promise<DashboardSecondaryTruth> {
  if (!Number.isInteger(months) || months < 1 || months > 12) throw new Error('REPORT_QUERY_INVALID_MONTHS');
  const { data, error } = await supabase.rpc('report_dashboard_secondary_truth', { p_months: months });
  if (error) throw error;
  const row = (data ?? null) as any;
  if (!row) return { status: 'INSUFFICIENT_DATA', incompleteRows: 0, trend: [], topCustomers: [], topProducts: [], categories: [] };
  return {
    status: row.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED',
    incompleteRows: Number(row.incompleteRows ?? 0),
    trend: Array.isArray(row.trend) ? row.trend.map((x: any) => ({ month: String(x.month), sales: x.sales == null ? null : Number(x.sales), cost: x.cost == null ? null : Number(x.cost), profit: x.profit == null ? null : Number(x.profit), invoices: Number(x.invoices ?? 0) })) : [],
    topCustomers: Array.isArray(row.topCustomers) ? row.topCustomers.map((x: any) => ({ id: String(x.id), name: String(x.name), value: x.value == null ? null : Number(x.value) })) : [],
    topProducts: Array.isArray(row.topProducts) ? row.topProducts.map((x: any) => ({ id: String(x.id), name: String(x.name), value: x.value == null ? null : Number(x.value), secondary: x.secondary == null ? null : Number(x.secondary) })) : [],
    categories: Array.isArray(row.categories) ? row.categories.map((x: any) => ({ name: String(x.name), sales: x.sales == null ? null : Number(x.sales), profit: x.profit == null ? null : Number(x.profit), quantity: x.quantity == null ? null : Number(x.quantity) })) : [],
  };
}
