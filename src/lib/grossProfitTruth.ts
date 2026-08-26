import { supabase } from './supabase';

export type GrossProfitDateRange = { startDate?: string; endDate?: string };
export type GrossProfitStatus = 'CALCULATED' | 'INSUFFICIENT_DATA';

export interface GrossProfitTruth {
  revenue: number | null;
  cost: number | null;
  grossProfit: number | null;
  quantity: number;
  invoiceCount: number;
  status: GrossProfitStatus;
  tenantIds: string[];
  dateRange: { startDate: string | null; endDate: string | null };
}

/** Canonical repository contract: approved invoice totals are canonical recorded revenue; NULL is never coerced to zero. */
export function calculateGrossProfitTruth(rows: Array<{
  company_id?: string | null; invoice_id?: string; invoice_date: string; status: string;
  total: number | string | null; quantity: number | string | null; cost_price: number | string | null;
}>, range: GrossProfitDateRange = {}): GrossProfitTruth {
  const start = range.startDate ?? null;
  const end = range.endDate ?? null;
  const approved = rows.filter(row => {
    if (!['confirmed', 'posted', 'paid'].includes(String(row.status).toLowerCase())) return false;
    if (start && row.invoice_date < start) return false;
    if (end && row.invoice_date > end) return false;
    return true;
  });
  const invoiceIds = new Set(approved.map(row => row.invoice_id ?? `${row.company_id ?? ''}:${row.invoice_date}`));
  const revenueMissing = approved.some(row => row.total === null || row.total === undefined || row.total === '');
  const revenue = revenueMissing ? null : approved.reduce((sum, row) => sum + Number(row.total), 0);
  const quantity = approved.reduce((sum, row) => sum + Number(row.quantity ?? 0), 0);
  const costMissing = approved.some(row => row.cost_price === null || row.cost_price === undefined || row.cost_price === '');
  const cost = costMissing ? null : approved.reduce((sum, row) => sum + Number(row.cost_price) * Number(row.quantity ?? 0), 0);
  const grossProfit = revenue === null || cost === null ? null : revenue - cost;
  return {
    revenue, cost, grossProfit, quantity, invoiceCount: invoiceIds.size,
    status: approved.length === 0 || revenue === null || cost === null ? 'INSUFFICIENT_DATA' : 'CALCULATED',
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
  const invoices = await fetchAll<{ id: string; company_id: string; invoice_date: string; status: string; total: number | null }>('sales_invoices', 'id, company_id, invoice_date, status, total');
  const approvedInvoices = invoices.filter(invoice => {
    if (!['confirmed', 'posted', 'paid'].includes(String(invoice.status).toLowerCase())) return false;
    if (range.startDate && invoice.invoice_date < range.startDate) return false;
    if (range.endDate && invoice.invoice_date > range.endDate) return false;
    return true;
  });
  const invoiceIds = approvedInvoices.map(invoice => invoice.id);
  if (!invoiceIds.length) return calculateGrossProfitTruth([], range);
  const items: Array<{ invoice_id: string; quantity: number | null; cost_price: number | null }> = [];
  for (let i = 0; i < invoiceIds.length; i += 100) {
    const ids = invoiceIds.slice(i, i + 100);
    const { data, error } = await supabase.from('sale_items').select('invoice_id, quantity, cost_price').in('invoice_id', ids);
    if (error) throw error;
    items.push(...((data ?? []) as typeof items));
  }
  const itemByInvoice = new Map<string, typeof items>();
  for (const item of items) itemByInvoice.set(item.invoice_id, [...(itemByInvoice.get(item.invoice_id) ?? []), item]);
  const rows = approvedInvoices.flatMap(invoice => {
    const invoiceItems = itemByInvoice.get(invoice.id) ?? [];
    return invoiceItems.length
      ? invoiceItems.map(item => ({ invoice_id: invoice.id, company_id: invoice.company_id, invoice_date: invoice.invoice_date, status: invoice.status, total: invoice.total, quantity: item.quantity, cost_price: item.cost_price }))
      : [{ invoice_id: invoice.id, company_id: invoice.company_id, invoice_date: invoice.invoice_date, status: invoice.status, total: invoice.total, quantity: 0, cost_price: null }];
  });
  return { ...calculateGrossProfitTruth(rows, range), invoiceCount: approvedInvoices.length };
}
