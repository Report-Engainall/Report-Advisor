import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import { assertCanonicalBoundary, type ReconciledCanonicalImportRow } from '@/lib/import/canonical-truth-boundary';
import { resolveRows, type RowResolution } from '@/lib/file-engine/universal-intelligence';

export interface CanonicalImportRow { data: Record<string, unknown>; rowNumber: number }
export interface CanonicalCommitResult { committed: number; ids: string[] }

type EntityType = 'products' | 'customers' | 'sales_invoices';
type GovernedResolution = RowResolution & { action: 'write_new'; allowedToWrite: true };

function text(value: unknown): string | null {
  if (value == null) return null;
  const v = String(value).trim();
  return v || null;
}

function optionalNumber(value: unknown, field: string, rowNumber: number): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`${field} must be a finite number for import row ${rowNumber}`);
  return n;
}

function requiredText(value: unknown, field: string, rowNumber: number): string {
  const v = text(value);
  if (!v) throw new Error(`${field} is required for import row ${rowNumber}`);
  return v;
}

function canonicalizeRow(entityType: EntityType, row: CanonicalImportRow): Record<string, unknown> {
  const d = row.data;
  if (entityType === 'products') {
    return { sku: requiredText(d.sku, 'sku', row.rowNumber), name: requiredText(d.name, 'name', row.rowNumber), unit: text(d.unit), cost_price: optionalNumber(d.cost_price, 'cost_price', row.rowNumber), selling_price: optionalNumber(d.selling_price, 'selling_price', row.rowNumber), min_stock: optionalNumber(d.min_stock, 'min_stock', row.rowNumber), reorder_point: optionalNumber(d.reorder_point, 'reorder_point', row.rowNumber), is_active: d.is_active == null || d.is_active === '' ? null : Boolean(d.is_active) };
  }
  if (entityType === 'customers') {
    return { name: requiredText(d.name, 'name', row.rowNumber), code: text(d.code), phone: text(d.phone), email: text(d.email), segment: text(d.segment), credit_limit: optionalNumber(d.credit_limit, 'credit_limit', row.rowNumber), payment_terms_days: optionalNumber(d.payment_terms_days, 'payment_terms_days', row.rowNumber) };
  }
  return { invoice_number: requiredText(d.invoice_number, 'invoice_number', row.rowNumber), invoice_date: requiredText(d.invoice_date, 'invoice_date', row.rowNumber), customer_id: text(d.customer_id), customer_name: text(d.customer_name), subtotal: optionalNumber(d.subtotal, 'subtotal', row.rowNumber), tax_amount: optionalNumber(d.tax_amount, 'tax_amount', row.rowNumber), total: optionalNumber(d.total, 'total', row.rowNumber), paid_amount: optionalNumber(d.paid_amount, 'paid_amount', row.rowNumber), status: text(d.status) };
}

function sameSourceDocument(rows: ReconciledCanonicalImportRow[]): string | null {
  const ids = new Set(rows.map((row) => row.provenance.sourceDocumentId));
  if (ids.size !== 1) return null;
  const id = [...ids][0];
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ? id : null;
}

async function fetchExistingRows(entityType: EntityType, companyId: string, payload: Record<string, unknown>[]) {
  const keys = entityType === 'products'
    ? payload.map((row) => text(row.sku)).filter(Boolean)
    : entityType === 'customers'
      ? payload.map((row) => text(row.code)).filter(Boolean)
      : payload.map((row) => text(row.invoice_number)).filter(Boolean);
  if (!keys.length) return [] as Record<string, unknown>[];

  const column = entityType === 'products' ? 'sku' : entityType === 'customers' ? 'code' : 'invoice_number';
  const { data, error } = await supabase.from(entityType).select('*').eq('company_id', companyId).in(column, keys as string[]).limit(5000);
  if (error) throw error;
  return (data ?? []) as Record<string, unknown>[];
}

function resolutionIdentity(entityType: EntityType, row: Record<string, unknown>) {
  if (entityType === 'products') return { sku: text(row.sku) };
  if (entityType === 'customers') return { code: text(row.code), name: text(row.name) };
  return { invoice_number: text(row.invoice_number) };
}

function assertNewResolutions(resolutions: RowResolution[]) {
  const blocked = resolutions.filter((resolution) => resolution.outcome !== 'new' || resolution.action !== 'write_new' || resolution.allowedToWrite !== true);
  if (blocked.length) {
    throw new Error(`IMPORT_RESOLUTION_BLOCKED:${blocked[0].outcome}:${blocked[0].action}`);
  }
}

export async function commitImportBatch(entityType: EntityType, rows: ReconciledCanonicalImportRow[], options?: { jobId?: string }): Promise<CanonicalCommitResult> {
  if (!rows.length) return { committed: 0, ids: [] };
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('No authenticated tenant context is available for canonical import');
  rows.forEach((row) => assertCanonicalBoundary(row, companyId));

  const payload = rows.map((row) => canonicalizeRow(entityType, { data: row.data, rowNumber: row.rowNumber }));
  const existingRows = await fetchExistingRows(entityType, companyId, payload);
  const resolutions = resolveRows({ rows: payload.map((data, index) => ({ data, rowNumber: rows[index].rowNumber })) }, existingRows.map((data, index) => ({ data, rowNumber: index + 1 })));
  assertNewResolutions(resolutions);

  const lineageJobId = options?.jobId ?? sameSourceDocument(rows);
  const sourceRows = rows.map((row) => ({ job_id: lineageJobId, row_number: row.rowNumber, status: 'valid', source_data: row.data, mapped_data: row.data, target_table: entityType, lineage: { ...row.provenance, resolution: resolutionIdentity(entityType, row.data) } }));
  const { data, error } = await supabase.rpc('import_commit_batch_governed', { p_company_id: companyId, p_entity_type: entityType, p_rows: payload, p_source_rows: sourceRows, p_resolutions: resolutions, p_null_policy: 'preserve' });
  if (error) throw error;

  const result = data as { committed?: unknown; ids?: unknown } | null;
  const committed = Number(result?.committed);
  const ids = Array.isArray(result?.ids) ? result.ids.map(String) : [];
  if (!Number.isInteger(committed) || committed !== rows.length || ids.length !== rows.length) throw new Error('IMPORT_COMMIT_RESULT_MISMATCH');
  return { committed, ids };
}
