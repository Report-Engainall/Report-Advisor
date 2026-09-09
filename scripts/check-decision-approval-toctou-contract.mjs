import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase', 'migrations');
const migrations = fs.readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort()
  .map((file) => fs.readFileSync(path.join(migrationsDir, file), 'utf8'));
const sql = migrations.join('\n');

function latestFunctionBody(source, name) {
  const re = new RegExp(`CREATE\\s+OR\\s+REPLACE\\s+FUNCTION\\s+public\\.${name}\\s*\\(`, 'gi');
  let match;
  let start = -1;
  while ((match = re.exec(source))) start = match.index;
  if (start < 0) throw new Error(`Missing canonical function: ${name}`);
  const nextRe = /\nCREATE\s+OR\s+REPLACE\s+FUNCTION/gi;
  nextRe.lastIndex = start + 1;
  const nextMatch = nextRe.exec(source);
  return source.slice(start, nextMatch ? nextMatch.index : source.length);
}

export function validateDecisionApprovalToctou(source) {
  const body = latestFunctionBody(source, 'request_decision_approval');
  const decisionSelect = body.indexOf('from public.business_intelligence_decisions');
  const decisionLock = body.indexOf('for update', decisionSelect);
  const decisionGate = body.indexOf("v_decision_status is distinct from 'PROPOSED'");
  const approvalSelect = body.indexOf('from public.decision_approvals');
  const terminalGuard = body.indexOf("v_existing_status in ('APPROVED','REJECTED','CANCELLED')");
  if (decisionSelect < 0 || decisionLock < decisionSelect) throw new Error('Decision row is not locked before approvability check');
  if (decisionGate < decisionLock) throw new Error('Approvaibility check is not performed after decision lock');
  if (approvalSelect < decisionLock) throw new Error('Approval row lookup precedes decision lock');
  if (terminalGuard < approvalSelect) throw new Error('Terminal approval guard missing or reordered');
  return true;
}

validateDecisionApprovalToctou(sql);

// Test-of-test: adversarial mutations must target the latest canonical function body.
function replaceLatestFunctionBody(source, name, mutate) {
  const re = new RegExp(`CREATE\\s+OR\\s+REPLACE\\s+FUNCTION\\s+public\\.${name}\\s*\\(`, 'gi');
  let match;
  let start = -1;
  while ((match = re.exec(source))) start = match.index;
  if (start < 0) throw new Error(`Missing canonical function: ${name}`);
  const openParen = source.indexOf('(', start);
  if (openParen < 0) throw new Error(`Missing canonical function signature: ${name}`);
  const nextRe = /\nCREATE\s+OR\s+REPLACE\s+FUNCTION/gi;
  nextRe.lastIndex = openParen + 1;
  const nextMatch = nextRe.exec(source);
  const end = nextMatch ? nextMatch.index : source.length;
  const body = source.slice(start, end);
  return source.slice(0, start) + mutate(body) + source.slice(end);
}
const canonicalBody = latestFunctionBody(sql, 'request_decision_approval');
const canonicalDecisionSelect = canonicalBody.indexOf('from public.business_intelligence_decisions');
const canonicalDecisionLock = canonicalBody.indexOf('for update', canonicalDecisionSelect);
const noDecisionLock = replaceLatestFunctionBody(sql, 'request_decision_approval', body =>
  body.slice(0, canonicalDecisionLock) + body.slice(canonicalDecisionLock + 'for update'.length)
);
assert.throws(() => validateDecisionApprovalToctou(noDecisionLock), /Decision row is not locked/);
const gateBeforeLock = replaceLatestFunctionBody(sql, 'request_decision_approval', body => {
  const withoutLock = body.slice(0, canonicalDecisionLock) + body.slice(canonicalDecisionLock + 'for update'.length);
  const gateInWeak = withoutLock.indexOf("v_decision_status is distinct from 'PROPOSED'");
  return withoutLock.slice(0, gateInWeak) + 'for update\\n    ' + withoutLock.slice(gateInWeak);
});
assert.throws(() => validateDecisionApprovalToctou(gateBeforeLock), /Approvaibility check is not performed after decision lock/);
console.log('Decision approval TOCTOU contract: PASS (decision lock-before-check + terminal guard + adversarial weakened-lock/gate test-of-test)');
