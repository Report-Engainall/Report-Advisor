import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/certification-evidence-boundary.yml', 'utf8');

if (!workflow.includes('pull_request:\n    branches: [main]')) {
  throw new Error('CERTIFICATION_WORKFLOW_PULL_REQUEST_TRIGGER_MISSING');
}
if (!workflow.includes('workflow_dispatch:')) {
  throw new Error('CERTIFICATION_WORKFLOW_MANUAL_TRIGGER_MISSING');
}
if (!workflow.includes('permissions:\n  contents: read')) {
  throw new Error('CERTIFICATION_WORKFLOW_READ_ONLY_PERMISSION_MISSING');
}

console.log('CERTIFICATION_WORKFLOW_TRIGGER_CONTRACT_PASS');
