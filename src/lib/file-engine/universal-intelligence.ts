import type { ColumnProfile, Dataset } from './types';

export type ReportClassification =
  | 'sales_invoices'
  | 'purchase_invoices'
  | 'products'
  | 'customers'
  | 'inventory'
  | 'payments'
  | 'general_report'
  | 'document_analysis';

export type ClassificationResult = {
  reportType: ReportClassification;
  confidence: number;
  evidence: string[];
  requiresReview: boolean;
};

export type RelationCandidate = {
  leftDataset: string;
  rightDataset: string;
  leftField: string;
  rightField: string;
  relation: 'one_to_many' | 'many_to_one' | 'unknown';
  confidence: number;
  evidence: string[];
};

export type RowResolution = {
  fingerprint: string;
  outcome: 'new' | 'skip_exact' | 'candidate_duplicate' | 'conflict';
  matchedRowIndex: number | null;
  differingFields: string[];
};

export type UniversalQualitySummary = {
  score: number;
  completeness: number;
  mapping: number;
  typeConfidence: number;
  duplicateCount: number;
  conflictCount: number;
  warnings: string[];
};

const TYPE_FIELDS: Record<Exclude<ReportClassification, 'general_report' | 'document_analysis'>, string[]> = {
  sales_invoices: ['invoice_number', 'invoice_date', 'customer_id', 'total'],
  purchase_invoices: ['invoice_number', 'invoice_date', 'supplier_id', 'total'],
  products: ['sku', 'name'],
  customers: ['name'],
  inventory: ['product_id', 'quantity'],
  payments: ['amount', 'payment_date'],
};

