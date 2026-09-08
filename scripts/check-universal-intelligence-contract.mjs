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

const sourceNamedExisting = [{ SKU: 'A-1', Name: 'Sugar' }, { SKU: 'B-2', Name: 'Tea' }];
const sourceNamedResolutions = resolveRows(products, sourceNamedExisting);
assert.equal(sourceNamedResolutions.every(r => r.outcome === 'skip_exact'), true);

// DB rows normally use canonical column names rather than source headers.
const canonicalExisting = [{ sku: 'A-1', name: 'Sugar' }, { sku: 'B-2', name: 'Tea' }];
const canonicalResolutions = resolveRows(products, canonicalExisting);
assert.equal(canonicalResolutions.every(r => r.outcome === 'skip_exact'), true);
assert.equal(rowFingerprint(products.rows[0], products.columns), rowFingerprint(canonicalExisting[0], products.columns));

// Same identity + changed data is a conflict, not a harmless duplicate.
const conflictDataset = { ...products, rows: [{ SKU: 'A-1', Name: 'Brown Sugar' }] };
const conflictResolutions = resolveRows(conflictDataset, canonicalExisting);
assert.equal(conflictResolutions[0]?.outcome, 'conflict');
assert.deepEqual(conflictResolutions[0]?.differingFields, ['name']);

// Customer identity: code is authoritative when present.
const customerColumns = [
  { name: 'Code', mappedField: 'code', mappingConfidence: 99, dataType: 'text', nullCount: 0, uniqueCount: 3, uniqueRatio: 1, sampleValues: [], statistics: { count: 3 }, qualityIssues: [] },
  { name: 'Name', mappedField: 'name', mappingConfidence: 99, dataType: 'text', nullCount: 0, uniqueCount: 3, uniqueRatio: 1, sampleValues: [], statistics: { count: 3 }, qualityIssues: [] },
  { name: 'Phone', mappedField: 'phone', mappingConfidence: 90, dataType: 'text', nullCount: 0, uniqueCount: 3, uniqueRatio: 1, sampleValues: [], statistics: { count: 3 }, qualityIssues: [] },
];
const customerDataset = {
  id: 'customers', name: 'Customers', source: 'test', rowCount: 3, columnCount: 3, columns: customerColumns,
  rows: [
    { Code: 'C-001', Name: 'Ahmed', Phone: '111' },
    { Code: '', Name: 'No Code Customer', Phone: '222' },
    { Code: '', Name: 'Exact No Code', Phone: '333' },
  ], preview: [], qualityScore: 100,
};
const customerExisting = [
  { code: 'C-001', name: 'Ahmed Old Name', phone: '999' },
  { code: null, name: 'No Code Customer', phone: '000' },
  { code: null, name: 'Exact No Code', phone: '333' },
  { code: 'C-002', name: 'Ahmed', phone: '555' },
];
const customerResolutions = resolveRows(customerDataset, customerExisting);
assert.equal(customerResolutions[0]?.outcome, 'conflict');
assert.ok(customerResolutions[0]?.differingFields.includes('name'));
assert.ok(customerResolutions[0]?.differingFields.includes('phone'));
assert.equal(customerResolutions[1]?.outcome, 'conflict');
assert.ok(customerResolutions[1]?.differingFields.includes('phone'));
assert.equal(customerResolutions[2]?.outcome, 'skip_exact');

// A coded customer must match by code, not by a shared name.
const codedDifferentCustomer = { ...customerDataset, rows: [{ Code: 'C-002', Name: 'Ahmed', Phone: '777' }] };
const codedDifferentResolution = resolveRows(codedDifferentCustomer, customerExisting);
assert.equal(codedDifferentResolution[0]?.outcome, 'conflict');
assert.equal(codedDifferentResolution[0]?.matchedRowIndex, 3);

// A new coded customer with an existing customer's name must remain NEW.
const codedNewSameName = { ...customerDataset, rows: [{ Code: 'C-003', Name: 'Ahmed', Phone: '888' }] };
const codedNewSameNameResolution = resolveRows(codedNewSameName, customerExisting);
assert.equal(codedNewSameNameResolution[0]?.outcome, 'new');
assert.equal(codedNewSameNameResolution[0]?.matchedRowIndex, null);

// An uncoded customer uses name as the deterministic fallback identity.
const uncodedFallback = { ...customerDataset, rows: [{ Code: '', Name: 'No Code Customer', Phone: '222' }] };
const uncodedFallbackResolution = resolveRows(uncodedFallback, customerExisting);
assert.equal(uncodedFallbackResolution[0]?.outcome, 'conflict');
assert.equal(uncodedFallbackResolution[0]?.matchedRowIndex, 1);

const quality = summarizeUniversalQuality(products, canonicalResolutions);
assert.equal(quality.duplicateCount, 2);
assert.equal(quality.conflictCount, 0);
assert.ok(quality.score >= 0 && quality.score <= 100);

console.log('Universal intelligence contract: PASS');
