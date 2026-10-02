import assert from 'node:assert/strict';
import { buildReportAdvisorBrief } from '../src/lib/report-intelligence/report-advisor-engine.ts';

const rows = [];
for (let i = 0; i < 40; i += 1) {
  const date = new Date(Date.UTC(2026, 5, 2 + i));
  const customer = i % 2 === 0 ? 'عميل أ' : 'عميل ب';
  const amount = i >= 27 && customer === 'عميل أ' ? 100 : i < 13 && customer === 'عميل أ' ? 400 : 250;
  rows.push({ row_number: i + 1, data: { date: date.toISOString().slice(0, 10), customer_name: customer, total: amount } });
}
const result = buildReportAdvisorBrief({
  jobId: 'job-real-shape',
  sourceHash: 'sha256:test',
  evidenceSnapshotId: 'evidence-test',
  specialty: 'sales',
  rowCount: rows.length,
  sourceAnalysis: { datasets: [{ columns: [
    { name: 'date', mappedField: 'date' },
    { name: 'customer_name', mappedField: 'customer_name' },
    { name: 'total', mappedField: 'total' },
  ] }] },
  canonicalRows: rows,
});
assert.equal(result.archetypeId, 'sales.transaction-detail');
assert.equal(result.profileVersion, 'sales.transaction-detail@v1');
assert.equal(result.proofState, 'VERIFIED');
assert.equal(result.questions.find((q) => q.id === 'WHAT')?.status, 'ANSWERED');
assert.equal(result.questions.find((q) => q.id === 'WHO_CONTRIBUTED')?.status, 'ANSWERED');
assert.equal(result.questions.find((q) => q.id === 'WHY')?.status, 'REVIEW_REQUIRED');
assert.ok(result.recommendedAction);
console.log('REPORT_ADVISOR_ENGINE_SMOKE_PASS');
console.log(JSON.stringify({ health: result.health, findings: result.topFindings.length, risk: result.topRisk?.title, opportunity: result.topOpportunity?.title }, null, 2));
