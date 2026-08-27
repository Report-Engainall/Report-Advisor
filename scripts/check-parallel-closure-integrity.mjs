import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/deep-truth-closure.yml','utf8');
const required = [
  'test:profitability-truth',
  'test:receivables-aging-truth',
  'test:financial-aggregation-consumers',
  'test:dashboard-truth',
  'check-cross-surface-traceability.mjs',
  'check-semantic-truth-conversions.mjs',
  'check-export-completeness-contract.mjs',
];
const missing = required.filter(token => !workflow.includes(token));
if (missing.length) {
  console.error('PARALLEL_CLOSURE_INTEGRITY_FAIL');
  for (const item of missing) console.error(`- missing gate: ${item}`);
  process.exit(1);
}
console.log('PARALLEL_CLOSURE_INTEGRITY_PASS');
