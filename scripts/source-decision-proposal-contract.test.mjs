import assert from 'node:assert/strict';
import fs from 'node:fs';

const bridge = fs.readFileSync('src/lib/report-decisions.ts', 'utf8');
const panel = fs.readFileSync('src/components/ReportIntelligencePanel.tsx', 'utf8');
const advisorySurface = fs.readFileSync('src/components/SmartReportAdvisorySurface.tsx', 'utf8');

assert.ok(bridge.includes("createRuntimeRecommendation"));
assert.ok(bridge.includes("createRuntimeDecision"));
assert.ok(bridge.includes("linkRecommendationToDecision"));
assert.ok(bridge.includes("recommendationId"));
assert.ok(bridge.includes("proposal.recommendation_id == null ? null : String(proposal.recommendation_id)"));
assert.ok(bridge.includes("recommendationContext"));
assert.ok(panel.includes("action: recommendation.action"));
assert.ok(bridge.includes("recommendationContext: input.recommendationContext"));
assert.ok(bridge.includes("reportExecutionJobId"));
assert.ok(bridge.includes("sourceHash"));
assert.ok(bridge.includes("PROPOSED_ONLY"));
const proposalStart = bridge.indexOf("export async function createSourceDecisionProposal");
const proposalEndMatch = /\r?\n\r?\nexport type SourceDecisionState/.exec(bridge.slice(proposalStart));
const proposalEnd = proposalEndMatch
  ? proposalStart + proposalEndMatch.index
  : -1;
assert.ok(proposalStart >= 0 && proposalEnd > proposalStart);
const proposalBody = bridge.slice(proposalStart, proposalEnd);
assert.ok(!proposalBody.includes("create_decision_work_item"));
assert.ok(!proposalBody.includes("from('recommendations')"));
assert.ok(!proposalBody.includes("\.update({"));
assert.ok(panel.includes("createSourceDecisionProposal"));
assert.ok(panel.includes("حفظ القرار والقضية"));
assert.ok(panel.includes("saveSignalAsCase"));
assert.ok(panel.includes("evidenceSnapshotId"));
assert.ok(panel.includes("reportJobId="));
const sourceProposalReadStart = bridge.indexOf('export async function fetchSourceDecisionProposals(');
const sourceProposalReadEnd = bridge.indexOf('\nexport ', sourceProposalReadStart + 1);
assert.ok(sourceProposalReadStart >= 0 && sourceProposalReadEnd > sourceProposalReadStart, 'source decision readback function must remain explicit');
const sourceProposalRead = bridge.slice(sourceProposalReadStart, sourceProposalReadEnd);
assert.ok(sourceProposalRead.includes('signal?: AbortSignal'), 'source proposal readback must accept an abort signal');
assert.ok((sourceProposalRead.match(/abortSignal\(readSignal\)/g) ?? []).length >= 5, 'all proposal/recommendation/work/outcome/approval reads must inherit cancellation');
assert.ok(advisorySurface.includes('const controller = new AbortController();'), 'Smart Report proposal effect must own its request lifecycle');
assert.ok(advisorySurface.includes('refreshDecisionProposal(controller.signal)'), 'Smart Report proposal read must receive its lifecycle signal');
assert.ok(advisorySurface.includes('return () => controller.abort();'), 'Smart Report proposal effect must cancel the stale request on unmount');
assert.ok(advisorySurface.includes('if (signal?.aborted) return;'), 'expected effect cleanup must not surface a stale-request error');

console.log('SOURCE_DECISION_PROPOSAL_CONTRACT_PASS');
