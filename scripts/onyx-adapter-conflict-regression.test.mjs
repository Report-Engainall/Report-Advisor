import assert from 'node:assert/strict';
import { adaptOnyxRows } from '../src/lib/import-pipeline/onyx-pro-adapter.ts';

const headers = ['رقم الصنف', 'SKU', 'اسم الصنف', 'السعر'];

const sameValue = adaptOnyxRows(headers, [{ 'رقم الصنف': '1001', SKU: '1001', 'اسم الصنف': 'دقيق', 'السعر': 50 }]);
assert.deepEqual(sameValue.conflictingHeaders, [], 'Equivalent duplicate identity values must not be treated as a conflict');

const conflicting = adaptOnyxRows(headers, [{ 'رقم الصنف': '1001', SKU: '1002', 'اسم الصنف': 'دقيق', 'السعر': 50 }]);
assert.equal(conflicting.conflictingHeaders.length, 1, 'Conflicting aliases must be surfaced');
assert.equal(conflicting.rows[0]['رقم الصنف'] ?? conflicting.rows[0].sku, '1001');

const emptyAlias = adaptOnyxRows(headers, [{ 'رقم الصنف': '1001', SKU: '', 'اسم الصنف': 'دقيق', 'السعر': 50 }]);
assert.deepEqual(emptyAlias.conflictingHeaders, [], 'Empty aliases must not create false conflicts');

console.log('Onyx duplicate-canonical conflict regression: PASS');
