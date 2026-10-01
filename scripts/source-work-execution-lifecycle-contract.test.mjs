import assert from 'node:assert/strict';
import fs from 'node:fs';

const bridge = fs.readFileSync('src/lib/report-decisions.ts', 'utf8');
const surface = fs.readFileSync('src/components/SourceBoundReportSurface.tsx', 'utf8');
const workCenter = fs.readFileSync('src/pages/WorkCenterPage.tsx', 'utf8');
const auditMigration = fs.readFileSync('supabase/migrations/20261002030000_audit_recommendation_outcomes.sql', 'utf8');

assert.ok(bridge.includes("start_decision_work_item"));
assert.ok(bridge.includes("complete_decision_work_item"));
assert.ok(bridge.includes("evidence_snapshot_id"));
assert.ok(surface.includes("fetchSourceDecisionAuditTrace"));
assert.ok(surface.includes("ACTIVITY / AUDIT"));
assert.ok(surface.includes("سجل ما حدث للقرار"));
assert.ok(surface.includes("decision.workItemStatus === 'OPEN'"));
assert.ok(surface.includes("decision.workItemStatus === 'IN_PROGRESS'"));
assert.ok(surface.includes("إغلاق التنفيذ"));
assert.ok(surface.includes("report.sourceAnalysis.id"));
assert.ok(surface.includes("outcomeStatus"));
assert.ok(surface.includes("outcomeQuality"));
assert.ok(bridge.includes("recommendation_outcomes"));
assert.ok(workCenter.includes("loadPersistedOutcomes"));
assert.ok(workCenter.includes("OUTCOME → LEARNING"));
assert.ok(workCenter.includes("NOT AVAILABLE"));
for (const marker of ['trg_recommendation_outcome_audit','audit_decision_runtime_change','AFTER INSERT OR UPDATE OR DELETE']) {
  assert.ok(auditMigration.includes(marker), 'outcome audit contract missing: ' + marker);
}
console.log('SOURCE_WORK_EXECUTION_LIFECYCLE_CONTRACT_PASS');
