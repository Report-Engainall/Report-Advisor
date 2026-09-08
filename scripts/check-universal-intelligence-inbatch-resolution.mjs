import { resolveRows } from '../src/lib/file-engine/universal-intelligence.ts';

const column = (name, mappedField) => ({
  name,
  mappedField,
  mappingConfidence: 100,
  requiresReview: false,
  dataType: 'text',
  nullCount: 0,
  uniqueCount: 1,
  uniqueRatio: 1,
  sampleValues: [],
  statistics: { count: 1 },
  qualityIssues: [],
});

const productColumns = [column('SKU', 'sku'), column('Name', 'name')];
const dataset = (rows) => ({
  id: 'inbatch-test',
  name: 'products',
  source: 'contract-test',
  rowCount: rows.length,
  columnCount: productColumns.length,
  columns: productColumns,
  rows,
  preview: rows,
  qualityScore: 100,
});

const exactDuplicate = resolveRows(dataset([
  { SKU: 'P-001', Name: 'Sugar' },
  { SKU: 'P-001', Name: 'Sugar' },
]));
if (exactDuplicate[0].outcome !== 'new') throw new Error('first occurrence must remain new');
if (exactDuplicate[1].outcome !== 'candidate_duplicate' || exactDuplicate[1].matchedRowIndex !== 0) {
  throw new Error('second identical incoming row must be candidate_duplicate against the first incoming row');
}

const sameIdentityConflict = resolveRows(dataset([
  { SKU: 'P-002', Name: 'Sugar 1kg' },
  { SKU: 'P-002', Name: 'Sugar 2kg' },
]));
if (sameIdentityConflict[0].outcome !== 'new') throw new Error('first identity occurrence must remain new');
if (sameIdentityConflict[1].outcome !== 'conflict' || sameIdentityConflict[1].matchedRowIndex !== 0) {
  throw new Error('same incoming identity with changed content must be conflict');
}

const existingConflict = resolveRows(dataset([{ SKU: 'P-003', Name: 'Sugar 2kg' }]), [
  { sku: 'P-003', name: 'Sugar 1kg' },
]);
if (existingConflict[0].outcome !== 'conflict' || existingConflict[0].matchedRowIndex !== 0) {
  throw new Error('existing identity with changed content must be conflict');
}

console.log('PASS universal intelligence in-batch resolution contract');
