import assert from 'node:assert/strict';
import { evaluateDecisionRoi } from '../src/lib/decision-roi.ts';
import { compareSchemas } from '../src/lib/schema-drift.ts';
import { assessBenchmark } from '../src/lib/benchmark-network.ts';
import { buildMoneyRecoverySignals } from '../src/lib/money-recovery.ts';
import { buildDecisionCoverage } from '../src/lib/decision-coverage.ts';

const waiting = evaluateDecisionRoi({ expected: 100, actual: null });
assert.equal(waiting.state, 'AWAITING_OUTCOME');
assert.equal(waiting.delta, null);

const positive = evaluateDecisionRoi({ expected: 100, actual: 125 });
assert.equal(positive.state, 'POSITIVE');
assert.equal(positive.delta, 25);

const drift = compareSchemas(
  [{ name: 'sku', type: 'text', required: true }, { name: 'qty', type: 'number', required: true }],
  [{ name: 'sku', type: 'text', required: true }, { name: 'qty', type: 'integer', required: true }, { name: 'price', type: 'number' }],
);
assert.equal(drift.severity, 'blocking');
assert.equal(drift.autoMapSafe, false);

const benchmark = assessBenchmark(82, { industry: 'distribution', minPeers: 20, peerCount: 4, referenceValue: null, referenceType: 'PEER_MEDIAN' });
assert.equal(benchmark.availability, 'INSUFFICIENT_SAMPLE');

const signals = buildMoneyRecoverySignals({
  status: 'CONFIRMED',
  totalReceivables: 1000,
  overdueReceivables: 300,
  inventoryValue: 800,
  grossMargin: 12,
  totalSales: 2000,
});
assert.equal(signals.length, 3);
assert.equal(signals[0]?.kind, 'COLLECTIONS');

const coverage = buildDecisionCoverage({
  status: 'CALCULATED',
  totalSales: 1,
  totalCost: null,
  grossProfit: null,
  grossMargin: null,
  totalReceivables: 1,
  overdueReceivables: 1,
  totalPayables: null,
  inventoryValue: 1,
  totalCustomers: 1,
  activeCustomers: 1,
  totalProducts: 1,
  invoiceCount: null,
  avgInvoiceValue: null,
  collectionRate: null,
});
assert.equal(coverage.covered, 5);
assert.equal(coverage.total, 7);
assert.equal(coverage.state, 'PARTIAL');

console.log('Commercial moat contract: PASS');
