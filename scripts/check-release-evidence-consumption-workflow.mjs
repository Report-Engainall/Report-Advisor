import fs from 'node:fs';

const release = fs.readFileSync('.github/workflows/release-certification.yml', 'utf8');
const boundary = fs.readFileSync('.github/workflows/production-evidence-boundary.yml', 'utf8');

const requireToken = (source, token, label) => {
  if (!source.includes(token)) throw new Error(`${label}: missing ${token}`);
};

for (const token of [
  'source_sha',
  'certification_run_id',
  'migrations_fingerprint',
  'dependency_lock_fingerprint',
  'artifact_fingerprint',
  'manifest_id',
  'certification-decision.json',
  'report-advisor-release-evidence-${{ github.sha }}',
]) requireToken(release, token, 'release-certification');

for (const token of [
  'workflow_run:',
  'workflows: [release-certification]',
  "github.event.workflow_run.conclusion == 'success'",
  'actions: read',
  'actions/download-artifact@v4',
  'report-advisor-release-evidence-${{ github.event.workflow_run.head_sha || inputs.source_sha }}',
  'EXPECTED_SOURCE_SHA:',
  'RELEASE_CERTIFICATION_RUN_ID:',
  'RELEASE_EVIDENCE_ARTIFACT_NAME:',
  'RELEASE_EVIDENCE_MANIFEST_PATH:',
  'RELEASE_CERTIFICATION_DECISION_PATH:',
  'consumption-proof.json',
]) requireToken(boundary, token, 'production-evidence-boundary');

if (boundary.includes('push:\n    branches: [main]')) throw new Error('production-evidence-boundary must not consume an unbound push without release evidence');
if (!boundary.includes('if-no-files-found: error')) throw new Error('production consumption proof must fail closed when absent');

console.log('release evidence consumption workflow contract: PASS');
