import { buildBusinessKeyIndex, matchBusinessKey, normalizeBusinessKey } from './business-key';
import { inferSchema, type SchemaEvidence, type SchemaField } from './schema-intelligence';

export type OperationalInputRow = Record<string, unknown>;

export type ReconciliationStatus = 'new' | 'updated' | 'unchanged' | 'conflict' | 'error';

export type OperationalRowResult = {
  rowIndex: number;
  status: ReconciliationStatus;
  businessKey: string;
  changedFields: string[];
  reason: string;
};

export type OperationalPreview = {
  schema: SchemaEvidence[];
  selectedBusinessKey: string | null;
  requiresApproval: boolean;
  rows: OperationalRowResult[];
  counts: Record<ReconciliationStatus, number>;
  fingerprint: string;
};

function stableValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  return String(value).trim();
}

function stableRow(row: OperationalInputRow, headers: string[]): string {
  return headers.map(header => `${normalizeBusinessKey(header)}=${stableValue(row[header])}`).join('|');
}

/** Deterministic, order-independent preview fingerprint. No database writes occur here. */
export function buildPreviewFingerprint(rows: OperationalInputRow[], headers: string[]): string {
  const canonicalRows = rows.map(row => stableRow(row, headers)).sort();
  let hash = 2166136261;
  for (const value of canonicalRows.join('\n')) {
    hash ^= value.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function selectBusinessKey(schema: SchemaEvidence[]): { header: string; field: SchemaField } | null {
  const candidates = schema
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.field === 'sku' || item.field === 'barcode' || item.field === 'customer_id' || item.field === 'invoice_number')
    .filter(({ item }) => !item.ambiguous && item.confidence >= 90)
    .sort((a, b) => b.item.confidence - a.item.confidence);
  const selected = candidates[0];
  return selected ? { header: String(selected.index), field: selected.item.field } : null;
}

export function buildOperationalPreview(
  headers: string[],
  incomingRows: OperationalInputRow[],
  existingRows: OperationalInputRow[] = [],
): OperationalPreview {
  const schema = inferSchema(headers, incomingRows);
  const keySchema = selectBusinessKey(schema);
  const keyHeader = keySchema ? headers[Number(keySchema.header)] : null;
  const counts: Record<ReconciliationStatus, number> = { new: 0, updated: 0, unchanged: 0, conflict: 0, error: 0 };
  const rows: OperationalRowResult[] = [];

  if (!keyHeader) {
    incomingRows.forEach((_, rowIndex) => {
      counts.error += 1;
      rows.push({ rowIndex, status: 'error', businessKey: '', changedFields: [], reason: 'No unambiguous business key was detected.' });
    });
    return {
      schema,
      selectedBusinessKey: null,
      requiresApproval: true,
      rows,
      counts,
      fingerprint: buildPreviewFingerprint(incomingRows, headers),
    };
  }

  const index = buildBusinessKeyIndex(existingRows, row => row[keyHeader]);
  const duplicateKeys = new Set<string>();
  for (const row of incomingRows) {
    const key = normalizeBusinessKey(row[keyHeader]);
    if (key) {
      if (duplicateKeys.has(key)) continue;
      duplicateKeys.add(key);
    }
  }

  incomingRows.forEach((row, rowIndex) => {
    const key = normalizeBusinessKey(row[keyHeader]);
    if (!key) {
      counts.error += 1;
      rows.push({ rowIndex, status: 'error', businessKey: '', changedFields: [], reason: 'Missing business key.' });
      return;
    }
    const match = matchBusinessKey(index, key);
    if (!match.row) {
      counts.new += 1;
      rows.push({ rowIndex, status: 'new', businessKey: key, changedFields: [], reason: 'Business key not found in target.' });
      return;
    }
    const changedFields = headers.filter(header => stableValue(row[header]) !== stableValue(match.row?.[header]));
    if (changedFields.length === 0) {
      counts.unchanged += 1;
      rows.push({ rowIndex, status: 'unchanged', businessKey: key, changedFields: [], reason: 'No material field changes.' });
    } else {
      counts.updated += 1;
      rows.push({ rowIndex, status: 'updated', businessKey: key, changedFields, reason: 'Existing business key matched with changed fields.' });
    }
  });

  const hasAmbiguity = schema.some(item => item.ambiguous);
  const duplicateIncoming = incomingRows.length !== duplicateKeys.size;
  return {
    schema,
    selectedBusinessKey: keyHeader,
    requiresApproval: hasAmbiguity || duplicateIncoming || counts.error > 0,
    rows,
    counts,
    fingerprint: buildPreviewFingerprint(incomingRows, headers),
  };
}
