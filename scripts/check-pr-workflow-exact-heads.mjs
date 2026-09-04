import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), '.github/workflows');
const isPullRequestWorkflow = text => /\bpull_request\s*:?(?:\s|$)/m.test(text);
const isCertificationSensitive = (name, text) => {
  const marker = `${name}\n${text}`;
  return /certification|production-evidence|release-certification|final-certification|rollback|backup|security|tenant[-_]?adversarial/i.test(marker);
};

export function analyzeWorkflowProvenance(name, text) {
  if (!isPullRequestWorkflow(text)) return { workflow: name, pull_request: false, certification_sensitive: false, violations: [] };
  const certificationSensitive = isCertificationSensitive(name, text);
  if (!certificationSensitive) return { workflow: name, pull_request: true, certification_sensitive: false, violations: [] };

  const hasEventHead = /github\.event\.pull_request\.head\.sha/.test(text);
  const hasLocalShaCheck = /git\s+rev-parse\s+HEAD[\s\S]{0,400}?(?:GITHUB_SHA|EXPECTED_HEAD|expected_head)/.test(text);
  const hasRemoteHeadCheck = /git\s+ls-remote\s+origin[\s\S]{0,400}?refs\/heads\/\$\{(?:HEAD_REF|GITHUB_HEAD_REF)\}/.test(text);
  const hasExpectedHeadComparison = /(?:ACTUAL_HEAD|actual_head)[\s\S]{0,300}?(?:EXPECTED_HEAD|expected_head)/.test(text);

  const violations = [];
  if (!hasEventHead) violations.push('MISSING_EVENT_PR_HEAD_SHA');
  if (!hasLocalShaCheck) violations.push('MISSING_LOCAL_EXACT_HEAD_CHECK');
  if (!hasRemoteHeadCheck) violations.push('MISSING_REMOTE_HEAD_CHECK');
  if (!hasExpectedHeadComparison) violations.push('MISSING_HEAD_COMPARISON');
  return { workflow: name, pull_request: true, certification_sensitive: true, hasEventHead, hasLocalShaCheck, hasRemoteHeadCheck, hasExpectedHeadComparison, violations };
}

const results = fs.readdirSync(dir)
  .filter(name => /\.(yml|yaml)$/.test(name))
  .map(name => ({ name, text: fs.readFileSync(path.join(dir, name), 'utf8') }))
  .map(({ name, text }) => analyzeWorkflowProvenance(name, text));

const violations = results.filter(result => result.violations?.length);
console.log(JSON.stringify({
  status: violations.length ? 'FAIL' : 'PASS',
  certification_sensitive_pr_workflows: results.filter(result => result.certification_sensitive).map(result => result.workflow),
  ordinary_pr_workflows_excluded: results.filter(result => result.pull_request && !result.certification_sensitive).map(result => result.workflow),
  violations,
}, null, 2));

if (violations.length) {
  console.error(`PR CERTIFICATION WORKFLOW EXACT-HEAD PROVENANCE FAILED: ${violations.length} certification-sensitive PR workflow(s) lack exact-head proof.`);
  process.exitCode = 1;
}
