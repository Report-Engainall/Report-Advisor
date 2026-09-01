import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/certification-evidence-boundary.yml', 'utf8');

for (const required of [
  'permissions:\n  contents: read',
  'persist-credentials: false',
  'fetch-depth: 1',
  'workflow_dispatch:',
  'branches: [main]',
]) {
  if (!workflow.includes(required)) {
    throw new Error(`CERTIFICATION_WORKFLOW_SECURITY_CONTRACT_MISSING:${required.replaceAll('\n', '|')}`);
  }
}

console.log('CERTIFICATION_WORKFLOW_SECURITY_CONTRACT_PASS');
