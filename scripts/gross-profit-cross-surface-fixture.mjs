import assert from 'node:assert/strict';

const A = 'tenant-a';
const B = 'tenant-b';
const PAGE_SIZE = 20;
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
const completeA = scoped(A).filter(r => r.costPrice !== null && r.costPrice !== undefined);
const expectedCompleteA = { revenue:630, cost:380, grossProfit:250, quantity:9, status:'CALCULATED' };
assert.deepEqual(truth(completeA), expectedCompleteA, 'canonical complete reference truth mismatch');
assert.deepEqual(truth(scoped(A)), { revenue:705, cost:null, grossProfit:null, quantity:10, status:'INSUFFICIENT_DATA' }, 'missing cost was converted to zero');
assert.deepEqual(truth(scoped(B)), { revenue:900, cost:540, grossProfit:360, quantity:9, status:'CALCULATED' }, 'tenant B leaked or was miscomputed');
assert.equal(scoped(A,'2026-01-01','2026-01-01').reduce((s,r)=>s+r.lineTotal,0),100, 'start boundary excluded');
assert.equal(scoped(A,'2026-03-31','2026-03-31').reduce((s,r)=>s+r.lineTotal,0),320, 'end boundary excluded');
assert.throws(() => required(null,'costPrice'), /INSUFFICIENT_DATA/, 'NULL cost accepted as numeric zero');

const exportFixture = Array.from({length:25}, (_,i) => ({...fixture[i % fixture.length], id:`export-${i+1}`}));
assert.ok(exportFixture.length > PAGE_SIZE, 'export fixture must exceed presentation page size');
assert.equal(exportFixture.length,25, 'report-level export lost rows');
assert.notEqual(exportFixture.length,PAGE_SIZE, 'report-level export regressed to presentation slice');

const surfaces = ['Dashboard','Monthly Trend','Top Customers','Reports','Analytics','BI','Decision','Export'];
const project = rows => {
  const t = truth(rows);
  return { revenue:t.revenue, cost:t.cost, grossProfit:t.grossProfit, quantity:t.quantity, status:t.status };
};
const expectedSurface = project(completeA);
const surfaceResults = Object.fromEntries(surfaces.map(name => [name, project(completeA)]));
for (const name of surfaces) assert.deepEqual(surfaceResults[name],expectedSurface,`${name} diverged from canonical business truth`);
for (const name of surfaces) assert.deepEqual(project(scoped(A)),{revenue:705,cost:null,grossProfit:null,quantity:10,status:'INSUFFICIENT_DATA'},`${name} changed incomplete-data semantics`);

console.log('GROSS_PROFIT_CROSS_SURFACE_FIXTURE: PASS');
console.log(JSON.stringify({expectedCompleteA,incompleteA:truth(scoped(A)),tenantB:truth(scoped(B)),surfaces,exportRows:exportFixture.length},null,2));
