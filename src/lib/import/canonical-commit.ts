import { supabase, COMPANY_ID } from '@/lib/supabase';

export interface CanonicalImportRow {
  data: Record<string, unknown>;
  rowNumber: number;
}

export interface CanonicalCommitResult {
  committed: number;
  ids: string[];
}

function text(value: unknown): string | null {
  if (value == null) return null;
  const v = String(value).trim();
  return v || null;
}

function numberValue(value: unknown, fallback = 0): number {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function commitProduct(row: CanonicalImportRow) {
  const d = row.data;
  const { data, error } = await supabase.rpc('import_upsert_product', {
    p_company_id: COMPANY_ID,
    p_sku: text(d.sku) ?? `SKU-${row.rowNumber}`,
    p_name: text(d.name) ?? '',
    p_unit: text(d.unit) ?? 'قطعة',
    p_cost_price: numberValue(d.cost_price),
    p_selling_price: numberValue(d.selling_price),
    p_min_stock: numberValue(d.min_stock),
    p_reorder_point: numberValue(d.reorder_point),
    p_is_active: d.is_active == null ? true : Boolean(d.is_active),
  });
  if (error) throw error;
  return String(data);
}

async function commitCustomer(row: CanonicalImportRow) {
  const d = row.data;
  const { data, error } = await supabase.rpc('import_upsert_customer', {
    p_company_id: COMPANY_ID,
    p_code: text(d.code),
    p_name: text(d.name) ?? '',
    p_phone: text(d.phone),
    p_email: text(d.email),
    p_segment: text(d.segment) ?? 'regular',
    p_credit_limit: numberValue(d.credit_limit),
    p_payment_terms_days: Math.trunc(numberValue(d.payment_terms_days, 30)),
  });
  if (error) throw error;
  return String(data);
}

async function commitInvoice(row: CanonicalImportRow) {
  const d = row.data;
  const customerId = text(d.customer_id);
  if (!customerId) throw new Error(`customer_id is required for invoice row ${row.rowNumber}`);

  const { data, error } = await supabase.rpc('import_upsert_sales_invoice', {
    p_company_id: COMPANY_ID,
    p_invoice_number: text(d.invoice_number) ?? '',
    p_invoice_date: text(d.invoice_date) ?? new Date().toISOString().slice(0, 10),
    p_customer_id: customerId,
    p_subtotal: numberValue(d.subtotal, numberValue(d.total)),
    p_tax_amount: numberValue(d.tax_amount),
    p_total: numberValue(d.total),
    p_paid_amount: numberValue(d.paid_amount),
    p_status: text(d.status) ?? 'confirmed',
    p_notes: text(d.notes),
  });
  if (error) throw error;
  return String(data);
}

export async function commitImportBatch(
  entityType: 'products' | 'customers' | 'sales_invoices',
  rows: CanonicalImportRow[],
): Promise<CanonicalCommitResult> {
  const ids: string[] = [];
  for (const row of rows) {
    const id = entityType === 'products'
      ? await commitProduct(row)
      : entityType === 'customers'
        ? await commitCustomer(row)
        : await commitInvoice(row);
    ids.push(id);
  }
  return { committed: ids.length, ids };
}
