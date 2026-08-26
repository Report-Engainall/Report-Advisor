import { supabase } from './supabase';

export type GrossProfitDateRange = { startDate?: string; endDate?: string };
export type GrossProfitStatus = 'CALCULATED' | 'INSUFFICIENT_DATA';

export interface GrossProfitTruth {
  revenue: number;
  cost: number | null;
  grossProfit: number | null;
  quantity: number;
  invoiceCount: number;
  status: GrossProfitStatus;
  tenantIds: string[];
  dateRange: { startDate: string | null; endDate: string | null };
}

/**
 * Canonical repository contract:
 * - Revenue is the stored sales_invoices.total for approved sales documents.
 * - total is the persisted post-discount invoice amount and the schema stores tax separately as tax_amount;
 *   the current repository semantic contract treats total as the recorded sales amount, therefore tax remains
 *   included in the canonical recorded revenue. This is a repository contract, not a statutory-tax opinion.
 * - Cost is SUM(sale_items.cost_price * quantity). A missing cost makes cost and gross profit NULL (never zero).
 * - Date boundaries are inclusive on invoice_date.
 * - Draft invoices are excluded; confirmed/posted/paid are the approved statuses defined by the core schema.
 */
export function calculateGrossProfitTruth(rows: Array<{
  company_id?: string | null;
  invoice_date: string;
  status: string;
  total: number | string | null;
  quantity: number | string | null;
  cost_price: number | string | null;
}>, range: GrossProfitDateRange = {}): GrossProfitTruth {
  const start = range.startDate ?? null;
  const end = range.endDate ?? null;
  const approved = rows.filter(row => {
    if (!['confirmed', 'posted', 'paid'].includes(String(row.status).toLowerCase())) return false;
    if (start && row.invoice_date < start) return false;
    if (end && row.invoice_date > end) return false;
    return true;
  });

  const revenue = approved.reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  const quantity = approved.reduce((sum, row) => sum + Number(row.quantity ?? 0), 0);
  const hasMissingCost = approved.some(row => row.cost_price === null || row.cost_price === undefined || row.cost_price === '');
  const cost = hasMissingCost ? null : approved.reduce((sum, row) => sum + Number(row.cost_price) * Number(row.quantity ?? 0), 0);

  return {
    revenue,
    cost,
    grossProfit: cost === null ? null : revenue - cost,
    quantity,
    invoiceCount: new Set(approved.map(row => row.invoice_date + ':' + String(row.company_id ?? ''))).size,
    status: approved.length === 0 || cost === null ? 'INSUFFICIENT_DATA' : 'CALCULATED',
    tenantIds: [...new Set(approved.map(row => row.company_id).filter((id): id is string => Boolean(id)))],
    dateRange: { startDate: start, endDate: end },
  };
}

async function fetchAll<T>(table: string, columns: string, pageSize = 1000): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + pageSize - 1);
    if (error) throw error;
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

export async function fetchGrossProfitTruth(range: GrossProfitDateRange = {}): Promise<GrossProfitTruth> {
  const invoices = await fetchAll<{
    id: string; company_id: string; invoice_date: string; status: string; total: number | null;
  }>('sales_invoices', 'id, company_id, invoice_date, status, total');
  const start = range.startDate;
  const end = range.endDate;
  const approvedInvoices = invoices.filter(invoice => {
    if (!['confirmed', 'posted', 'paid'].includes(String(invoice.status).toLowerCase())) return false;
    if (start && invoice.invoice_date < start) return false;
    if (end && invoice.invoice_date > end) return false;
    return true;
  });
  const invoiceIds = approvedInvoices.map(invoice => invoice.id);
  if (!invoiceIds.length) {
    return calculateGrossProfitTruth([], range);
  }

  const items: Array<{ invoice_id: string; quantity: number | null; cost_price: number | null }> = [];
  for (let i = 0; i < invoiceIds.length; i += 100) {
    const ids = invoiceIds.slice(i, i + 100);
    const { data, error } = await supabase.from('sale_items').select('invoice_id, quantity, cost_price').in('invoice_id', ids);
    if (error) throw error;
    items.push(...((data ?? []) as typeof items));
  }

  const itemByInvoice = new Map<string, typeof items>();
  for (const item of items) itemByInvoice.set(item.invoice_id, [...(itemByInvoice.get(item.invoice_id) ?? []), item]);
  const rows = approvedInvoices.map(invoice => {
    const invoiceItems = itemByInvoice.get(invoice.id) ?? [];
    return invoiceItems.length
      ? invoiceItems.map(item => ({ company_id: invoice.company_id, invoice_date: invoice.invoice_date, status: invoice.status, total: invoice.total, quantity: item.quantity, cost_price: item.cost_price }))
      : [{ company_id: invoice.company_id, invoice_date: invoice.invoice_date, status: invoice.status, total: invoice.total, quantity: 0, cost_price: null }];
  }).flat();

  const truth = calculateGrossProfitTruth(rows, range);
  return { ...truth, invoiceCount: approvedInvoices.length };
}
