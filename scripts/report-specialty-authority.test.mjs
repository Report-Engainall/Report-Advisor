import assert from 'node:assert/strict';

const { resolveEffectiveSpecialty } = await import('../src/lib/report-smart.ts');

const inferredInventoryAnalysis = {
  datasets: [
    {
      columns: [
        { name: 'SKU' },
        { name: 'الصنف' },
        { name: 'المخزون' },
        { name: 'warehouse' },
        { name: 'quantity' },
      ],
      preview: [
        { SKU: 'A-1', الصنف: 'Item A', المخزون: 10, warehouse: 'Main', quantity: 10 },
      ],
    },
  ],
};

assert.equal(
  resolveEffectiveSpecialty('sales', inferredInventoryAnalysis),
  'sales',
  'source-bound persisted specialty must override inference',
);
assert.equal(
  resolveEffectiveSpecialty(null, inferredInventoryAnalysis),
  'inventory',
  'inference is still used when persisted specialty is absent',
);

console.log('PASS: source-bound report specialty overrides analysis inference');
