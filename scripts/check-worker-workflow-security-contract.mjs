import fs from 'node:fs';
const workflow = fs.readFileSync('.github/workflows/worker-hardening-contract.yml', 'utf8');
for (const token of [
  'permissions:\n  contents: read',
  'uses: actions/checkout@v4',
  'fetch-depth: 1',
  'persist-credentials: false',
  'uses: actions/setup-node@v4',
  'node-version: 22',
]) {
  if (!workflow.includes(token)) throw new Error(`WORKER_WORKFLOW_SECURITY_TOKEN_MISSING:${token}`);
}
console.log('WORKER_WORKFLOW_SECURITY_CONTRACT_PASS');
