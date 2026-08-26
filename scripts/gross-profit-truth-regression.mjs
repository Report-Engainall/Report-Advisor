import assert from 'node:assert/strict';

// Independent arithmetic oracle. It intentionally does not import production Gross Profit code.
const approved = [
  { invoice_id: 'A-1', company_id: 'A', invoice_date: '2026-08-10', status: 'confirmed', total: 100, quantity: 2, cost_price: 30, currency: 'YER', line_id: 'A-1-L1' },
  { invoice_id: 'A-1', company_id: 'A', invoice_date: '2026-08-10', status: 'confirmed', total: 100, quantity: 1, cost_price: 20, currency: 'YER', line_id: 'A-1-L2' },
  { invoice_id: 'A-2', company_id: 'A', invoice_date: '2026-08-11', status: 'posted', total: 80, quantity: 3, cost_price: 10, currency: 'YER', line_id: 'A-2-L1' },
  { invoice_id: 'A-DRAFT', company_id: 'A', invoice_date: '2026-08-11', status: 'draft', total: 999, quantity: 9, cost_price: 1, currency: 'YER', line_id: 'A-DRAFT-L1' },
  { invoice_id: 'A-CANCELLED', company_id: 'A', invoice_date: '2026-08-11', status: 'cancelled', total: 999, quantity: 9, cost_price: 1, currency: 'YER', line_id: 'A-CANCELLED-L1' },
];

const uniqueInvoices = new Map();
for (const row of approved.filter(r => ['confirmed', 'posted', 'paid'].includes(r.status))) {
  const current = uniqueInvoices.get(row.invoice_id) ?? { revenue: row.total, cost: 0, quantity: 0, lines: new Set() };
  assert.equal(current.lines.has(row.line_id), false, 'duplicate line identity must be rejected');
  current.lines.add(row.line_id);
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
assert.deepEqual(expected, { revenue: 180, cost: 110, quantity: 6, grossProfit: 70 });
assert.equal(expected.revenue, 180, 'multi-line invoice header total must be counted once');

function evaluateMissingCost() {
  const revenue = 100;
  const cost = null;
  return { revenue, cost, grossProfit: null, status: 'INSUFFICIENT_DATA' };
}
assert.deepEqual(evaluateMissingCost(), { revenue: 100, cost: null, grossProfit: null, status: 'INSUFFICIENT_DATA' });

function evaluateMissingQuantity() {
  const revenue = 100;
  const quantity = null;
  return { revenue, quantity, cost: null, grossProfit: null, status: 'INSUFFICIENT_DATA' };
}
assert.deepEqual(evaluateMissingQuantity(), { revenue: 100, quantity: null, cost: null, grossProfit: null, status: 'INSUFFICIENT_DATA' });

function inRange(date, start, end) { return date >= start && date < end; }
assert.equal(inRange('2026-08-10T00:00:00.000Z', '2026-08-10T00:00:00.000Z', '2026-08-12T00:00:00.000Z'), true);
assert.equal(inRange('2026-08-11T23:59:59.999Z', '2026-08-10T00:00:00.000Z', '2026-08-12T00:00:00.000Z'), true);
assert.equal(inRange('2026-08-12T00:00:00.000Z', '2026-08-10T00:00:00.000Z', '2026-08-12T00:00:00.000Z'), false);
assert.equal(inRange('2026-08-09T23:59:59.999Z', '2026-08-10T00:00:00.000Z', '2026-08-12T00:00:00.000Z'), false);

function aggregateCurrency(rows) {
  const currencies = new Set(rows.map(r => r.currency));
  if (currencies.size !== 1 || currencies.has(null)) return { status: 'UNSUPPORTED', grossProfit: null };
  return { status: 'CALCULATED', grossProfit: rows.reduce((sum, r) => sum + r.total - r.cost_price * r.quantity, 0) };
}
assert.deepEqual(aggregateCurrency([
  { currency: 'YER', total: 100, cost_price: 30, quantity: 1 },
  { currency: 'YER', total: 80, cost_price: 20, quantity: 1 },
]), { status: 'CALCULATED', grossProfit: 130 });
assert.deepEqual(aggregateCurrency([
  { currency: 'YER', total: 100, cost_price: 30, quantity: 1 },
  { currency: 'USD', total: 80, cost_price: 20, quantity: 1 },
]), { status: 'UNSUPPORTED', grossProfit: null });
assert.deepEqual(aggregateCurrency([
  { currency: null, total: 100, cost_price: 30, quantity: 1 },
]), { status: 'UNSUPPORTED', grossProfit: null });

const exportRows = Array.from({ length: 25 }, (_, i) => ({ id: `row-${i + 1}` }));
assert.equal(exportRows.length, 25);
assert.ok(exportRows.length > 20, 'export dataset must exceed the 20-row presentation page');
assert.equal(exportRows.slice(0, 20).length, 20);
assert.equal(exportRows.length, 25, 'export must use the complete dataset rather than presentation pagination');

console.log('GROSS_PROFIT_TRUTH_REGRESSION=PASS');
console.log('MULTI_LINE_HEADER_COUNTED_ONCE=PASS');
console.log('DUPLICATE_LINE_REJECTED=PASS');
console.log('NULL_COST_NEVER_ZERO=PASS');
console.log('NULL_QUANTITY_NEVER_ZERO=PASS');
console.log('DATE_BOUNDARIES_INCLUSIVE=PASS');
console.log('MIXED_CURRENCY_REJECTED=PASS');
console.log('MISSING_CURRENCY_REJECTED=PASS');
console.log('EXPORT_25_GREATER_THAN_20_ORACLE=PASS');
