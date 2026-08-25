import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';

export interface CanonicalImportRow { data: Record<string, unknown>; rowNumber: number }
export interface CanonicalCommitResult { committed: number; ids: string[] }

function text(value: unknown): string | null {
  if (value == null) return null;
  const v = String(value).trim();
  return v || null;
}

function requiredNumber(value: unknown, field: string, rowNumber: number): number {
  if (value == null || value === '') throw new Error(`${field} is required for import row ${rowNumber}`);
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`${field} must be a finite number for import row ${rowNumber}`);
  return n;
}

function requiredText(value: unknown, field: string, rowNumber: number): string {
  const v = text(value);
  if (!v) throw new Error(`${field} is required for import row ${rowNumber}`);
  return v;
}

function requiredBoolean(value: unknown, field: string, rowNumber: number): boolean {
  if (value == null || value === '') throw new Error(`${field} is required for import row ${rowNumber}`);
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'نعم', 'نشط'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'لا', 'غير نشط'].includes(normalized)) return false;
  throw new Error(`${field} must be a boolean for import row ${rowNumber}`);
}

async function commitProduct(companyId: string, row: CanonicalImportRow) {
  const d = row.data;
  const { data, error } = await supabase.rpc('import_upsert_product', {
    p_company_id: companyId,
    p_sku: requiredText(d.sku, 'sku', row.rowNumber),
    p_name: requiredText(d.name, 'name', row.rowNumber),
    p_unit: requiredText(d.unit, 'unit', row.rowNumber),
    p_cost_price: requiredNumber(d.cost_price, 'cost_price', row.rowNumber),
    p_selling_price: requiredNumber(d.selling_price, 'selling_price', row.rowNumber),
    p_min_stock: requiredNumber(d.min_stock, 'min_stock', row.rowNumber),
    p_reorder_point: requiredNumber(d.reorder_point, 'reorder_point', row.rowNumber),
    p_is_active: requiredBoolean(d.is_active, 'is_active', row.rowNumber),
  });
  if (error) throw error;
  return String(data);
}

async function commitCustomer(companyId: string, row: CanonicalImportRow) {
  const d = row.data;
  const { data, error } = await supabase.rpc('import_upsert_customer', {
    p_company_id: companyId,
    p_code: text(d.code),
    p_name: requiredText(d.name, 'name', row.rowNumber),
    p_phone: text(d.phone),
    p_email: text(d.email),
    p_segment: requiredText(d.segment, 'segment', row.rowNumber),
    p_credit_limit: requiredNumber(d.credit_limit, 'credit_limit', row.rowNumber),
    p_payment_terms_days: Math.trunc(requiredNumber(d.payment_terms_days, 'payment_terms_days', row.rowNumber)),
  });
  if (error) throw error;
  return String(data);
}

async function resolveCustomerId(companyId: string, row: CanonicalImportRow): Promise<string> {
  const direct = text(row.data.customer_id);
  if (direct) return direct;
  const name = requiredText(row.data.customer_name, 'customer_name', row.rowNumber);
  const { data, error } = await supabase.from('customers').select('id').eq('company_id', companyId).eq('name', name).limit(1).maybeSingle();
  if (error) throw error;
  if (!data?.id) throw new Error(`customer not found for invoice row ${row.rowNumber}: ${name}`);
  return String(data.id);
}

async function commitInvoice(companyId: string, row: CanonicalImportRow) {
  const d = row.data;
  const customerId = await resolveCustomerId(companyId, row);
  const { data, error } = await supabase.rpc('import_upsert_sales_invoice', {
    p_company_id: companyId,
    p_invoice_number: requiredText(d.invoice_number, 'invoice_number', row.rowNumber),
    p_invoice_date: requiredText(d.invoice_date, 'invoice_date', row.rowNumber),
    p_customer_id: customerId,
    p_subtotal: requiredNumber(d.subtotal, 'subtotal', row.rowNumber),
    p_tax_amount: requiredNumber(d.tax_amount, 'tax_amount', row.rowNumber),
    p_total: requiredNumber(d.total, 'total', row.rowNumber),
    p_paid_amount: requiredNumber(d.paid_amount, 'paid_amount', row.rowNumber),
    p_status: requiredText(d.status, 'status', row.rowNumber),
    p_notes: text(d.notes),
  });
  if (error) throw error;
  return String(data);
}

export async function commitImportBatch(entityType: 'products' | 'customers' | 'sales_invoices', rows: CanonicalImportRow[]): Promise<CanonicalCommitResult> {
  if (!rows.length) return { committed: 0, ids: [] };
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('No authenticated tenant context is available for canonical import');

  const ids: string[] = [];
  for (const row of rows) {
    const id = entityType === 'products'
      ? await commitProduct(companyId, row)
      : entityType === 'customers'
        ? await commitCustomer(companyId, row)
        : await commitInvoice(companyId, row);
    ids.push(id);
  }
  return { committed: ids.length, ids };
}
