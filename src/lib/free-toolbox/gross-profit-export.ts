import * as XLSX from 'xlsx';
import { supabase } from '../supabase';

export interface GrossProfitExportRow {
  invoice_number: string;
  invoice_date: string;
  status: string;
  tenant: string;
  revenue: number;
  cost: number | null;
  gross_profit: number | null;
  gross_margin: number | null;
  quantity: number;
}

export interface GrossProfitExportArtifact {
  row_count: number;
  revenue: number;
  cost: number | null;
  gross_profit: number | null;
  quantity: number;
  tenant: string[];
  date_range: { startDate: string | null; endDate: string | null };
  source_identity: string;
}

const PAGE_SIZE = 1000;
const APPROVED = ['confirmed', 'posted', 'paid'];

export async function loadCompleteGrossProfitExport(range: { startDate?: string; endDate?: string } = {}): Promise<GrossProfitExportRow[]> {
  const invoices: any[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('sales_invoices')
      .select('id, company_id, invoice_number, invoice_date, status, total')
      .in('status', APPROVED)
      .gte('invoice_date', range.startDate ?? '1900-01-01')
      .lte('invoice_date', range.endDate ?? '9999-12-31')
      .order('invoice_date', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    invoices.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  if (!invoices.length) return [];

  const items: any[] = [];
  for (let i = 0; i < invoices.length; i += 100) {
    const ids = invoices.slice(i, i + 100).map(invoice => invoice.id);
    const { data, error } = await supabase.from('sale_items').select('invoice_id, cost_price, quantity').in('invoice_id', ids);
    if (error) throw error;
    items.push(...(data ?? []));
  }

  const byInvoice = new Map<string, { cost: number | null; quantity: number }>();
  for (const item of items) {
    const previous = byInvoice.get(item.invoice_id) ?? { cost: 0, quantity: 0 };
    previous.quantity += Number(item.quantity ?? 0);
    if (item.cost_price === null || item.cost_price === undefined || item.cost_price === '') previous.cost = null;
    else if (previous.cost !== null) previous.cost += Number(item.cost_price) * Number(item.quantity ?? 0);
    byInvoice.set(item.invoice_id, previous);
  }

  return invoices.map(invoice => {
    const aggregate = byInvoice.get(invoice.id) ?? { cost: null, quantity: 0 };
    const revenue = Number(invoice.total ?? 0);
    const grossProfit = aggregate.cost === null ? null : revenue - aggregate.cost;
    return {
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      status: invoice.status,
      tenant: invoice.company_id,
      revenue,
      cost: aggregate.cost,
      gross_profit: grossProfit,
      gross_margin: grossProfit === null || revenue === 0 ? null : (grossProfit / revenue) * 100,
      quantity: aggregate.quantity,
    };
  });
}

export function buildGrossProfitExportArtifact(rows: GrossProfitExportRow[], range: { startDate?: string; endDate?: string } = {}): GrossProfitExportArtifact {
  const hasMissingCost = rows.some(row => row.cost === null);
  const revenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  const cost = hasMissingCost ? null : rows.reduce((sum, row) => sum + (row.cost ?? 0), 0);
  return {
    row_count: rows.length,
    revenue,
    cost,
    gross_profit: cost === null ? null : revenue - cost,
    quantity: rows.reduce((sum, row) => sum + row.quantity, 0),
    tenant: [...new Set(rows.map(row => row.tenant))],
    date_range: { startDate: range.startDate ?? null, endDate: range.endDate ?? null },
    source_identity: 'sales_invoices.total + sale_items.cost_price*quantity; approved statuses only; RLS-scoped Supabase consumer',
  };
}

export async function exportSalesReportXlsx(range: { startDate?: string; endDate?: string } = {}): Promise<void> {
  const rows = await loadCompleteGrossProfitExport(range);
  const artifact = buildGrossProfitExportArtifact(rows, range);
  const sheet = XLSX.utils.json_to_sheet(rows);
  const evidence = XLSX.utils.json_to_sheet([{ ...artifact, tenant: artifact.tenant.join(',') }]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Gross Profit');
  XLSX.utils.book_append_sheet(workbook, evidence, 'Evidence');
  XLSX.writeFile(workbook, `gross-profit-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
