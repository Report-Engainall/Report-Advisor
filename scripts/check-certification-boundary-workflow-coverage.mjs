import fs from 'node:fs';
const workflow = fs.readFileSync('.github/workflows/certification-evidence-boundary.yml', 'utf8');
const guards = [
  'check-certification-evidence-order-contract.mjs',
  'check-certification-score-contract.mjs',
  'check-certification-fail-closed-contract.mjs',
  'check-certification-duplicate-contract.mjs',
  'check-certification-missing-failed-contract.mjs',
  'check-certification-key-uniqueness-contract.mjs',
  'check-certification-unknown-key-contract.mjs',
  'check-certification-blocker-propagation-contract.mjs',
  'check-certification-warning-separation-contract.mjs',
  'check-certification-evidence-preservation-contract.mjs',
  'check-certification-set-membership-contract.mjs',
  'check-certification-adversarial-coverage-contract.mjs',
  'check-certification-writer-table-coverage-contract.mjs',
];
for (const guard of guards) if (!workflow.includes(guard)) throw new Error(`CERTIFICATION_WORKFLOW_GUARD_MISSING:${guard}`);
console.log('CERTIFICATION_BOUNDARY_WORKFLOW_COVERAGE_PASS');
