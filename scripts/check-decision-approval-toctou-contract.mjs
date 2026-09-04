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
  const decisionLock = body.indexOf('for update', decisionSelect);
  const decisionGate = body.indexOf("v_decision_status is distinct from 'PROPOSED'");
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

// Test-of-test: remove the decision lock, then move the decision status gate ahead
// of the lock. Both weakened variants must fail closed.
const noDecisionLock = sql.replace(/from public\.business_intelligence_decisions([\s\S]*?)for update/i, 'from public.business_intelligence_decisions$1');
assert.throws(() => validateDecisionApprovalToctou(noDecisionLock), /Decision row is not locked/);
const gateBeforeLock = sql.replace(/for update\n\s*if \(v_decision_status is distinct from 'PROPOSED'\)/i, "if (v_decision_status is distinct from 'PROPOSED')\n    for update");
assert.throws(() => validateDecisionApprovalToctou(gateBeforeLock), /Approvaibility check is not performed after decision lock/);

console.log('Decision approval TOCTOU contract: PASS (decision lock-before-check + terminal guard + adversarial weakened-lock/gate test-of-test)');
