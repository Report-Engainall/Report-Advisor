import assert from 'node:assert/strict';
import fs from 'node:fs';

const bridge = fs.readFileSync('src/lib/report-decisions.ts', 'utf8');
const surface = fs.readFileSync('src/components/SourceBoundReportSurface.tsx', 'utf8');

assert.ok(bridge.includes("start_decision_work_item"));
assert.ok(bridge.includes("complete_decision_work_item"));
assert.ok(bridge.includes("evidence_snapshot_id"));
assert.ok(surface.includes("decision.workItemStatus === 'OPEN'"));
assert.ok(surface.includes("decision.workItemStatus === 'IN_PROGRESS'"));
assert.ok(surface.includes("إغلاق التنفيذ"));
assert.ok(surface.includes("report.sourceAnalysis.id"));
console.log('SOURCE_WORK_EXECUTION_LIFECYCLE_CONTRACT_PASS');
