import fs from 'node:fs';

const page = fs.readFileSync('src/pages/DecisionExperiencePage.tsx', 'utf8');
const runtime = fs.readFileSync('src/lib/decision-automation/vertical-slice-runtime.ts', 'utf8');
const outcomes = fs.readFileSync('src/lib/analytics/outcome-feedback.ts', 'utf8');

for (const token of [
  'منظومة القرار التنفيذية',
  'مركز القيادة',
  'Evidence Workspace',
  'Decision Workspace',
  'Approval Center',
  'Personal Workbench',
  'Outcome & Learning',
  'fetchRecommendations',
  'fetchAlerts',
  'updateRecommendationStatus',
  'loadPersistedOutcomes',
  'decisionFingerprint',
  'Expected → Actual → Delta',
  'expectedValue',
  'actualValue',
  'evidenceSnapshotId',
  'RUNTIME_REQUIRED',
  'Authenticated runtime + tenant authority',
]) {
  if (!page.includes(token)) throw new Error(`DECISION_EXPERIENCE_CONTRACT_MISSING:${token}`);
}

for (const token of [
  'createRuntimeDecision',
  'linkRecommendationToDecision',
  'requestRuntimeApproval',
  'decideRuntimeApproval',
  'createRuntimeWorkItem',
  "supabase.rpc('create_decision_work_item'",
]) {
  if (!runtime.includes(token)) throw new Error(`DECISION_RUNTIME_CONTRACT_MISSING:${token}`);
}

for (const token of [
  'persistOutcome',
  'loadPersistedOutcomes',
  'recommendation_outcomes',
  'OUTCOME_TENANT_CONTEXT_MISMATCH',
]) {
  if (!outcomes.includes(token)) throw new Error(`DECISION_OUTCOME_CONTRACT_MISSING:${token}`);
}

if (/Math\.random|fake|mock|synthetic/i.test(page)) {
  throw new Error('DECISION_EXPERIENCE_SYNTHETIC_DATA_FORBIDDEN');
}
if (/decision_work_items['"]\)\.insert/.test(runtime)) {
  throw new Error('DECISION_WORK_ITEM_DIRECT_INSERT_FORBIDDEN');
}
if (!page.includes('لا يتم إنشاء approver أو timestamp أو approval محليًا')) {
  throw new Error('LOCAL_APPROVAL_STATE_FORBIDDEN');
}

console.log('Decision experience product contract: PASS (repository/UI contract only; not live runtime evidence).');
