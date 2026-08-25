import { supabase } from '@/lib/supabase';
import type { SaleEvent } from './sales-velocity-engine';

type InvoiceRow = { id: string; invoice_date: string };
type SaleItemRow = { invoice_id: string; product_id: string | null; quantity: number | string | null; line_total: number | string | null };

export async function fetchSalesVelocityEvents(days = 365): Promise<SaleEvent[]> {
  if (!Number.isInteger(days) || days <= 0) throw new Error('days must be a positive integer');
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const { data: invoices, error: invoiceError } = await supabase
    .from('sales_invoices')
    .select('id,invoice_date')
    .gte('invoice_date', since);
  if (invoiceError) throw invoiceError;
  if (!invoices?.length) return [];

  const typedInvoices = invoices as unknown as InvoiceRow[];
  const ids = typedInvoices.map(x => x.id);
  const dates = new Map(typedInvoices.map(x => [x.id, x.invoice_date]));
  const { data: rawItems, error: itemError } = await supabase
    .from('sale_items')
    .select('invoice_id,product_id,quantity,line_total')
    .in('invoice_id', ids);
  if (itemError) throw itemError;

  const items = (rawItems ?? []) as unknown as SaleItemRow[];
  return items
    .filter(x => x.product_id)
    .map(x => ({
      productId: String(x.product_id),
      date: String(dates.get(x.invoice_id) ?? ''),
      quantity: Number(x.quantity ?? 0),
      netValue: Number(x.line_total ?? 0),
    }));
}
