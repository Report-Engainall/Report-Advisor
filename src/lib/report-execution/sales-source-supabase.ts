import type { SupabaseClient } from '@supabase/supabase-js';
import type { SalesSourceQuery, SalesSourceRow } from './sales-source-adapter';
import { resolveCurrentCompanyId } from '../supabase';

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  invoice_date: string;
  status: string;
  currency: string | null;
  customer_id: string | null;
}

interface SaleItemRecord {
  id: string;
  invoice_id: string;
  product_id: string | null;
  description: string | null;
  quantity: number | string;
  unit_price: number | string;
  discount_amount: number | string;
  tax_amount: number | string;
  line_total: number | string;
  cost_price: number | string;
}

interface CustomerRecord { id: string; code: string | null; name: string | null; }
interface ProductRecord { id: string; sku: string | null; name: string | null; }

function asNumber(value: number | string | null, field: string): number {
  const result = Number(value ?? 0);
  if (!Number.isFinite(result)) throw new Error(`SALES_SOURCE_${field.toUpperCase()}_NON_FINITE`);
  return result;
}

function businessSortKey(item: SaleItemRecord): string {
  return [
    item.product_id ?? '',
    item.description ?? '',
    String(item.quantity),
    String(item.unit_price),
    String(item.discount_amount),
    String(item.tax_amount),
    String(item.line_total),
    String(item.cost_price),
  ].join('|');
}

/** Supabase-backed source reader; RLS remains the database authorization boundary. */
export function createSupabaseSalesSourceQuery(client: SupabaseClient): SalesSourceQuery {
  return async ({ tenantId, from, to, excludedStatuses }) => {
    const authoritativeCompanyId = await resolveCurrentCompanyId();
    if (!authoritativeCompanyId) {
      throw new Error('SALES_SOURCE_TENANT_CONTEXT_UNRESOLVED');
    }
    if (tenantId !== authoritativeCompanyId) {
      throw new Error('SALES_SOURCE_TENANT_CONTEXT_MISMATCH');
    }

    const invoiceQuery = client
      .from('sales_invoices')
      .select('id,invoice_number,invoice_date,status,currency,customer_id')
      .eq('company_id', authoritativeCompanyId)
      .gte('invoice_date', from)
      .lte('invoice_date', to);

    const { data: invoices, error: invoiceError } = excludedStatuses.length
      ? await invoiceQuery.not('status', 'in', `(${excludedStatuses.map((status) => `\"${status}\"`).join(',')})`)
      : await invoiceQuery;
    if (invoiceError) throw new Error(`SALES_SOURCE_INVOICES_QUERY_FAILED:${invoiceError.message}`);

    const typedInvoices = (invoices ?? []) as InvoiceRecord[];
    if (!typedInvoices.length) return [];

    const invoiceIds = typedInvoices.map((invoice) => invoice.id);
    const customerIds = [...new Set(typedInvoices.map((invoice) => invoice.customer_id).filter((id): id is string => Boolean(id)))];

    const { data: items, error: itemError } = await client
      .from('sale_items')
      .select('id,invoice_id,product_id,description,quantity,unit_price,discount_amount,tax_amount,line_total,cost_price')
      .eq('company_id', authoritativeCompanyId)
      .in('invoice_id', invoiceIds);
    if (itemError) throw new Error(`SALES_SOURCE_ITEMS_QUERY_FAILED:${itemError.message}`);

    const typedItems = (items ?? []) as SaleItemRecord[];
    const productIds = [...new Set(typedItems.map((item) => item.product_id).filter((id): id is string => Boolean(id)))];

    const [customerResult, productResult] = await Promise.all([
      customerIds.length
        ? client.from('customers').select('id,code,name').eq('company_id', authoritativeCompanyId).in('id', customerIds)
        : Promise.resolve({ data: [], error: null }),
      productIds.length
        ? client.from('products').select('id,sku,name').eq('company_id', authoritativeCompanyId).in('id', productIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (customerResult.error) throw new Error(`SALES_SOURCE_CUSTOMERS_QUERY_FAILED:${customerResult.error.message}`);
    if (productResult.error) throw new Error(`SALES_SOURCE_PRODUCTS_QUERY_FAILED:${productResult.error.message}`);

    const customers = new Map(((customerResult.data ?? []) as CustomerRecord[]).map((row) => [row.id, row]));
    const products = new Map(((productResult.data ?? []) as ProductRecord[]).map((row) => [row.id, row]));
    const grouped = new Map<string, SaleItemRecord[]>();
    for (const item of typedItems) grouped.set(item.invoice_id, [...(grouped.get(item.invoice_id) ?? []), item]);

    const rows: SalesSourceRow[] = [];
    for (const invoice of typedInvoices) {
      const invoiceItems = [...(grouped.get(invoice.id) ?? [])].sort((a, b) => businessSortKey(a).localeCompare(businessSortKey(b)));
      invoiceItems.forEach((item, index) => {
        const customer = invoice.customer_id ? customers.get(invoice.customer_id) : undefined;
        const product = item.product_id ? products.get(item.product_id) : undefined;
        rows.push({
          invoice_number: invoice.invoice_number,
          invoice_date: invoice.invoice_date,
          status: invoice.status,
          currency: invoice.currency,
          customer_code: customer?.code ?? null,
          customer_name: customer?.name ?? null,
          product_sku: product?.sku ?? null,
          product_name: product?.name ?? item.description ?? null,
          quantity: asNumber(item.quantity, 'quantity'),
          unit_price: asNumber(item.unit_price, 'unit_price'),
          discount_amount: asNumber(item.discount_amount, 'discount_amount'),
          tax_amount: asNumber(item.tax_amount, 'tax_amount'),
          line_total: asNumber(item.line_total, 'line_total'),
          cost_price: asNumber(item.cost_price, 'cost_price'),
          line_number: index,
        });
      });
    }

    return rows;
  };
}
