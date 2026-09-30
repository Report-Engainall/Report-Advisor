import assert from 'node:assert/strict';
import fs from 'node:fs';

const bridge = fs.readFileSync('src/lib/report-decisions.ts', 'utf8');
const panel = fs.readFileSync('src/components/ReportIntelligencePanel.tsx', 'utf8');

assert.ok(bridge.includes("create_runtime_decision"));
assert.ok(bridge.includes("reportExecutionJobId"));
assert.ok(bridge.includes("sourceHash"));
assert.ok(bridge.includes("PROPOSED_ONLY"));
assert.ok(!bridge.includes("create_decision_work_item"));
assert.ok(panel.includes("createSourceDecisionProposal"));
assert.ok(panel.includes("حفظ كقرار مقترح"));
assert.ok(panel.includes("reportJobId="));
console.log('SOURCE_DECISION_PROPOSAL_CONTRACT_PASS');
