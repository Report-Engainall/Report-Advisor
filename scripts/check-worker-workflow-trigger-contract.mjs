import fs from 'node:fs';
const workflow = fs.readFileSync('.github/workflows/worker-hardening-contract.yml', 'utf8');
for (const token of ['  push:\n    paths:', '  pull_request:\n    paths:', "'supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql'", "'scripts/check-worker-*-contract.mjs'", "'scripts/report-execution-runtime.test.ts'"]) {
  if (!workflow.includes(token)) throw new Error(`WORKER_WORKFLOW_TRIGGER_CONTRACT_MISSING:${token}`);
}
console.log('WORKER_WORKFLOW_TRIGGER_CONTRACT_PASS');
