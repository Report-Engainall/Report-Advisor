import assert from 'node:assert/strict';
import fs from 'node:fs';

const bridge = fs.readFileSync('src/lib/report-decisions.ts', 'utf8');
const surface = fs.readFileSync('src/components/SourceBoundReportSurface.tsx', 'utf8');

assert.ok(bridge.includes("request_decision_approval"));
assert.ok(bridge.includes("fetchSourceDecisionProposals"));
assert.ok(surface.includes("طلب الموافقة"));
assert.ok(surface.includes("PROPOSED"));
assert.ok(surface.includes("report.sourceHash"));
assert.ok(!surface.includes("create_decision_work_item"));
console.log('SOURCE_DECISION_APPROVAL_CONTRACT_PASS');
