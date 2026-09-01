import fs from 'node:fs';
const workflow = fs.readFileSync('.github/workflows/worker-hardening-contract.yml', 'utf8');
const guards = [
  'check-worker-lifecycle-guards.mjs',
  'check-worker-search-path-contract.mjs',
  'check-worker-lease-floor-contract.mjs',
  'check-worker-null-payload-contract.mjs',
  'check-worker-lease-clearance-contract.mjs',
  'check-worker-execution-grants-contract.mjs',
  'check-worker-checkpoint-monotonicity-contract.mjs',
  'check-worker-retry-eligibility-contract.mjs',
  'check-worker-terminality-contract.mjs',
  'check-worker-tenant-boundary-contract.mjs',
  'check-worker-rpc-signature-contract.mjs',
  'check-worker-return-contract.mjs',
  'check-worker-updated-at-contract.mjs',
  'check-worker-active-state-contract.mjs',
  'check-worker-completion-evidence-contract.mjs',
];
for (const guard of guards) if (!workflow.includes(guard)) throw new Error(`WORKER_WORKFLOW_GUARD_MISSING:${guard}`);
console.log(`WORKER_WORKFLOW_COVERAGE_PASS:${guards.length}`);
