import * as XLSX from 'xlsx';
import { supabase } from '../supabase';

export interface GrossProfitExportRow {
  invoice_number: string;
  invoice_date: string;
  status: string;
  revenue: number;
  cost: number | null;
  gross_profit: number | null;
  gross_margin: number | null;
  quantity: number;
}

const PAGE_SIZE = 1000;

async function loadAllSalesInvoices() {
  const rows: any[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('sales_invoices')
      .select('id, invoice_number, invoice_date, status')
      .order('invoice_date', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

async function loadAllSaleItems(invoiceIds: string[]) {
  const rows: any[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('sale_items')
      .select('invoice_id, line_total, cost_price, quantity')
      .in('invoice_id', invoiceIds)
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

export async function loadCompleteGrossProfitExport(): Promise<GrossProfitExportRow[]> {
  const invoices = await loadAllSalesInvoices();
  if (!invoices.length) return [];
  const items = await loadAllSaleItems(invoices.map((invoice) => invoice.id));
  const byInvoice = new Map<string, { revenue: number; cost: number | null; quantity: number }>();
  for (const item of items) {
    const previous = byInvoice.get(item.invoice_id) ?? { revenue: 0, cost: 0, quantity: 0 };
    previous.revenue += Number(item.line_total ?? 0);
    previous.quantity += Number(item.quantity ?? 0);
    if (item.cost_price === null || item.cost_price === undefined || item.cost_price === '') previous.cost = null;
    else if (previous.cost !== null) previous.cost += Number(item.cost_price) * Number(item.quantity ?? 0);
    byInvoice.set(item.invoice_id, previous);
  }
  return invoices.map((invoice) => {
    const aggregate = byInvoice.get(invoice.id) ?? { revenue: 0, cost: 0, quantity: 0 };
    const grossProfit = aggregate.cost === null ? null : aggregate.revenue - aggregate.cost;
    return {
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      status: invoice.status,
      revenue: aggregate.revenue,
      cost: aggregate.cost,
      gross_profit: grossProfit,
      gross_margin: grossProfit === null || aggregate.revenue === 0 ? null : (grossProfit / aggregate.revenue) * 100,
      quantity: aggregate.quantity,
    };
  });
}

export async function exportSalesReportXlsx(): Promise<void> {
  const rows = await loadCompleteGrossProfitExport();
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Gross Profit');
  XLSX.writeFile(workbook, `gross-profit-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
