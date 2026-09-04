import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const dir = path.join(process.cwd(), 'supabase', 'migrations');
const sql = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort().map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');

function latestBody(name) {
  const re = new RegExp(`CREATE\\s+OR\\s+REPLACE\\s+FUNCTION\\s+public\\.${name}\\s*\\(`, 'gi');
  let m, start = -1;
  while ((m = re.exec(sql))) start = m.index;
  if (start < 0) throw new Error(`missing ${name}`);
  const next = sql.indexOf('\nCREATE OR REPLACE FUNCTION', start + 1);
  return sql.slice(start, next < 0 ? sql.length : next);
}

function positions(body, needle) { return body.indexOf(needle); }

const request = latestBody('request_decision_approval');
const decide = latestBody('decide_approval');
const reqDecision = positions(request, 'from public.business_intelligence_decisions');
const reqDecisionLock = positions(request, 'for update');
const reqGate = positions(request, "v_decision_status is distinct from 'PROPOSED'");
const reqApproval = positions(request, 'from public.decision_approvals');
if (!(reqDecision >= 0 && reqDecisionLock > reqDecision && reqGate > reqDecisionLock && reqApproval > reqDecisionLock)) throw new Error('request_decision_approval does not lock decision before approval lookup/check');

const decResolve = positions(decide, 'from public.decision_approvals');
const decDecision = positions(decide, 'from public.business_intelligence_decisions');
const decDecisionLock = positions(decide, 'for update', decDecision);
const decGate = positions(decide, "v_decision_status is distinct from 'PROPOSED'");
const decApproval = positions(decide, 'from public.decision_approvals', decDecision + 1);
if (!(decResolve >= 0 && decDecision > decResolve && decDecisionLock > decDecision && decGate > decDecisionLock && decApproval > decDecisionLock)) throw new Error('decide_approval does not follow decision -> approval lock order');

// Test-of-test: remove either lock or invert the order; the contract must fail closed.
const weakenedRequest = request.replace(/for update/i, '');
assert.throws(() => { const a=positions(weakenedRequest,'from public.business_intelligence_decisions'); const b=positions(weakenedRequest,'for update'); if (!(a>=0&&b>a)) throw new Error('request lock missing'); }, /request lock missing/);
const weakenedDecide = decide.replace(/from public\.business_intelligence_decisions([\s\S]*?)for update/i, 'from public.business_intelligence_decisions$1');
assert.throws(() => { const a=positions(weakenedDecide,'from public.business_intelligence_decisions'); const b=positions(weakenedDecide,'for update',a); if (!(a>=0&&b>a)) throw new Error('decide lock missing'); }, /decide lock missing/);

console.log('Decision approval lock order: PASS (both RPCs use decision -> approval order; weakened-lock test-of-test fails closed).');
