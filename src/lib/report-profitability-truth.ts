import { supabase } from './supabase';

export interface ProfitabilityCategory {
  categoryId: string | null;
  name: string;
  revenue: number | null;
  costOfSales: number | null;
  grossProfit: number | null;
  marginPct: number | null;
  quantity: number | null;
}
export interface ProfitabilityTruth {
  categories: ProfitabilityCategory[];
  revenue: number | null;
  costOfSales: number | null;
  grossProfit: number | null;
  marginPct: number | null;
  quantity: number | null;
  totalRows: number;
  incompleteRows: number;
  currencyCount: number;
  currency: string | null;
  status: 'CALCULATED' | 'INSUFFICIENT_DATA';
}

export async function fetchProfitabilityTruth(from?: string, to?: string): Promise<ProfitabilityTruth> {
  const { data, error } = await supabase.rpc('report_profitability_truth', { p_from: from ?? null, p_to: to ?? null });
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    category_id: string | null; category_name: string; revenue: number | null;
    cost_of_sales: number | null; gross_profit: number | null; margin_pct: number | null;
    quantity: number | null; total_rows: number; incomplete_rows: number;
    currency_count: number; currency: string | null; status: ProfitabilityTruth['status'];
  }>;
  const total = rows.find((row) => row.category_name === '__TOTAL__');
  return {
    categories: rows.filter((row) => row.category_name !== '__TOTAL__').map((row) => ({
      categoryId: row.category_id, name: row.category_name,
      revenue: row.revenue == null ? null : Number(row.revenue),
      costOfSales: row.cost_of_sales == null ? null : Number(row.cost_of_sales),
      grossProfit: row.gross_profit == null ? null : Number(row.gross_profit),
      marginPct: row.margin_pct == null ? null : Number(row.margin_pct),
      quantity: row.quantity == null ? null : Number(row.quantity),
    })),
    revenue: total?.revenue == null ? null : Number(total.revenue),
    costOfSales: total?.cost_of_sales == null ? null : Number(total.cost_of_sales),
    grossProfit: total?.gross_profit == null ? null : Number(total.gross_profit),
    marginPct: total?.margin_pct == null ? null : Number(total.margin_pct),
    quantity: total?.quantity == null ? null : Number(total.quantity),
    totalRows: Number(total?.total_rows ?? 0),
    incompleteRows: Number(total?.incomplete_rows ?? 0),
    currencyCount: Number(total?.currency_count ?? 0),
    currency: total?.currency ?? null,
    status: total?.status ?? 'INSUFFICIENT_DATA',
  };
}
