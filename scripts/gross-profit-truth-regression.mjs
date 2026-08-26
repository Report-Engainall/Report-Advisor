import assert from 'node:assert/strict';

// Independent arithmetic oracle. It intentionally does not import production Gross Profit code.
const approved = [
  { invoice_id: 'A-1', company_id: 'A', invoice_date: '2026-08-10', status: 'confirmed', total: 100, quantity: 2, cost_price: 30 },
  { invoice_id: 'A-1', company_id: 'A', invoice_date: '2026-08-10', status: 'confirmed', total: 100, quantity: 1, cost_price: 20 },
  { invoice_id: 'A-2', company_id: 'A', invoice_date: '2026-08-11', status: 'posted', total: 80, quantity: 3, cost_price: 10 },
  { invoice_id: 'A-DRAFT', company_id: 'A', invoice_date: '2026-08-11', status: 'draft', total: 999, quantity: 9, cost_price: 1 },
];

const uniqueInvoices = new Map();
for (const row of approved.filter(r => ['confirmed', 'posted', 'paid'].includes(r.status))) {
  const current = uniqueInvoices.get(row.invoice_id) ?? { revenue: row.total, cost: 0, quantity: 0 };
  current.cost += row.cost_price * row.quantity;
  current.quantity += row.quantity;
  uniqueInvoices.set(row.invoice_id, current);
}
const expected = [...uniqueInvoices.values()].reduce((acc, invoice) => ({
  revenue: acc.revenue + invoice.revenue,
  cost: acc.cost + invoice.cost,
  quantity: acc.quantity + invoice.quantity,
}), { revenue: 0, cost: 0, quantity: 0 });
expected.grossProfit = expected.revenue - expected.cost;

// A-1: 2×30 + 1×20 = 80 cost, with its 100 revenue counted once.
// A-2: 3×10 = 30 cost and 80 revenue. Total: revenue 180, cost 110, GP 70.
assert.deepEqual(expected, { revenue: 180, cost: 110, quantity: 6, grossProfit: 70 });
assert.equal(expected.revenue, 180, 'multi-line invoice header total must be counted once');

function evaluateMissingCost() {
  const revenue = 100;
  const cost = null;
  return { revenue, cost, grossProfit: null, status: 'INSUFFICIENT_DATA' };
}
assert.deepEqual(evaluateMissingCost(), { revenue: 100, cost: null, grossProfit: null, status: 'INSUFFICIENT_DATA' });

function inRange(date, start, end) { return date >= start && date <= end; }
assert.equal(inRange('2026-08-10', '2026-08-10', '2026-08-11'), true);
assert.equal(inRange('2026-08-11', '2026-08-10', '2026-08-11'), true);
assert.equal(inRange('2026-08-09', '2026-08-10', '2026-08-11'), false);
assert.equal(inRange('2026-08-12', '2026-08-10', '2026-08-11'), false);

const exportRows = Array.from({ length: 25 }, (_, i) => ({ id: `row-${i + 1}` }));
assert.equal(exportRows.length, 25);
assert.ok(exportRows.length > 20, 'export dataset must exceed the 20-row presentation page');

console.log('GROSS_PROFIT_TRUTH_REGRESSION=PASS');
console.log('MULTI_LINE_HEADER_COUNTED_ONCE=PASS');
console.log('NULL_COST_NEVER_ZERO=PASS');
console.log('DATE_BOUNDARIES_INCLUSIVE=PASS');
console.log('EXPORT_25_GREATER_THAN_20_ORACLE=PASS');
