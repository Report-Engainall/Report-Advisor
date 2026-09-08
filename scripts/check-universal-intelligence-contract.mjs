import assert from 'node:assert/strict';
import { classifyDataset, detectRelations, resolveRows, rowFingerprint, summarizeUniversalQuality } from '../src/lib/file-engine/universal-intelligence.ts';

const columns = [
  { name: 'SKU', mappedField: 'sku', mappingConfidence: 98, dataType: 'sku', nullCount: 0, uniqueCount: 2, uniqueRatio: 1, sampleValues: [], statistics: { count: 2 }, qualityIssues: [] },
  { name: 'Name', mappedField: 'name', mappingConfidence: 96, dataType: 'text', nullCount: 0, uniqueCount: 2, uniqueRatio: 1, sampleValues: [], statistics: { count: 2 }, qualityIssues: [] },
];
const products = { id: 'products', name: 'Products', source: 'test', rowCount: 2, columnCount: 2, columns, rows: [{ SKU: 'A-1', Name: 'Sugar' }, { SKU: 'B-2', Name: 'Tea' }], preview: [], qualityScore: 100 };
const classification = classifyDataset(products);
assert.equal(classification.reportType, 'products');
assert.equal(classification.requiresReview, false);
assert.ok(classification.confidence >= 80);

const customers = { ...products, id: 'customers', name: 'Customers', columns: [{ ...columns[1], name: 'Customer ID', mappedField: 'customer_id', mappingConfidence: 96 }, { ...columns[1], name: 'Name', mappedField: 'name' }] };
const relations = detectRelations([products, customers]);
assert.equal(relations.length, 0);

const existing = [{ SKU: 'A-1', Name: 'Sugar' }, { SKU: 'B-2', Name: 'Tea' }];
const resolutions = resolveRows(products, existing);
assert.equal(resolutions.every(r => r.outcome === 'skip_exact'), true);
assert.equal(rowFingerprint(products.rows[0], products.columns), rowFingerprint(products.rows[0], products.columns));
const quality = summarizeUniversalQuality(products, resolutions);
assert.equal(quality.duplicateCount, 2);
assert.equal(quality.conflictCount, 0);
assert.ok(quality.score >= 0 && quality.score <= 100);

console.log('Universal intelligence contract: PASS');
