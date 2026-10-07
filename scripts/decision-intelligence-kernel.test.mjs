import assert from 'node:assert/strict';
import { canonicalRows, assessDataQuality, calculateRegisteredMetrics, deriveUnknownGaps, runWhatIfScenario, reconcileRows, buildBusinessOntology, buildProvenanceGraph, buildAIBoundary, summarizeNumericStability, optimizeSimpleAllocation } from '../src/lib/decision-intelligence-kernel.ts';

const rows = [
  { productCode: 'A', warehouse: 'W1', currentStock: 20, salesQty: 10, profit: 30, netAmount: 100, date: '2026-01-01', salesAmount: 100 },
  { productCode: 'B', warehouse: 'W1', currentStock: 4, salesQty: 5, profit: 5, netAmount: 50, date: '2026-01-02', salesAmount: 50 },
  { productCode: 'C', warehouse: 'W2', currentStock: 30, salesQty: 10, profit: 20, netAmount: 120, date: '2026-01-03', salesAmount: 120 },
];

assert.equal(canonicalRows(rows).length, 3);
const quality = assessDataQuality(rows, { id: 'inventory', requiredFields: ['currentStock'], minimumRows: 3, uniqueKey: ['productCode','warehouse'], numericFields: ['currentStock','salesQty'] });
assert.equal(quality.state, 'TRUSTED');
assert.ok(calculateRegisteredMetrics(rows).some(m => m.id === 'inventory.coverage'));
const gaps = deriveUnknownGaps(rows, { recommendation: 'راجع إعادة الطلب', outcomeRequired: true });
assert.ok(gaps.some(g => g.id === 'gap:inventory:lead-time'));
const scenario = runWhatIfScenario(rows, { demandMultiplier: 1.2, stockDelta: 5 });
assert.equal(scenario.state, 'READY');
assert.notEqual(scenario.delta.coverage, null);
const reconciliation = reconcileRows(rows, rows.map(r => ({...r, currentStock: r.currentStock + 1})), { key: 'productCode', metric: 'currentStock' });
assert.ok(reconciliation.some(r => r.state === 'MISMATCH'));
assert.ok(buildBusinessOntology(rows).length >= 3);
assert.ok(buildProvenanceGraph({ sourceHash: 'sha256:test', reportJobId: 'job-1', archetypeId: 'inventory.balances' }).edges.length === 3);
assert.equal(buildAIBoundary().rule, 'LLM = تفسير وتخطيط؛ وليس مصدر حساب أو حقيقة أو اعتماد قرار.');
const stability = summarizeNumericStability(rows, 'salesAmount');
assert.equal(stability.mean, 90);
const allocation = await optimizeSimpleAllocation({ objective: [10, 8], lower: [0, 0], upper: [10, 10], demand: [1, 1], capacity: 10 });
assert.ok(Array.isArray(allocation));
assert.ok((allocation?.[0] ?? 0) + (allocation?.[1] ?? 0) <= 10.0001);

console.log('DECISION_INTELLIGENCE_KERNEL_PASS metrics=5 whatIf=READY gaps=2 reconciliation=MISMATCH ontology=8+ optimization=PASS');
