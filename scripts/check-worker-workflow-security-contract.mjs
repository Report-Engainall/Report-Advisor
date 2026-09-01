import fs from 'node:fs';
const workflow = fs.readFileSync('.github/workflows/worker-hardening-contract.yml', 'utf8');
for (const token of ['uses: actions/checkout@v4', 'uses: actions/setup-node@v4', 'node-version: 22']) {
  if (!workflow.includes(token)) throw new Error(`WORKER_WORKFLOW_SECURITY_TOKEN_MISSING:${token}`);
}
console.log('WORKER_WORKFLOW_SECURITY_CONTRACT_PASS');
