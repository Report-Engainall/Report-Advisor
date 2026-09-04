import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), '.github/workflows');
const files = fs.readdirSync(dir).filter((name) => /\.(yml|yaml)$/.test(name));
const violations = [];
const pullRequestWorkflows = [];

for (const name of files) {
  const file = path.join(dir, name);
  const text = fs.readFileSync(file, 'utf8');
  if (!/\bpull_request\s*:?(?:\s|$)/m.test(text)) continue;
  pullRequestWorkflows.push(name);

  // A PR workflow may use checkout's merge ref, so provenance must be explicitly
  // checked against the event PR head SHA and the remote branch head SHA.
  const hasEventHead = /github\.event\.pull_request\.head\.sha/.test(text);
  const hasLocalShaCheck = /git rev-parse HEAD.*GITHUB_SHA|git rev-parse HEAD.*EXPECTED_HEAD|test\s+["']?\$\(git rev-parse HEAD\)["']?\s*=\s*["']?\$EXPECTED_HEAD/.test(text);
  const hasRemoteHeadCheck = /git ls-remote origin[^\n]*refs\/heads\/\$\{?\$\{?GITHUB_HEAD_REF|refs\/heads\/\$\{HEAD_REF\}/.test(text);
  const hasExpectedHeadComparison = /ACTUAL_HEAD[^\n]*EXPECTED_HEAD|actual_head[^\n]*expected_head/.test(text);

  if (!hasEventHead || !hasLocalShaCheck || !hasRemoteHeadCheck || !hasExpectedHeadComparison) {
    violations.push({
      workflow: name,
      hasEventHead,
      hasLocalShaCheck,
      hasRemoteHeadCheck,
      hasExpectedHeadComparison,
    });
  }
}

console.log(JSON.stringify({
  status: violations.length ? 'FAIL' : 'PASS',
  pull_request_workflows: pullRequestWorkflows,
  violations,
}, null, 2));

if (violations.length) {
  console.error(`PR WORKFLOW EXACT-HEAD PROVENANCE FAILED: ${violations.length} workflow(s) lack the required exact-head proof.`);
  process.exitCode = 1;
}
