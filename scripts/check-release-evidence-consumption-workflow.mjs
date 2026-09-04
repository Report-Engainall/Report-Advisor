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
  'release-dist.tar',
  'manifest_id',
  'certification-decision.json',
  'report-advisor-release-evidence-${{ github.sha }}',
]) requireToken(release, token, 'release-certification');

for (const token of [
  'workflow_run:',
  'workflows: [release-certification]',
  'types: [completed]',
  'actions: read',
  'actions/download-artifact@v4',
  'report-advisor-release-evidence-${{ github.event.workflow_run.head_sha || inputs.source_sha }}',
  'EXPECTED_SOURCE_SHA:',
  'RELEASE_CERTIFICATION_RUN_ID:',
  'RELEASE_EVIDENCE_ARTIFACT_NAME:',
  'RELEASE_EVIDENCE_ARTIFACT_PATH:',
  'RELEASE_EVIDENCE_MANIFEST_PATH:',
  'RELEASE_CERTIFICATION_DECISION_PATH:',
  'consumption-proof.json',
]) requireToken(boundary, token, 'production-evidence-boundary');

for (const token of [
  'Validate exact certification run provenance',
  'gh api "repos/${GITHUB_REPOSITORY}/actions/runs/${RUN_ID}"',
  "workflow_name=\"$(jq -r '.name' <<<\"$run_json\")\"",
  "head_sha=\"$(jq -r '.head_sha' <<<\"$run_json\")\"",
  '[[ "$workflow_name" == "release-certification" ]]',
  '[[ "$head_sha" == "$EXPECTED_SOURCE_SHA" ]]',
  '[[ "$event" == "workflow_dispatch" || "$event" == "push" ]]',
]) requireToken(boundary, token, 'release-certification run validation');

if (boundary.includes("github.event.workflow_run.conclusion == 'success'")) throw new Error('production-evidence-boundary must not deadlock on successful release-certification conclusion');
if (!boundary.includes('if: ${{ github.event_name == \'workflow_run\' || github.event_name == \'workflow_dispatch\' }}')) throw new Error('production-evidence-boundary must consume completed release-certification runs independently of conclusion');
if (!boundary.includes('if: success()')) throw new Error('production consumption proof upload must be fail-closed');
if (!boundary.includes('actions: read')) throw new Error('production boundary requires read access to exact release artifacts');

console.log('release evidence consumption workflow contract: PASS (completed-run independent consumer, exact-run binding, artifact bytes binding)');
