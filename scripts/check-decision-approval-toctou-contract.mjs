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
  const next = source.indexOf('\nCREATE OR REPLACE FUNCTION', start + 1);
  return source.slice(start, next < 0 ? source.length : next);
}

export function validateDecisionApprovalToctou(source) {
  const body = latestFunctionBody(source, 'request_decision_approval');
  const decisionSelect = body.indexOf('from public.business_intelligence_decisions');
  const decisionGate = body.indexOf("v_decision_status is distinct from 'PROPOSED'");
  // Bind the lock specifically to the authoritative decision SELECT. Searching
  // for any later FOR UPDATE would let the approval-row lock mask a missing
  // decision lock in the adversarial fixture.
  const decisionQuery = body.slice(decisionSelect, decisionGate < 0 ? body.length : decisionGate);
  const decisionLockMatch = decisionQuery.match(/and d\.company_id = v_company\s+for update/i);
  const decisionLock = decisionLockMatch ? decisionSelect + decisionQuery.indexOf(decisionLockMatch[0]) : -1;
  const approvalSelect = body.indexOf('from public.decision_approvals');
  const terminalGuard = body.indexOf("v_existing_status in ('APPROVED','REJECTED','CANCELLED')");
  if (decisionSelect < 0 || decisionLock < decisionSelect) throw new Error('Decision row is not locked before approvability check');
  if (decisionGate < decisionLock) throw new Error('Approvaibility check is not performed after decision lock');
  if (approvalSelect < decisionLock) throw new Error('Approval row lookup precedes decision lock');
  if (terminalGuard < approvalSelect) throw new Error('Terminal approval guard missing or reordered');
  if (!body.includes('where public.decision_approvals.status not in')) throw new Error('Conflict-path terminal guard missing');
  return true;
}

validateDecisionApprovalToctou(sql);

// Test-of-test: adversarial mutations must target the latest canonical function body.
function replaceLatestFunctionBody(source, name, mutate) {
  const marker = `CREATE OR REPLACE FUNCTION public.${name}`;
  const start = source.lastIndexOf(marker);
  if (start < 0) throw new Error(`Missing canonical function: ${name}`);
  const openParen = source.indexOf('(', start + marker.length);
  if (openParen < 0) throw new Error(`Missing canonical function signature: ${name}`);
  const next = source.indexOf('\nCREATE OR REPLACE FUNCTION', openParen + 1);
  const end = next < 0 ? source.length : next;
  const body = source.slice(start, end);
  return source.slice(0, start) + mutate(body) + source.slice(end);
}
const canonicalBody = latestFunctionBody(sql, 'request_decision_approval');
const canonicalDecisionSelect = canonicalBody.indexOf('from public.business_intelligence_decisions');
const canonicalDecisionLockMatch = canonicalBody
  .slice(canonicalDecisionSelect)
  .match(/and d\.company_id = v_company\s+for update/i);
if (!canonicalDecisionLockMatch) throw new Error('Missing canonical decision lock fixture target');
const noDecisionLock = replaceLatestFunctionBody(sql, 'request_decision_approval', body => {
  const weakened = body.replace(canonicalDecisionLockMatch[0], canonicalDecisionLockMatch[0].replace(/\s+for update$/i, ''));
  if (weakened === body) throw new Error('Adversarial decision-lock mutation did not apply');
  return weakened;
});
assert.throws(() => validateDecisionApprovalToctou(noDecisionLock), /Decision row is not locked/);
const canonicalGate = canonicalBody.indexOf("v_decision_status is distinct from 'PROPOSED'");
const gateBeforeLock = replaceLatestFunctionBody(sql, 'request_decision_approval', body => {
  const decisionLock = body.indexOf('for update', canonicalDecisionSelect);
  if (decisionLock < 0 || canonicalGate < 0) throw new Error('Missing canonical gate/lock fixture targets');
  const withoutLock = body.slice(0, decisionLock) + body.slice(decisionLock + 'for update'.length);
  const gateInWeak = withoutLock.indexOf("v_decision_status is distinct from 'PROPOSED'");
  return withoutLock.slice(0, gateInWeak) + 'for update\\n    ' + withoutLock.slice(gateInWeak);
});
assert.throws(() => validateDecisionApprovalToctou(gateBeforeLock), /Approvaibility check is not performed after decision lock/);
console.log('Decision approval TOCTOU contract: PASS (decision lock-before-check + terminal guard + adversarial weakened-lock/gate test-of-test)');