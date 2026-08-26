import assert from 'node:assert/strict';

const A = 'tenant-a';
const B = 'tenant-b';
const PAGE_SIZE = 20;

// This dataset is the independent source of truth. It intentionally does not
// call or import any production financial consumer.
const fixture = [
  { id:'a-001', tenant:A, customer:'customer-1', date:'2026-01-01', quantity:2, lineTotal:100, costPrice:30, discount:0 },
  { id:'a-002', tenant:A, customer:'customer-1', date:'2026-01-15', quantity:1, lineTotal:75, costPrice:null, discount:5 },
  { id:'a-003', tenant:A, customer:'customer-2', date:'2026-02-28', quantity:3, lineTotal:210, costPrice:40, discount:10 },
  { id:'a-004', tenant:A, customer:'customer-2', date:'2026-03-31', quantity:4, lineTotal:320, costPrice:50, discount:null },
  { id:'b-001', tenant:B, customer:'customer-9', date:'2026-03-31', quantity:9, lineTotal:900, costPrice:60, discount:0 },
];

const required = (value, field) => {
  if (value === null || value === undefined || !Number.isFinite(value)) throw new Error(`INSUFFICIENT_DATA:${field}`);
  return value;
};
const inRange = (row, from, to) => row.date >= from && row.date <= to;
const scoped = (tenant, from='2026-01-01', to='2026-03-31') => fixture.filter(r => r.tenant === tenant && inRange(r, from, to));
const truth = rows => {
  const revenue = rows.reduce((s,r) => s + required(r.lineTotal,'lineTotal'), 0);
  const missingCost = rows.some(r => r.costPrice === null || r.costPrice === undefined);
  const cost = missingCost ? null : rows.reduce((s,r) => s + required(r.costPrice,'costPrice') * required(r.quantity,'quantity'), 0);
  const quantity = rows.reduce((s,r) => s + required(r.quantity,'quantity'), 0);
  return { revenue, cost, grossProfit: cost === null ? null : revenue - cost, quantity, status: missingCost ? 'INSUFFICIENT_DATA' : 'CALCULATED' };
};

const expected = {
  completeA: { revenue:630, cost:380, grossProfit:250, quantity:9, status:'CALCULATED' },
  incompleteA: { revenue:705, cost:null, grossProfit:null, quantity:10, status:'INSUFFICIENT_DATA' },
  tenantB: { revenue:900, cost:540, grossProfit:360, quantity:9, status:'CALCULATED' },
};
assert.deepEqual(truth(scoped(A).filter(r => r.costPrice !== null && r.costPrice !== undefined)), expected.completeA);
assert.deepEqual(truth(scoped(A)), expected.incompleteA);
assert.deepEqual(truth(scoped(B)), expected.tenantB);
assert.equal(scoped(A,'2026-01-01','2026-01-01').reduce((s,r)=>s+r.lineTotal,0),100);
assert.equal(scoped(A,'2026-03-31','2026-03-31').reduce((s,r)=>s+r.lineTotal,0),320);
assert.equal(scoped(A,'2025-12-01','2025-12-31').length,0);
assert.throws(() => required(null,'costPrice'), /INSUFFICIENT_DATA/);

const exportFixture = Array.from({length:25}, (_,i) => ({...fixture[i % fixture.length], id:`export-${i+1}`}));
assert.equal(exportFixture.length,25);
assert.ok(exportFixture.length > PAGE_SIZE);

// No synthetic surface projection is permitted. The runtime/browser harness
// must supply JSON captured from the actual production consumers. The JSON
// shape is intentionally explicit so a copied canonical result cannot masquerade
// as a surface result.
const raw = process.env.GROSS_PROFIT_SURFACE_RESULTS;
if (!raw) {
  console.error('GROSS_PROFIT_CROSS_SURFACE_FIXTURE: NOT_PROVEN');
  console.error('Missing GROSS_PROFIT_SURFACE_RESULTS from a real surface execution harness.');
  console.error('This test intentionally fails closed instead of projecting the canonical reference onto every surface.');
  process.exit(2);
}

let actual;
try { actual = JSON.parse(raw); } catch { throw new Error('GROSS_PROFIT_SURFACE_RESULTS must be valid JSON'); }
const surfaces = ['Dashboard','Reports','Analytics','BI','Decision','Export'];
const requiredFields = ['revenue','cost','grossProfit','quantity','status'];
for (const tenant of [A,B]) {
  for (const surface of surfaces) {
    const result = actual?.[tenant]?.[surface];
    assert.ok(result, `missing real result for ${tenant}/${surface}`);
    for (const field of requiredFields) assert.ok(Object.hasOwn(result,field), `${tenant}/${surface}: missing ${field}`);
    const expectedTruth = tenant === A ? expected.completeA : expected.tenantB;
    assert.deepEqual({revenue:result.revenue,cost:result.cost,grossProfit:result.grossProfit,quantity:result.quantity,status:result.status}, expectedTruth, `${tenant}/${surface}: REAL_TRUTH_BUG or boundary difference`);
  }
}

for (const tenant of [A,B]) {
  const exportResult = actual?.[tenant]?.Export;
  assert.ok(exportResult, `${tenant}/Export missing real result`);
  assert.equal(exportResult.rowCount,25, `${tenant}/Export: expected complete dataset, not current page`);
  assert.ok(exportResult.rowCount > PAGE_SIZE, `${tenant}/Export: export did not exceed presentation page size`);
}

// Explicit cross-tenant non-leak checks. A+B aggregate is not an accepted
// surface result; each authenticated tenant must be independently scoped.
assert.notDeepEqual(actual[A]?.Dashboard, actual[B]?.Dashboard, 'cross-tenant dashboard result unexpectedly identical');
assert.deepEqual(actual[A]?.Dashboard, expected.completeA, 'Tenant A result leaked or was miscomputed');
assert.deepEqual(actual[B]?.Dashboard, expected.tenantB, 'Tenant B result leaked or was miscomputed');

console.log('GROSS_PROFIT_CROSS_SURFACE_FIXTURE: PASS');
console.log(JSON.stringify({expected, surfaces, exportRows:25, execution:'REAL_SURFACE_RESULTS'}, null, 2));
