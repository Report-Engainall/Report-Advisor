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
  entityType: 'products' | 'customers' | 'sales_invoices' | 'purchase_invoices' | 'suppliers' | 'inventory_balances' | 'payments' | 'generic:source-data';
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

type CanonicalRequiredField = string | string[];
type CanonicalWriteFields = Record<CanonicalImportSpecialty, CanonicalRequiredField[]>;

const CANONICAL_WRITE_FIELDS: CanonicalWriteFields = {
  sales: ['invoice_number', 'invoice_date', 'subtotal', 'tax_amount', 'total', 'paid_amount', 'status'],
  purchases: ['invoice_number', 'invoice_date', ['supplier_id', 'supplier_name', 'supplier_code'], 'subtotal', 'tax_amount', 'total', 'paid_amount', 'status'],
  customers: ['name', 'segment', 'credit_limit', 'payment_terms_days'],
  products: ['sku', 'name', 'unit', 'cost_price', 'selling_price', 'min_stock', 'reorder_point', 'is_active'],
  inventory: [['product_id', 'sku', 'product_name'], 'quantity'],
  suppliers: ['name'],
  payments: [['payment_id', 'reference'], 'payment_date', 'payment_amount', 'direction'],
  other: [],
};

function missingCanonicalWriteFields(
  specialty: CanonicalImportSpecialty,
  datasets: Dataset[],
): string[] {
  if (!(specialty in CANONICAL_WRITE_FIELDS)) return [];
  const required = CANONICAL_WRITE_FIELDS[specialty as keyof CanonicalWriteFields];
  const missing = new Set<string>();
  for (const dataset of datasets) {
    const datasetFields = new Set(
      dataset.columns.map((column) => column.mappedField).filter(Boolean) as string[],
    );
    for (const field of required) {
      const alternatives = Array.isArray(field) ? field : [field];
      if (!alternatives.some((candidate) => datasetFields.has(candidate))) missing.add(alternatives.join('|'));
    }
  }
  return [...missing];
}

function inferEntityType(specialty: CanonicalImportSpecialty, datasets: Dataset[]): CanonicalSourceUnderstanding['entityType'] {
  const missing = missingCanonicalWriteFields(specialty, datasets);
  if (missing.length > 0) return 'generic:source-data';
  if (specialty === 'products') return 'products';
  if (specialty === 'customers') return 'customers';
  if (specialty === 'sales') return 'sales_invoices';
  if (specialty === 'purchases') return 'purchase_invoices';
  if (specialty === 'suppliers') return 'suppliers';
  if (specialty === 'inventory') return 'inventory_balances';
  if (specialty === 'payments') return 'payments';
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
  const entityType = mixedSpecialtySource ? 'generic:source-data' : inferEntityType(specialty, datasets);
  const missingCanonicalFields = missingCanonicalWriteFields(specialty, datasets);
  if (datasets.length > 1) warnings.push('MULTI_DATASET_SOURCE:' + datasets.length);
  if (mixedSpecialtySource) {
    warnings.push('MULTI_SPECIALTY_SOURCE_REQUIRES_GENERIC_CANONICAL_BOUNDARY');
  }
  if (entityType === 'generic:source-data' && missingCanonicalFields.length > 0) {
    warnings.push('CANONICAL_ENTITY_REQUIREMENTS_UNMET:' + specialty + ':' + missingCanonicalFields.join(','));
  }
  if (qualityScore < 75) warnings.push('SOURCE_REVIEW_REQUIRED:' + qualityScore);
  return {
    datasetCount: datasets.length,
    rowCount,
    columnCount: columns.length,
    qualityScore,
    specialty,
    specialtyConfidence,
    entityType,
    columns,
    rows,
    datasets: summaries,
    warnings,
  };
}