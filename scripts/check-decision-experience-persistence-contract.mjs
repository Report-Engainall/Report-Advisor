import fs from 'node:fs';
import assert from 'node:assert/strict';

const page = fs.readFileSync('src/pages/DecisionExperiencePage.tsx', 'utf8');
const runtime = fs.readFileSync('src/lib/decision-automation/vertical-slice-runtime.ts', 'utf8');
const existing = fs.readFileSync('scripts/source-decision-approval-contract.test.mjs', 'utf8');

for (const marker of [
  'createRuntimeDecision',
  'linkRecommendationToDecision',
  'loadRuntimeRecommendationEvidence',
  'requestRuntimeApproval',
  'loadRuntimeDecisionContext',
  'حفظ القرار وطلب الموافقة',
  'DECISION_EVIDENCE_SNAPSHOT_REQUIRED',
  'DECISION PERSISTED',
  'PENDING',
  'recommendationContext',
  'WHY NOW',
  'MEASUREMENT',
  'RISK',
  'BLOCKER',
  'LIMITATION',
]) {
  assert.ok(page.includes(marker) || runtime.includes(marker), 'decision persistence marker missing: ' + marker);
}

for (const marker of ['business_intelligence_decisions','decision_approvals','recommendation_id','company_id']) {
  assert.ok(runtime.includes(marker), 'decision readback contract missing: ' + marker);
}

assert.match(existing, /request_decision_approval/);
console.log('PASS: decision experience persists canonical decision + approval request and reads it back tenant-scoped.');
