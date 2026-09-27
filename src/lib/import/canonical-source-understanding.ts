import type { ColumnProfile, Dataset } from '../file-engine/types';

export type CanonicalImportSpecialty =
  | 'sales'
  | 'purchases'
  | 'inventory'
  | 'customers'
  | 'suppliers'
  | 'products'
  | 'payments'
  | 'other';

export interface CanonicalDatasetSummary {
  name: string;
  sheet: string | null;
  rowCount: number;
  columnCount: number;
  qualityScore: number;
  specialty: CanonicalImportSpecialty;
  specialtyConfidence: number;
}

export interface CanonicalSourceUnderstanding {
  datasetCount: number;
  rowCount: number;
  columnCount: number;
  qualityScore: number;  specialty: CanonicalImportSpecialty;
  specialtyConfidence: number;
  entityType: 'products' | 'customers' | 'sales_invoices' | 'generic:source-data';
  columns: ColumnProfile[];
  rows: Record<string, unknown>[];
  datasets: CanonicalDatasetSummary[];
  warnings: string[];
}

type SpecialtySignals = Record<CanonicalImportSpecialty, string[]>;

const SIGNALS: SpecialtySignals = {
  sales: ['invoice_number', 'invoice_date', 'sales_amount', 'customer_name', 'total', 'subtotal'],
  purchases: ['purchase_number', 'purchase_date', 'purchase_amount', 'supplier_id', 'supplier_name', 'vendor'],
  inventory: ['stock', 'quantity', 'warehouse', 'reorder_level', 'inventory', 'on_hand'],
  customers: ['customer_id', 'customer_name', 'phone', 'email', 'address'],
  suppliers: ['supplier_id', 'supplier_name', 'vendor_id', 'vendor_name'],
  products: ['sku', 'product_name', 'barcode', 'price', 'unit_price', 'cost'],
  payments: ['payment_id', 'payment_date', 'payment_amount', 'paid_amount', 'payment_method', 'bank'],
  other: [],
};

function tokens(dataset: Dataset): Set<string> {  const result = new Set<string>();
  for (const column of dataset.columns) {
    if (column.mappedField) result.add(column.mappedField.toLowerCase().trim());
    result.add(column.name.toLowerCase().replace(/[^a-z0-9_]+/g, '_'));
  }
  return result;
}

function scoreDataset(dataset: Dataset): { specialty: CanonicalImportSpecialty; confidence: number; scores: Map<CanonicalImportSpecialty, number> } {
  const present = tokens(dataset);
  const scores = new Map<CanonicalImportSpecialty, number>();
  (Object.keys(SIGNALS) as CanonicalImportSpecialty[]).forEach((specialty) => {
    const matches = SIGNALS[specialty].reduce((total, signal) => total + (present.has(signal) ? 1 : 0), 0);
    if (matches > 0) scores.set(specialty, matches);
  });
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked[0];  if (!top || top[1] < 1) return { specialty: 'other', confidence: 0, scores };
  const total = ranked.reduce((sum, [, score]) => sum + score, 0);
  const agreement = total ? (top[1] / total) * 100 : 0;
  const mappingCoverage = dataset.columnCount
    ? (dataset.columns.filter((column) => Boolean(column.mappedField)).length / dataset.columnCount) * 100
    : 0;
  const confidence = Math.min(99, Math.round((agreement * 0.55) + (mappingCoverage * 0.45)));
  return { specialty: top[0], confidence, scores };
}

function inferEntityType(specialty: CanonicalImportSpecialty, datasets: Dataset[]): CanonicalSourceUnderstanding['entityType'] {
  const allFields = new Set(
    datasets.flatMap((dataset) => dataset.columns.map((column) => column.mappedField).filter(Boolean) as string[]),
  );
  if (specialty === 'products' && allFields.has('sku')) return 'products';
  if (specialty === 'customers' && (allFields.has('customer_id') || allFields.has('customer_name'))) return 'customers';  if (specialty === 'sales' && allFields.has('invoice_number')) return 'sales_invoices';
  return 'generic:source-data';
}

export function understandCanonicalSource(datasets: Dataset[]): CanonicalSourceUnderstanding {
  if (!datasets.length) throw new Error('CANONICAL_SOURCE_UNDERSTANDING_EMPTY');
  const summaries = datasets.map((dataset) => {
    const scored = scoreDataset(dataset);
    return {
      name: dataset.name,
      sheet: dataset.sheet ?? null,
      rowCount: dataset.rowCount,
      columnCount: dataset.columnCount,
      qualityScore: dataset.qualityScore,
      specialty: scored.specialty,
      specialtyConfidence: scored.confidence,
    };
  });
  const rowCount = datasets.reduce((sum, dataset) => sum + dataset.rows.length, 0);
  const columnOwners = new Map<string, ColumnProfile>();
  for (const dataset of datasets) {
    for (const column of dataset.columns) {      const previous = columnOwners.get(column.name);
      if (!previous || column.mappingConfidence > previous.mappingConfidence) columnOwners.set(column.name, column);
    }
  }
  const columns = [...columnOwners.values()];
  const rows = datasets.flatMap((dataset) => dataset.rows);
  const weightedQuality = rowCount
    ? datasets.reduce((sum, dataset) => sum + (dataset.qualityScore * dataset.rows.length), 0) / rowCount
    : 0;
  const qualityScore = datasets.length
    ? Math.min(Math.round(weightedQuality), ...datasets.map((dataset) => Math.round(dataset.qualityScore)))
    : 0;
  const aggregateScores = new Map<CanonicalImportSpecialty, number>();
  for (const dataset of datasets) {
    const scored = scoreDataset(dataset);
    for (const [specialty, score] of scored.scores) {
      aggregateScores.set(specialty, (aggregateScores.get(specialty) ?? 0) + score);
    }  }
  const aggregateRanked = [...aggregateScores.entries()].sort((a, b) => b[1] - a[1]);
  const specialty = aggregateRanked[0]?.[0] ?? 'other';
  const totalSignal = aggregateRanked.reduce((sum, [, score]) => sum + score, 0);
  const specialtyConfidence = totalSignal && aggregateRanked[0]
    ? Math.min(99, Math.round((aggregateRanked[0][1] / totalSignal) * 100))
    : 0;
  const warnings: string[] = [];
  const mixedSpecialtySource = new Set(summaries.map((summary) => summary.specialty)).size > 1;
  if (datasets.length > 1) warnings.push('MULTI_DATASET_SOURCE:' + datasets.length);
  if (mixedSpecialtySource) {
    warnings.push('MULTI_SPECIALTY_SOURCE_REQUIRES_GENERIC_CANONICAL_BOUNDARY');
  }
  if (qualityScore < 75) warnings.push('SOURCE_REVIEW_REQUIRED:' + qualityScore);
  return {
    datasetCount: datasets.length,
    rowCount,
    columnCount: columns.length,
    qualityScore,
    specialty,
    specialtyConfidence,
    entityType: mixedSpecialtySource ? 'generic:source-data' : inferEntityType(specialty, datasets),
    columns,
    rows,
    datasets: summaries,
    warnings,
  };
}
