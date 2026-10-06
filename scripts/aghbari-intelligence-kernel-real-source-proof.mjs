import fs from 'node:fs';
import assert from 'node:assert/strict';

const sourcePath = process.env.KERNEL_REAL_SOURCE_JSON;
if (!sourcePath) throw new Error('KERNEL_REAL_SOURCE_JSON_REQUIRED');

const { runAghbariIntelligenceKernel } = await import('../src/lib/report-intelligence/aghbari-intelligence-kernel.ts');
const { runReportArchetype } = await import('../src/lib/report-intelligence/archetype-registry.ts');
const rows = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

assert.equal(rows.length, 332, 'REAL_SOURCE_ROW_COUNT_MISMATCH');

const result = runAghbariIntelligenceKernel({
  rows,
  specialty: 'inventory',
  qualityScore: 98,
  canonicalRowsComplete: true,
  evidenceReady: true,
  provenance: {
    tenantId: '99e33354-cc45-4317-8eb3-0d486b6c5932',
    reportExecutionJobId: '16709d80-e012-40ef-9c12-6fd8255897f8',
    sourceHash: 'sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313',
    evidenceSnapshotId: '01e41830-fa44-41a3-9790-cb5cd8202d6a',
    evidencePassportId: '35f86b87-918e-4353-b0a8-6d8d003b04db',
  },
});

const stock = rows.reduce((sum, row) => sum + Number(row.data.currentStock ?? 0), 0);
const demand = rows.reduce((sum, row) => sum + Number(row.data.salesQty ?? 0), 0);
assert.equal(stock, 23075, 'REAL_SOURCE_STOCK_TOTAL_MISMATCH');
assert.equal(demand, 324250, 'REAL_SOURCE_DEMAND_TOTAL_MISMATCH');

const negative = result.anomalies.find((item) => item.kind === 'NEGATIVE_STOCK');
assert.ok(negative, 'NEGATIVE_STOCK_ANOMALY_MISSING');
assert.ok(result.scenarios.length === 1, 'REAL_INVENTORY_SCENARIO_MISSING');
assert.ok(result.sensitivity.length >= 2, 'REAL_SENSITIVITY_MISSING');
assert.ok(result.trace.some((item) => item.stage === 'TRUTH' && item.status === 'PASS'), 'TRUTH_TRACE_MISSING');
assert.ok(result.trace.some((item) => item.stage === 'PROVE' && item.status === 'PASS'), 'PROVE_TRACE_MISSING');

const scenario = result.scenarios[0];
const expectedCoverage = stock / demand;
const expectedScenarioCoverage = stock / (demand * 1.15);
assert.ok(Math.abs(Number(scenario.baseline.coverage) - expectedCoverage) < 1e-9, 'SCENARIO_BASELINE_MISMATCH');
assert.ok(Math.abs(Number(scenario.result.coverage) - expectedScenarioCoverage) < 1e-9, 'SCENARIO_RESULT_MISMATCH');

const integrated = runReportArchetype({
  archetypeId: 'inventory.balances',
  profileVersion: 1,
  provenance: result.provenance,
  availableFields: ['productCode', 'currentStock', 'salesQty'],
  sampleSize: rows.length,
  scope: { period: null, filters: {} },
  report: {
    specialty: 'inventory',
    rowCount: rows.length,
    sourceAnalysis: { datasets: [], qualityScore: 98 },
    renderedOutput: {},
    canonicalRows: rows,
  },
});
assert.ok(integrated.intelligence.kernel, 'KERNEL_NOT_WIRED_INTO_ARCHETYPE');
assert.ok(integrated.intelligence.signals.some((signal) => signal.id === 'kernel:anomaly:NEGATIVE_STOCK'), 'KERNEL_ANOMALY_NOT_RENDERED_AS_SIGNAL');
assert.ok(integrated.intelligence.signals.some((signal) => signal.id.startsWith('kernel:scenario:')), 'KERNEL_SCENARIO_NOT_RENDERED_AS_SIGNAL');
assert.ok(integrated.intelligence.kernel.trace.some((entry) => entry.stage === 'PROVE' && entry.status === 'PASS'), 'INTEGRATED_PROVE_TRACE_MISSING');

console.log(JSON.stringify({
  status: 'REAL_SOURCE_PROVEN',
  rows: rows.length,
  stock,
  demand,
  baselineCoverage: scenario.baseline.coverage,
  demandPlus15Coverage: scenario.result.coverage,
  anomalyCount: result.anomalies.length,
  scenarioCount: result.scenarios.length,
  sensitivityCount: result.sensitivity.length,
  kernelStatus: result.status,
  blindSpot: result.blindSpot,
}));
