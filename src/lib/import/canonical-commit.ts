import { supabase } from '@/lib/supabase';

export interface CanonicalImportRow { data: Record<string, unknown>; rowNumber: number }
export interface CanonicalCommitResult { committed: number; ids: string[] }

function text(value: unknown): string | null {
  if (value == null) return null;
  const v = String(value).trim();
  return v || null;
}

function requiredText(value: unknown, field: string, rowNumber: number): string {
  const v = text(value);
  if (!v) throw new Error(`${field} is required for row ${rowNumber}`);
  return v;
}

function optionalNumber(value: unknown, field: string, rowNumber: number): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`${field} must be a finite number for row ${rowNumber}`);
  return n;
}

function requiredNumber(value: unknown, field: string, rowNumber: number): number {
  const n = optionalNumber(value, field, rowNumber);
  if (n == null) throw new Error(`${field} is required for row ${rowNumber}`);
  return n;
}

function requiredBoolean(value: unknown, field: string, rowNumber: number): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || String(value).trim().toLowerCase() === 'true') return true;
  if (value === 0 || value === '0' || String(value).trim().toLowerCase() === 'false') return false;
  throw new Error(`${field} is required and must be boolean for row ${rowNumber}`);
}

function rpcTargetId(data: unknown, operation: string): string {
  const row = Array.isArray(data) ? data[0] : data;
  const id = row && typeof row === 'object' ? (row as { target_id?: unknown }).target_id : null;
  if (!id) throw new Error(`${operation} returned no target_id`);
  return String(id);
}

async function resolveAuthoritativeTenantId(): Promise<string> {
  const { data, error } = await supabase.rpc('current_company_id');
  if (error || !data) throw new Error('TENANT_CONTEXT_REQUIRED');
  return String(data);
}

async function commitProduct(row: CanonicalImportRow, companyId: string) {
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
    p_null_policy: 'preserve',
  });
  if (error) throw error;
  return rpcTargetId(data, 'import_upsert_product');
}

async function commitCustomer(row: CanonicalImportRow, companyId: string) {
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
    p_null_policy: 'preserve',
  });
  if (error) throw error;
  return rpcTargetId(data, 'import_upsert_customer');
}

async function resolveCustomerId(row: CanonicalImportRow): Promise<string> {
  const direct = text(row.data.customer_id);
  if (direct) return direct;
  const name = requiredText(row.data.customer_name, 'customer_name', row.rowNumber);
  const { data, error } = await supabase.from('customers').select('id').eq('name', name).limit(1).maybeSingle();
  if (error) throw error;
  if (!data?.id) throw new Error(`customer not found for invoice row ${row.rowNumber}: ${name}`);
  return String(data.id);
}

async function commitInvoice(row: CanonicalImportRow, companyId: string) {
  const d = row.data;
  const customerId = await resolveCustomerId(row);
  const { data, error } = await supabase.rpc('import_upsert_sales_invoice', {
    p_company_id: companyId,
    p_invoice_number: requiredText(d.invoice_number, 'invoice_number', row.rowNumber),
    p_invoice_date: requiredText(d.invoice_date, 'invoice_date', row.rowNumber),
    p_customer_id: customerId,
    p_customer_name: text(d.customer_name),
    p_subtotal: requiredNumber(d.subtotal, 'subtotal', row.rowNumber),
    p_tax_amount: requiredNumber(d.tax_amount, 'tax_amount', row.rowNumber),
    p_total: requiredNumber(d.total, 'total', row.rowNumber),
    p_paid_amount: requiredNumber(d.paid_amount, 'paid_amount', row.rowNumber),
    p_status: requiredText(d.status, 'status', row.rowNumber),
    p_null_policy: 'preserve',
  });
  if (error) throw error;
  return rpcTargetId(data, 'import_upsert_sales_invoice');
}

export async function commitImportBatch(entityType: 'products' | 'customers' | 'sales_invoices', rows: CanonicalImportRow[]): Promise<CanonicalCommitResult> {
  if (!rows.length) return { committed: 0, ids: [] };
  const companyId = await resolveAuthoritativeTenantId();
  const ids: string[] = [];
  for (const row of rows) {
    const id = entityType === 'products' ? await commitProduct(row, companyId) : entityType === 'customers' ? await commitCustomer(row, companyId) : await commitInvoice(row, companyId);
    ids.push(id);
  }
  return { committed: ids.length, ids };
}
