import fs from 'node:fs';
const workflow = fs.readFileSync('.github/workflows/certification-evidence-boundary.yml', 'utf8');
for (const token of ['uses: actions/checkout@v7', 'uses: actions/setup-node@v7', 'node-version: 22']) {
  if (!workflow.includes(token)) throw new Error(`CERTIFICATION_WORKFLOW_ACTION_CONTRACT_MISSING:${token}`);
}
console.log('CERTIFICATION_WORKFLOW_ACTION_CONTRACT_PASS');
