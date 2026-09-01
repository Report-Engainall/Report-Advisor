import fs from 'node:fs';
const workflow = fs.readFileSync('.github/workflows/worker-hardening-contract.yml', 'utf8');
if (!workflow.includes('timeout-minutes: 10')) throw new Error('WORKER_WORKFLOW_TIMEOUT_MISSING:10');
console.log('WORKER_WORKFLOW_TIMEOUT_CONTRACT_PASS');
