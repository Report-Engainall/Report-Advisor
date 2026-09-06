import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import { assertCanonicalBoundary, type ReconciledCanonicalImportRow } from '@/lib/import/canonical-truth-boundary';

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

function normalizeCustomerName(value: unknown): string | null {
  const v = text(value);
  return v ? v.replace(/\s+/g, ' ').toLocaleLowerCase() : null;
}

async function resolveInvoiceCustomerIds(
  rows: CanonicalImportRow[],
  companyId: string,
): Promise<CanonicalImportRow[]> {
  const needsResolution = rows.filter((row) => !text(row.data.customer_id));
  if (!needsResolution.length) return rows;

  const customerNames = new Set(
    needsResolution
      .map((row) => normalizeCustomerName(row.data.customer_name))
      .filter((name): name is string => Boolean(name)),
  );

  if (customerNames.size === 0) {
    throw new Error('CUSTOMER_ID_OR_EXACT_CUSTOMER_NAME_REQUIRED');
  }

  const { data, error } = await supabase
    .from('customers')
    .select('id,name')
    .eq('company_id', companyId);
  if (error) throw error;

  const matches = new Map<string, string[]>();
  for (const customer of data ?? []) {
    const normalized = normalizeCustomerName(customer.name);
    if (!normalized || !customerNames.has(normalized)) continue;
    const ids = matches.get(normalized) ?? [];
    ids.push(String(customer.id));
    matches.set(normalized, ids);
  }

  return rows.map((row) => {
    if (text(row.data.customer_id)) return row;

    const normalizedName = normalizeCustomerName(row.data.customer_name);
    if (!normalizedName) {
      throw new Error(`CUSTOMER_ID_OR_EXACT_CUSTOMER_NAME_REQUIRED_FOR_ROW_${row.rowNumber}`);
    }

    const ids = matches.get(normalizedName) ?? [];
    if (ids.length === 0) {
      throw new Error(`CUSTOMER_NAME_NOT_FOUND_FOR_ROW_${row.rowNumber}`);
    }
    if (ids.length > 1) {
      throw new Error(`CUSTOMER_NAME_AMBIGUOUS_FOR_ROW_${row.rowNumber}`);
    }

    return {
      ...row,
      data: { ...row.data, customer_id: ids[0] },
    };
  });
}

function canonicalizeRow(entityType: 'products' | 'customers' | 'sales_invoices', row: CanonicalImportRow): Record<string, unknown> {
  const d = row.data;
  if (entityType === 'products') {
    return {
      sku: requiredText(d.sku, 'sku', row.rowNumber),
      name: requiredText(d.name, 'name', row.rowNumber),
      unit: requiredText(d.unit, 'unit', row.rowNumber),
      cost_price: requiredNumber(d.cost_price, 'cost_price', row.rowNumber),
      selling_price: requiredNumber(d.selling_price, 'selling_price', row.rowNumber),
      min_stock: requiredNumber(d.min_stock, 'min_stock', row.rowNumber),
      reorder_point: requiredNumber(d.reorder_point, 'reorder_point', row.rowNumber),
      is_active: requiredBoolean(d.is_active, 'is_active', row.rowNumber),
    };
  }
  if (entityType === 'customers') {
    return {
      name: requiredText(d.name, 'name', row.rowNumber),
      code: text(d.code),
      phone: text(d.phone),
      email: text(d.email),
      segment: requiredText(d.segment, 'segment', row.rowNumber),
      credit_limit: requiredNumber(d.credit_limit, 'credit_limit', row.rowNumber),
      payment_terms_days: Math.trunc(requiredNumber(d.payment_terms_days, 'payment_terms_days', row.rowNumber)),
    };
  }
  return {
    invoice_number: requiredText(d.invoice_number, 'invoice_number', row.rowNumber),
    invoice_date: requiredText(d.invoice_date, 'invoice_date', row.rowNumber),
    customer_id: text(d.customer_id),
    customer_name: text(d.customer_name),
    subtotal: requiredNumber(d.subtotal, 'subtotal', row.rowNumber),
    tax_amount: requiredNumber(d.tax_amount, 'tax_amount', row.rowNumber),
    total: requiredNumber(d.total, 'total', row.rowNumber),
    paid_amount: requiredNumber(d.paid_amount, 'paid_amount', row.rowNumber),
    status: requiredText(d.status, 'status', row.rowNumber),
  };
}

export async function commitImportBatch(
  entityType: 'products' | 'customers' | 'sales_invoices',
  rows: ReconciledCanonicalImportRow[],
): Promise<CanonicalCommitResult> {
  if (!rows.length) return { committed: 0, ids: [] };
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('No authenticated tenant context is available for canonical import');

  // The canonical boundary is intentionally runtime-enforced, not merely a TypeScript type.
  rows.forEach((row) => assertCanonicalBoundary(row, companyId));
  const resolvedRows = entityType === 'sales_invoices'
    ? await resolveInvoiceCustomerIds(rows, companyId)
    : rows;
  const payload = resolvedRows.map((row) => canonicalizeRow(entityType, { data: row.data, rowNumber: row.rowNumber }));
  const { data, error } = await supabase.rpc('import_commit_batch', {
    p_company_id: companyId,
    p_entity_type: entityType,
    p_rows: payload,
    p_null_policy: 'preserve',
  });
  if (error) throw error;

  const result = data as { committed?: unknown; ids?: unknown } | null;
  const committed = Number(result?.committed);
  const ids = Array.isArray(result?.ids) ? result.ids.map(String) : [];
  if (!Number.isInteger(committed) || committed !== rows.length || ids.length !== rows.length) {
    throw new Error('IMPORT_COMMIT_RESULT_MISMATCH');
  }
  return { committed, ids };
}
