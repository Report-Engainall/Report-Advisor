import fs from 'node:fs';
const workflow = fs.readFileSync('.github/workflows/certification-evidence-boundary.yml', 'utf8');
if (!workflow.includes('timeout-minutes: 10')) throw new Error('CERTIFICATION_WORKFLOW_TIMEOUT_MISSING:10');
console.log('CERTIFICATION_WORKFLOW_TIMEOUT_CONTRACT_PASS');
