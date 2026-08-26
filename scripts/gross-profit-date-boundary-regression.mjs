const rows = [
  { id: 'before', invoice_date: '2026-08-09', value: 10 },
  { id: 'start', invoice_date: '2026-08-10', value: 20 },
  { id: 'middle', invoice_date: '2026-08-15', value: 30 },
  { id: 'end', invoice_date: '2026-08-20', value: 40 },
  { id: 'after', invoice_date: '2026-08-21', value: 50 },
];
const inInclusiveRange = (date, start, end) => date >= start && date <= end;
const selected = rows.filter((row) => inInclusiveRange(row.invoice_date, '2026-08-10', '2026-08-20'));
const ids = selected.map((row) => row.id);
const expected = ['start', 'middle', 'end'];
if (JSON.stringify(ids) !== JSON.stringify(expected)) throw new Error(`Date boundary regression failed: got ${ids.join(',')}`);
if (rows.filter((row) => inInclusiveRange(row.invoice_date, '2026-08-10', '2026-08-20')).some((row) => row.id === 'before' || row.id === 'after')) throw new Error('Outside-boundary row included');
if (!inInclusiveRange('2026-08-10', '2026-08-10', '2026-08-20')) throw new Error('Start boundary excluded');
if (!inInclusiveRange('2026-08-20', '2026-08-10', '2026-08-20')) throw new Error('End boundary excluded');
if (inInclusiveRange('2026-08-09', '2026-08-10', '2026-08-20')) throw new Error('Before-start boundary included');
if (inInclusiveRange('2026-08-21', '2026-08-10', '2026-08-20')) throw new Error('After-end boundary included');
console.log('Gross Profit date boundary regression: PASS (start included, end included, outside excluded)');
