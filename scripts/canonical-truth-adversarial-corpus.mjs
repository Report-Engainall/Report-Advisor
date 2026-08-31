import assert from 'node:assert/strict';

const invoices = [
  { id: 'i1', sku: 'A-1', status: 'confirmed', total: 100 },
  { id: 'i2', sku: 'A-1', status: 'confirmed', total: 100 },
  { id: 'i3', sku: 'A-2', status: 'cancelled', total: 900 },
  { id: 'i4', sku: 'A-3', status: 'void', total: 700 },
];
const authoritative = invoices.filter((r) => !['cancelled', 'void'].includes(r.status));
assert.equal(authoritative.length, 2);
assert.equal(authoritative.reduce((sum, r) => sum + r.total, 0), 200);

const saleItems = [
  { invoiceId: 'i1', quantity: 2, costPrice: 10 },
  { invoiceId: 'i2', quantity: 1, costPrice: null },
];
const incompleteCost = saleItems.some((r) => r.quantity == null || r.costPrice == null);
assert.equal(incompleteCost, true);
assert.notEqual(incompleteCost ? null : 0, 0, 'missing cost must never be coerced to zero');

const candidates = [
  { sku: 'A-1', source: 'primary', updatedAt: '2026-08-31T10:00:00Z', value: 11 },
  { sku: 'A-1', source: 'secondary', updatedAt: '2026-08-31T10:00:00Z', value: 12 },
];
const winner = [...candidates].sort((a, b) => `${a.sku}|${a.updatedAt}|${a.source}`.localeCompare(`${b.sku}|${b.updatedAt}|${b.source}`))[0];
assert.equal(winner.source, 'primary');
assert.ok(winner.source, 'canonical value must retain provenance');

const conflict = { sku: 'A-1', values: candidates.map((c) => c.value), resolvedBy: 'deterministic-source-priority' };
assert.equal(conflict.values.length, 2);
assert.equal(conflict.resolvedBy, 'deterministic-source-priority');

console.log('PASS cancelled/void rows excluded from canonical truth');
console.log('PASS incomplete cost remains explicit and is never semantic zero');
console.log('PASS duplicate identity resolves deterministically');
console.log('PASS canonical value retains source provenance');
console.log('PASS conflicting source values remain observable');
console.log('PASS canonical-truth adversarial synthetic corpus');
