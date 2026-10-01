import assert from 'node:assert/strict';
import fs from 'node:fs';

const bridge = fs.readFileSync('src/lib/report-decisions.ts', 'utf8');
const panel = fs.readFileSync('src/components/ReportIntelligencePanel.tsx', 'utf8');

assert.ok(bridge.includes("createRuntimeRecommendation"));
assert.ok(bridge.includes("createRuntimeDecision"));
assert.ok(bridge.includes("linkRecommendationToDecision"));
assert.ok(bridge.includes("recommendationId"));
assert.ok(bridge.includes("reportExecutionJobId"));
assert.ok(bridge.includes("sourceHash"));
assert.ok(bridge.includes("PROPOSED_ONLY"));
const proposalStart = bridge.indexOf("export async function createSourceDecisionProposal");
const proposalEnd = bridge.indexOf("\n\nexport type SourceDecisionState", proposalStart);
assert.ok(proposalStart >= 0 && proposalEnd > proposalStart);
const proposalBody = bridge.slice(proposalStart, proposalEnd);
assert.ok(!proposalBody.includes("create_decision_work_item"));
assert.ok(panel.includes("createSourceDecisionProposal"));
assert.ok(panel.includes("حفظ كتوصية ثم قرار"));
assert.ok(panel.includes("evidenceSnapshotId"));
assert.ok(panel.includes("reportJobId="));
console.log('SOURCE_DECISION_PROPOSAL_CONTRACT_PASS');