function normalized(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreFor(dataset: Dataset, fields: string[]): { score: number; evidence: string[] } {
  const profiles = new Map(dataset.columns.map((column) => [column.mappedField ?? '', column]));
  const evidence: string[] = [];
  let score = 0;
  for (const field of fields) {
    const column = profiles.get(field);
    if (!column) continue;
    const weight = field === 'name' || field === 'sku' || field === 'invoice_number' ? 30 : 20;
    const confidence = Math.max(0, Math.min(100, column.mappingConfidence));
    score += weight * confidence / 100;
    evidence.push(`${field}:${Math.round(confidence)}%`);
  }
  return { score: Math.min(100, Math.round(score)), evidence };
}

export function classifyDataset(dataset: Dataset): ClassificationResult {
  if (!dataset.rowCount || !dataset.columnCount) {
    return { reportType: 'document_analysis', confidence: 0, evidence: ['empty dataset'], requiresReview: true };
  }
  const candidates = (Object.entries(TYPE_FIELDS) as Array<[Exclude<ReportClassification, 'general_report' | 'document_analysis'>, string[]]>)
    .map(([reportType, fields]) => ({ reportType, ...scoreFor(dataset, fields) }))
    .sort((a, b) => b.score - a.score);
  const best = candidates[0];
  const second = candidates[1];
  if (!best || best.score < 35) {
    return { reportType: 'general_report', confidence: best?.score ?? 0, evidence: best?.evidence ?? [], requiresReview: true };
  }
  const confidence = Math.max(0, Math.min(100, Math.round(best.score - Math.max(0, (second?.score ?? 0) - 20) * 0.25)));
  return {
    reportType: best.reportType,
    confidence,
    evidence: best.evidence,
    requiresReview: confidence < 80 || (second != null && best.score - second.score < 15),
  };
}

function identifierColumns(dataset: Dataset): ColumnProfile[] {
  return dataset.columns.filter((column) => {
    const field = normalized(column.mappedField);
    return ['id', 'sku', 'code', 'customer_id', 'supplier_id', 'product_id', 'invoice_id', 'invoice_number'].some((key) => field === key || field.endsWith(`_${key}`));
  });
}

export function detectRelations(datasets: Dataset[]): RelationCandidate[] {
  const relations: RelationCandidate[] = [];
  for (let i = 0; i < datasets.length; i += 1) {
    for (let j = i + 1; j < datasets.length; j += 1) {
      const left = identifierColumns(datasets[i]);
      const right = identifierColumns(datasets[j]);
      for (const l of left) {
        for (const r of right) {
          const lf = normalized(l.mappedField);
          const rf = normalized(r.mappedField);
          if (!lf || !rf) continue;
          const same = lf === rf;
          const suffixMatch = lf.endsWith(`_${rf}`) || rf.endsWith(`_${lf}`);
          if (!same && !suffixMatch) continue;
          const confidence = Math.round((l.mappingConfidence + r.mappingConfidence) / 2);
          relations.push({
            leftDataset: datasets[i].name,
            rightDataset: datasets[j].name,
            leftField: l.name,
            rightField: r.name,
            relation: same ? 'one_to_many' : 'unknown',
            confidence,
            evidence: [`shared canonical key ${lf === rf ? lf : `${lf}/${rf}`}`, `mapping confidence ${confidence}%`],
          });
        }
      }
    }
  }
  return relations.sort((a, b) => b.confidence - a.confidence);
}

function hashText(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function valueForColumn(row: Record<string, unknown>, column: ColumnProfile): unknown {
  if (Object.prototype.hasOwnProperty.call(row, column.name)) return row[column.name];
  if (column.mappedField && Object.prototype.hasOwnProperty.call(row, column.mappedField)) return row[column.mappedField];
  return undefined;
}

export function rowFingerprint(row: Record<string, unknown>, columns: ColumnProfile[]): string {
  const ordered = columns
    .map((column) => `${normalized(column.mappedField || column.name)}=${normalized(valueForColumn(row, column))}`)
    .join('|');
  return hashText(ordered);
}

export function resolveRows(dataset: Dataset, existingRows: Array<Record<string, unknown>> = []): RowResolution[] {
  const fingerprints = new Map<string, Array<{ index: number; row: Record<string, unknown> }>>();
  existingRows.forEach((row, index) => {
    const fingerprint = rowFingerprint(row, dataset.columns);
    const bucket = fingerprints.get(fingerprint) ?? [];
    bucket.push({ index, row });
    fingerprints.set(fingerprint, bucket);
  });
  return dataset.rows.map((row) => {
    const fingerprint = rowFingerprint(row, dataset.columns);
    const exact = fingerprints.get(fingerprint)?.[0];
    if (exact) return { fingerprint, outcome: 'skip_exact', matchedRowIndex: exact.index, differingFields: [] };

    const candidates = existingRows.map((candidate, index) => {
      const shared = dataset.columns
        .map((column) => column)
        .filter((column) => {
          const incoming = normalized(valueForColumn(row, column));
          const current = normalized(valueForColumn(candidate, column));
          return incoming && current && incoming === current;
        });
      return {
        index,
        score: shared.length,
        differingFields: dataset.columns
          .filter((column) => normalized(valueForColumn(row, column)) !== normalized(valueForColumn(candidate, column)))
          .map((column) => column.mappedField || column.name),
      };
    }).filter((candidate) => candidate.score > 0).sort((a, b) => b.score - a.score);

    const candidate = candidates[0];
    if (!candidate) return { fingerprint, outcome: 'new', matchedRowIndex: null, differingFields: [] };
    const comparable = dataset.columns.filter((column) => normalized(valueForColumn(row, column)) || normalized(valueForColumn(existingRows[candidate.index], column)));
    const differenceRatio = comparable.length ? candidate.differingFields.length / comparable.length : 1;
    return {
      fingerprint,
      outcome: differenceRatio > 0.5 ? 'conflict' : 'candidate_duplicate',
      matchedRowIndex: candidate.index,
      differingFields: candidate.differingFields,
    };
  });
}

export function summarizeUniversalQuality(dataset: Dataset, resolutions: RowResolution[] = []): UniversalQualitySummary {
  const totalCells = Math.max(1, dataset.rowCount * dataset.columnCount);
  const missingCells = dataset.columns.reduce((sum, column) => sum + column.nullCount, 0);
  const completeness = Math.round(100 * (1 - Math.min(1, missingCells / totalCells)));
  const mapping = dataset.columns.length ? Math.round(dataset.columns.reduce((sum, column) => sum + column.mappingConfidence, 0) / dataset.columns.length) : 0;
  const typeConfidence = dataset.columns.length ? Math.round(dataset.columns.filter((column) => column.dataType !== 'unknown').length / dataset.columns.length * 100) : 0;
  const duplicateCount = resolutions.filter((row) => row.outcome === 'skip_exact' || row.outcome === 'candidate_duplicate').length;
  const conflictCount = resolutions.filter((row) => row.outcome === 'conflict').length;
  const warnings: string[] = [];
  if (mapping < 80) warnings.push('بعض الحقول لم تُفهم بثقة كافية؛ ستبقى قابلة للمراجعة.');
  if (completeness < 80) warnings.push('اكتمال المصدر منخفض بسبب قيم فارغة.');
  if (duplicateCount) warnings.push(`تم العثور على ${duplicateCount} صف/صفوف مرشحة للتكرار؛ لا يتم الدمج تلقائيًا.`);
  if (conflictCount) warnings.push(`تم العثور على ${conflictCount} تعارض/تعارضات؛ يلزم قرار صريح قبل الكتابة.`);
  const score = Math.round(completeness * 0.4 + mapping * 0.35 + typeConfidence * 0.25 - Math.min(20, conflictCount * 2));
  return { score: Math.max(0, Math.min(100, score)), completeness, mapping, typeConfidence, duplicateCount, conflictCount, warnings };
}
