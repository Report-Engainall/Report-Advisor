import * as XLSX from 'xlsx';
import { supabase } from '../supabase';
import { isGrossProfitDateInRange } from '../grossProfitTruthCore';

export interface GrossProfitExportRow {
  invoice_number: string;
  invoice_date: string;
  status: string;
  tenant: string;
  currency: string | null;
  revenue: number | null;
  cost: number | null;
  gross_profit: number | null;
  gross_margin: number | null;
  quantity: number | null;
}

export interface GrossProfitExportArtifact {
  row_count: number;
  revenue: number | null;
  cost: number | null;
  gross_profit: number | null;
  quantity: number | null;
  tenant: string[];
  currency: string | null;
  date_range: { startDate: string | null; endDate: string | null };
  source_identity: string;
  status: 'COMPLETE' | 'INSUFFICIENT_DATA';
}

const PAGE_SIZE = 1000;
const APPROVED = ['confirmed', 'posted', 'paid'];

export async function loadCompleteGrossProfitExport(range: { startDate?: string; endDate?: string } = {}): Promise<GrossProfitExportRow[]> {
  const invoices: Array<{ id: string; company_id: string; invoice_number: string; invoice_date: string; status: string; total: number | null; currency: string | null }> = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase.from('sales_invoices').select('id, company_id, invoice_number, invoice_date, status, total, currency').in('status', APPROVED).order('invoice_date', { ascending: true }).range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    const filtered = (data ?? []).filter(invoice => isGrossProfitDateInRange(invoice.invoice_date, range));
    invoices.push(...filtered);
    if (!data || data.length < PAGE_SIZE) break;
  }
  if (!invoices.length) return [];

  const items: Array<{ invoice_id: string; cost_price: number | null; quantity: number | null }> = [];
  for (let i = 0; i < invoices.length; i += 100) {
    const ids = invoices.slice(i, i + 100).map(invoice => invoice.id);
    const { data, error } = await supabase.from('sale_items').select('invoice_id, cost_price, quantity').in('invoice_id', ids);
    if (error) throw error;
    items.push(...(data ?? []));
  }

  const byInvoice = new Map<string, { cost: number | null; quantity: number | null }>();
  for (const item of items) {
    const previous = byInvoice.get(item.invoice_id) ?? { cost: 0, quantity: 0 };
    if (item.quantity === null || item.quantity === undefined) {
      previous.quantity = null;
      previous.cost = null;
    } else if (previous.quantity !== null) {
      previous.quantity += Number(item.quantity);
      if (item.cost_price === null || item.cost_price === undefined) previous.cost = null;
      else if (previous.cost !== null) previous.cost += Number(item.cost_price) * Number(item.quantity);
    }
    byInvoice.set(item.invoice_id, previous);
  }

  return invoices.map(invoice => {
    const aggregate = byInvoice.get(invoice.id) ?? { cost: null, quantity: null };
    const revenue = invoice.total;
    const grossProfit = revenue === null || aggregate.cost === null ? null : revenue - aggregate.cost;
    return {
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      status: invoice.status,
      tenant: invoice.company_id,
      currency: invoice.currency,
      revenue,
      cost: aggregate.cost,
      gross_profit: grossProfit,
      gross_margin: grossProfit === null || revenue === null || revenue === 0 ? null : (grossProfit / revenue) * 100,
      quantity: aggregate.quantity,
    };
  });
}

export function buildGrossProfitExportArtifact(rows: GrossProfitExportRow[], range: { startDate?: string; endDate?: string } = {}): GrossProfitExportArtifact {
  const currencies = [...new Set(rows.map(row => row.currency).filter((value): value is string => Boolean(value)))];
  const missingRevenue = rows.some(row => row.revenue === null);
  const missingCurrency = rows.some(row => row.currency === null);
  const mixedCurrency = currencies.length > 1;
  const hasMissingCost = rows.some(row => row.cost === null);
  const hasMissingQuantity = rows.some(row => row.quantity === null);
  const revenue = missingRevenue || missingCurrency || mixedCurrency ? null : rows.reduce((sum, row) => sum + (row.revenue ?? 0), 0);
  const cost = missingCurrency || mixedCurrency || hasMissingCost ? null : rows.reduce((sum, row) => sum + (row.cost ?? 0), 0);
  const quantity = hasMissingQuantity ? null : rows.reduce((sum, row) => sum + (row.quantity ?? 0), 0);
  const status = missingRevenue || missingCurrency || mixedCurrency || hasMissingCost || hasMissingQuantity ? 'INSUFFICIENT_DATA' : 'COMPLETE';
  return {
    row_count: rows.length,
    revenue,
    cost,
    gross_profit: status === 'COMPLETE' && revenue !== null && cost !== null ? revenue - cost : null,
    quantity,
    tenant: [...new Set(rows.map(row => row.tenant))],
    currency: currencies.length === 1 && !missingCurrency ? currencies[0] : null,
    date_range: { startDate: range.startDate ?? null, endDate: range.endDate ?? null },
    source_identity: 'sales_invoices.total + sale_items.cost_price*quantity; approved statuses only; RLS-scoped Supabase consumer',
    status,
  };
}

export async function exportSalesReportXlsx(range: { startDate?: string; endDate?: string } = {}): Promise<void> {
  const rows = await loadCompleteGrossProfitExport(range);
  const artifact = buildGrossProfitExportArtifact(rows, range);
  const sheet = XLSX.utils.json_to_sheet(rows);
  const evidence = XLSX.utils.json_to_sheet([{ ...artifact, tenant: artifact.tenant.join(','), currency: artifact.currency ?? '' }]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Gross Profit');
  XLSX.utils.book_append_sheet(workbook, evidence, 'Evidence');
  XLSX.writeFile(workbook, `gross-profit-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
