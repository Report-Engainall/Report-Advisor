import { inferSchemaField, type SchemaEvidence, type SchemaField } from './schema-intelligence';
import { normalizeBusinessKey } from './business-key';

export type ColumnInference = SchemaEvidence & {
  sourceColumn: string;
  sampleSize: number;
};

export type TableInference = {
  headerRow: number;
  confidence: number;
  columns: ColumnInference[];
  ignoredRows: number[];
  reason: string[];
};

export type MappingDecision = {
  sourceColumn: string;
  field: SchemaField;
  confidence: number;
  evidence: string[];
  ambiguous: boolean;
};

const OCR_FIXES: Array<[RegExp, string]> = [
  [/رقم\s*الصفنف/gi, 'رقم الصنف'],
  [/رقم\s*الاصنف/gi, 'رقم الصنف'],
  [/كود\s*الاصنف/gi, 'كود الصنف'],
  [/الباركود\s*\|/gi, 'الباركود'],
  [/produc[tc]\s*cod[eo]/gi, 'product code'],
  [/prodcut/gi, 'product'],
  [/quantit[vy]/gi, 'quantity'],
];

export function correctOcrHeader(value: string): string {
  return OCR_FIXES.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value).trim();
}

function rowDensity(row: unknown[]): number {
  if (!row.length) return 0;
  return row.filter(value => value !== null && value !== undefined && String(value).trim() !== '').length / row.length;
}

function headerLikelihood(row: unknown[]): number {
  const values = row.map(value => String(value ?? '').trim()).filter(Boolean);
  if (!values.length) return 0;
  const textLike = values.filter(value => /[A-Za-z\u0600-\u06FF]/.test(value)).length / values.length;
  const unique = new Set(values.map(value => value.toLocaleLowerCase())).size / values.length;
  return Math.min(100, Math.round((textLike * 60) + (unique * 25) + (rowDensity(row) * 15)));
}

/** Finds the most likely header row in a bounded sample without using an LLM. */
export function discoverHeaderRow(matrix: unknown[][], maxRows = 30): { row: number; confidence: number } {
  let best = { row: 0, confidence: 0 };
  for (let index = 0; index < Math.min(matrix.length, maxRows); index += 1) {
    const confidence = headerLikelihood(matrix[index]);
    if (confidence > best.confidence) best = { row: index, confidence };
  }
  return best;
}

export function inferTable(matrix: unknown[][], maxRows = 30): TableInference {
  const header = discoverHeaderRow(matrix, maxRows);
  const rawHeaders = matrix[header.row] ?? [];
  const headers = rawHeaders.map(value => correctOcrHeader(String(value ?? '')));
  const rows = matrix.slice(header.row + 1).filter(row => rowDensity(row) > 0);
  const columns: ColumnInference[] = headers.map((sourceColumn, index) => {
    const values = rows.map(row => row[index]);
    const evidence = inferSchemaField(sourceColumn, values);
    return { ...evidence, sourceColumn, sampleSize: values.filter(value => value !== null && value !== undefined && String(value).trim() !== '').length };
  });
  const ignoredRows = matrix.slice(0, header.row).map((_, index) => index);
  return {
    headerRow: header.row,
    confidence: header.confidence,
    columns,
    ignoredRows,
    reason: header.row === 0 ? ['first row has highest header likelihood'] : ['header discovered below preamble/title rows'],
  };
}

/** Resolves duplicate target fields deterministically: highest confidence wins, ties use source order. */
export function resolveMappings(columns: ColumnInference[]): MappingDecision[] {
  const ranked = [...columns]
    .filter(column => column.field !== 'unknown' && column.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence || a.sourceColumn.localeCompare(b.sourceColumn));
  const claimed = new Set<SchemaField>();
  return ranked.map(column => {
    const duplicate = claimed.has(column.field);
    if (!duplicate) claimed.add(column.field);
    return {
      sourceColumn: column.sourceColumn,
      field: column.field,
      confidence: duplicate ? Math.max(0, column.confidence - 20) : column.confidence,
      evidence: duplicate ? [...column.evidence, 'duplicate target field; lower-ranked mapping'] : column.evidence,
      ambiguous: duplicate || column.ambiguous,
    };
  });
}

export type EntityResolution = {
  sourceKey: string;
  matched: boolean;
  targetIndex: number | null;
  confidence: number;
  reason: 'exact-canonical' | 'missing-key' | 'not-found' | 'duplicate-target';
};

export function resolveEntities<T>(sourceRows: T[], targetRows: T[], getKey: (row: T) => unknown): EntityResolution[] {
  const index = new Map<string, number[]>();
  targetRows.forEach((row, targetIndex) => {
    const key = normalizeBusinessKey(getKey(row));
    if (!key) return;
    const bucket = index.get(key) ?? [];
    bucket.push(targetIndex);
    index.set(key, bucket);
  });
  return sourceRows.map(row => {
    const sourceKey = normalizeBusinessKey(getKey(row));
    if (!sourceKey) return { sourceKey, matched: false, targetIndex: null, confidence: 0, reason: 'missing-key' };
    const matches = index.get(sourceKey) ?? [];
    if (matches.length === 1) return { sourceKey, matched: true, targetIndex: matches[0], confidence: 100, reason: 'exact-canonical' };
    if (matches.length > 1) return { sourceKey, matched: false, targetIndex: null, confidence: 0, reason: 'duplicate-target' };
    return { sourceKey, matched: false, targetIndex: null, confidence: 0, reason: 'not-found' };
  });
}
