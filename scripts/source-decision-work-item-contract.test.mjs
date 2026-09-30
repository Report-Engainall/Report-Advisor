import assert from 'node:assert/strict';
import fs from 'node:fs';

const decisions = fs.readFileSync('src/lib/report-decisions.ts', 'utf8');
const surface = fs.readFileSync('src/components/SourceBoundReportSurface.tsx', 'utf8');

assert.ok(decisions.includes("create_decision_work_item"));
assert.ok(decisions.includes("getAuthenticatedUser"));
assert.ok(decisions.includes("p_decision_id: input.decisionId"));
assert.ok(decisions.includes("p_assignee_id: user.id"));
assert.ok(surface.includes("createApprovedDecisionWorkItemForCurrentUser"));
assert.ok(surface.includes("إنشاء عنصر عمل لي"));
assert.ok(surface.includes("decision.status === 'APPROVED'"));
console.log('SOURCE_DECISION_WORK_ITEM_CONTRACT_PASS');
