import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import { assertCanonicalBoundary, type ReconciledCanonicalImportRow } from '@/lib/import/canonical-truth-boundary';

export interface CanonicalImportRow { data: Record<string, unknown>; rowNumber: number }
export interface CanonicalCommitResult { committed: number; ids: string[] }

type EntityType = 'products' | 'customers' | 'sales_invoices';

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

function canonicalizeRow(entityType: EntityType, row: CanonicalImportRow): Record<string, unknown> {
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

function sameSourceDocument(rows: ReconciledCanonicalImportRow[]): string | null {
  const ids = new Set(rows.map((row) => row.provenance.sourceDocumentId));
  if (ids.size !== 1) return null;
  const id = [...ids][0];
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ? id : null;
}

export async function commitImportBatch(
  entityType: EntityType,
  rows: ReconciledCanonicalImportRow[],
  options?: { jobId?: string },
): Promise<CanonicalCommitResult> {
  if (!rows.length) return { committed: 0, ids: [] };
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('No authenticated tenant context is available for canonical import');

  // The canonical boundary is intentionally runtime-enforced, not merely a TypeScript type.
  rows.forEach((row) => assertCanonicalBoundary(row, companyId));
  const payload = rows.map((row) => canonicalizeRow(entityType, { data: row.data, rowNumber: row.rowNumber }));

  // CanonicalImportPage already binds sourceDocumentId to the import job id.
  // Reuse that binding so every canonical import retains the complete source row,
  // including fields that are not represented by the normalized business schema.
  const lineageJobId = options?.jobId ?? sameSourceDocument(rows);
  const rpc = lineageJobId ? 'import_commit_batch_with_lineage' : 'import_commit_batch';
  const args = lineageJobId
    ? {
        p_company_id: companyId,
        p_entity_type: entityType,
        p_rows: payload,
        p_source_rows: rows.map((row) => ({
          job_id: lineageJobId,
          row_number: row.rowNumber,
          status: 'valid',
          source_data: row.data,
          mapped_data: row.data,
          target_table: entityType,
          lineage: row.provenance,
        })),
        p_null_policy: 'preserve',
      }
    : {
        p_company_id: companyId,
        p_entity_type: entityType,
        p_rows: payload,
        p_null_policy: 'preserve',
      };

  const { data, error } = await supabase.rpc(rpc, args);
  if (error) throw error;

  const result = data as { committed?: unknown; ids?: unknown } | null;
  const committed = Number(result?.committed);
  const ids = Array.isArray(result?.ids) ? result.ids.map(String) : [];
  if (!Number.isInteger(committed) || committed !== rows.length || ids.length !== rows.length) {
    throw new Error('IMPORT_COMMIT_RESULT_MISMATCH');
  }
  return { committed, ids };
}
