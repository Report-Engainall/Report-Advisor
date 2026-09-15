import assert from 'node:assert/strict';
import { scenarios } from './production-scenario-matrix.mjs';
import { scenarioAssertionPlan, snapshotBusinessState, assertZeroUnintendedMutation, validateCompactArtifact } from './production-scenario-contract.mjs';

assert.equal(scenarios.length, 12, 'SCENARIO_MATRIX_MUST_BE_12');
for (const scenario of scenarios) {
  assert.ok(scenarioAssertionPlan(scenario.id).length >= 4, `PLAN_TOO_SMALL:${scenario.id}`);
}

const stableInvoices = [{ id: 'inv-1', invoice_number: 'I-1', company_id: 'tenant-a', currency: 'SAR', total: 15 }];
const stableMovements = [{ id: 'mov-1', product_id: 'p1', movement_type: 'sale', company_id: 'tenant-a', quantity: 1 }];
const stableEvidence = [{ id: 'ev-1', metric_key: 'sales', company_id: 'tenant-a', as_of: '2026-09-15' }];
const before = snapshotBusinessState({
  importJobs: [{ id: 'job-1', status: 'completed', source_hash: 'h1' }],
  invoices: stableInvoices,
  movements: stableMovements,
  evidence: stableEvidence,
});
const after = snapshotBusinessState({
  importJobs: [{ id: 'job-1', status: 'completed', source_hash: 'h1' }],
  invoices: stableInvoices,
  movements: stableMovements,
  evidence: stableEvidence,
});
assertZeroUnintendedMutation(before, after);

validateCompactArtifact({
  exact_head: '950e0882c5557211a621be09a82a53f578af9713',
  scenario_count: 12,
  results: scenarios.map(s => ({
    scenario_id: s.id,
    exact_head: '950e0882c5557211a621be09a82a53f578af9713',
    tenant: 'tenant-a',
    execution_start: '2026-09-15T00:00:00Z',
    execution_end: '2026-09-15T00:00:01Z',
    assertions: [],
  })),
}, '950e0882c5557211a621be09a82a53f578af9713');

console.log('Production scenario contract assertions PASS: 12 plans + zero-mutation + exact-head artifact binding.');
