import fs from 'node:fs';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
for (const row of fixture.sales) {
  const expectedGross = row.qty * row.unit_price;
  if (row.gross !== expectedGross) throw new Error(`BUSINESS_GOLDEN_GROSS_MISMATCH:${row.id}:${row.gross}!=${expectedGross}`);
  if (row.return > row.gross) throw new Error(`BUSINESS_GOLDEN_RETURN_EXCEEDS_GROSS:${row.id}`);
}
for (const row of fixture.purchases) {
  const expectedTotal = row.qty * row.unit_cost;
  if (row.total !== expectedTotal) throw new Error(`BUSINESS_GOLDEN_PURCHASE_TOTAL_MISMATCH:${row.id}:${row.total}!=${expectedTotal}`);
}
console.log('BUSINESS_GOLDEN_CORPUS_GROSS_LINE_MATH_PASS');
