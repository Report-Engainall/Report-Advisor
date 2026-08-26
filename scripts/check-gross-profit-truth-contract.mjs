import fs from 'node:fs';

const queries = fs.readFileSync('src/lib/queries.ts', 'utf8');
const semanticMetrics = fs.readFileSync('src/lib/semanticMetrics.ts', 'utf8');
const metricContract = fs.readFileSync('docs/metric-contract.md', 'utf8');

const failures = [];

if (/requiredNumber\(i\.subtotal,'sales_invoices\.subtotal'\)/.test(queries)) {
  failures.push('Dashboard KPI gross-profit revenue still uses sales_invoices.subtotal instead of sale_items.line_total.');
}

if (!/line_total\s*\-\s*cost_price\s*\*\s*quantity/.test(semanticMetrics)) {
  failures.push('Semantic gross-profit formula is missing the canonical line_total - cost_price * quantity expression.');
}

if (!/Sum of `sale_items\.line_total`/.test(metricContract)) {
  failures.push('Metric contract does not define revenue from sale_items.line_total.');
}

if (!/NULL|MISSING/.test(fs.readFileSync('src/lib/canonicalFinancialTruth.ts', 'utf8')) || !/INSUFFICIENT_DATA/.test(fs.readFileSync('src/lib/canonicalFinancialTruth.ts', 'utf8'))) {
  failures.push('Canonical financial truth boundary is missing explicit missing-data handling.');
}

if (failures.length) {
  console.error('GROSS_PROFIT_TRUTH_CONTRACT_FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('GROSS_PROFIT_TRUTH_CONTRACT_PASS');
