export type ReconciliationState = 'RECONCILED' | 'CONFLICT' | 'INSUFFICIENT_DATA';

export interface ImportEvidenceProvenance {
  tenantId: string;
  sourceId: string;
  sourceHash: string;
  sourceDocumentId: string;
  evidenceId: string;
  lineageId: string;
}

export interface ReconciledCanonicalImportRow {
  rowNumber: number;
  data: Record<string, unknown>;
  provenance: ImportEvidenceProvenance;
  reconciliation: ReconciliationState;
}

export interface ReconciliationResult {
  rows: ReconciledCanonicalImportRow[];
  rejected: Array<{ rowNumber: number; reason: string }>;
}

function requiredText(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name}_REQUIRED`);
  return value.trim();
}

function stableValue(value: unknown): string {
  if (value === null) return 'NULL';
  if (typeof value === 'number' && !Number.isFinite(value)) return 'NON_FINITE_NUMBER';
  return JSON.stringify(value);
}

function rowIdentity(entityType: string, row: Record<string, unknown>): string {
  const key = entityType === 'products'
    ? row.sku
    : entityType === 'customers'
      ? (row.code ?? row.name)
      : row.invoice_number;
  return `${entityType}:${stableValue(key)}`;
}

function criticalPayload(entityType: string, row: Record<string, unknown>): string {
  const fields = entityType === 'products'
    ? ['sku', 'name', 'unit', 'cost_price', 'selling_price', 'min_stock', 'reorder_point', 'is_active']
    : entityType === 'customers'
      ? ['code', 'name', 'segment', 'credit_limit', 'payment_terms_days']
      : ['invoice_number', 'invoice_date', 'customer_id', 'subtotal', 'tax_amount', 'total', 'paid_amount', 'status'];
  return JSON.stringify(fields.map((field) => [field, row[field] ?? null]));
}

/**
 * Only rows that have complete provenance and a deterministic, conflict-free
 * reconciliation state may cross into the canonical write boundary.
 * Missing numeric/text values remain NULL; this function never converts NULL to 0.
 */
export function reconcileForCanonical(
  entityType: 'products' | 'customers' | 'sales_invoices',
  tenantId: string,
  sourceId: string,
  sourceHash: string,
  sourceDocumentId: string,
  evidenceIdForRow: (row: Record<string, unknown>, rowNumber: number) => string,
  rows: Array<{ rowNumber: number; data: Record<string, unknown> }>,
): ReconciliationResult {
  const rejected: ReconciliationResult['rejected'] = [];
  const output: ReconciledCanonicalImportRow[] = [];
  const seen = new Map<string, string>();
  const tenant = requiredText(tenantId, 'TENANT');
  const source = requiredText(sourceId, 'SOURCE');
  const hash = requiredText(sourceHash, 'SOURCE_HASH');
  const document = requiredText(sourceDocumentId, 'SOURCE_DOCUMENT');

  for (const row of rows) {
    const identity = rowIdentity(entityType, row.data);
    const payload = criticalPayload(entityType, row.data);
    const previous = seen.get(identity);
    if (previous !== undefined && previous !== payload) {
      rejected.push({ rowNumber: row.rowNumber, reason: 'CONFLICTING_EVIDENCE_FOR_SAME_CANONICAL_IDENTITY' });
      continue;
    }
    seen.set(identity, payload);

    let evidenceId: string;
    try {
      evidenceId = requiredText(evidenceIdForRow(row.data, row.rowNumber), 'EVIDENCE_ID');
    } catch (error) {
      rejected.push({ rowNumber: row.rowNumber, reason: error instanceof Error ? error.message : 'EVIDENCE_ID_REQUIRED' });
      continue;
    }
    const lineageId = `${tenant}:${document}:${row.rowNumber}`;
    output.push({
      rowNumber: row.rowNumber,
      data: { ...row.data },
      provenance: {
        tenantId: tenant,
        sourceId: source,
        sourceHash: hash,
        sourceDocumentId: document,
        evidenceId,
        lineageId,
      },
      reconciliation: 'RECONCILED',
    });
  }

  return { rows: output, rejected };
}

export function assertCanonicalBoundary(row: ReconciledCanonicalImportRow, expectedTenantId: string): void {
  if (row.reconciliation !== 'RECONCILED') throw new Error('CANONICAL_RECONCILIATION_REQUIRED');
  if (row.provenance.tenantId !== expectedTenantId) throw new Error('CANONICAL_TENANT_MISMATCH');
  for (const [name, value] of Object.entries(row.provenance)) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`CANONICAL_PROVENANCE_${name.toUpperCase()}_REQUIRED`);
  }
}
