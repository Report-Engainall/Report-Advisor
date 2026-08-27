import fs from 'node:fs';

const checks = [
  ['tenant', 'scripts/check-inventory-intelligence-tenant-authority.mjs'],
  ['cross-surface', 'scripts/check-cross-surface-truth-contract.mjs'],
  ['export', 'scripts/check-export-completeness-contract.mjs'],
];
const missing = checks.filter(([, p]) => !fs.existsSync(p));
if (missing.length) {
  console.error('PARALLEL_CLOSURE_ORCHESTRATOR_FAIL');
  missing.forEach(([n,p]) => console.error(`- ${n}: ${p}`));
  process.exit(1);
}
console.log(`PARALLEL_CLOSURE_ORCHESTRATOR_PASS: ${checks.length} closure fronts wired`);
