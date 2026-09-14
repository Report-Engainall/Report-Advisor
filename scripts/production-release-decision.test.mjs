import { strict as assert } from 'node:assert';
import { scenarios } from './production-scenario-matrix.mjs';
import { evaluateRelease } from './production-release-decision.mjs';

const exactHead = 'a'.repeat(40);
const tenant = 'f68a7e91-3c7e-46fb-97a8-e339bec04e13';
const duplicateFingerprint = `${String(scenarios.findIndex(s => s.id === 'duplicate-transactions') + 1).padStart(2, '0')}${'a'.repeat(62)}`;
const artifact = {
  exact_head: exactHead,
  authenticated_runtime: true,
  tenant,
  scenario_count: scenarios.length,
  runtime_results: scenarios.map((scenario, index) => ({
    scenario_id: scenario.id,
    exact_head: exactHead,
    authenticated_context: true,
    tenant,
    input_fingerprint: `${String(index + 1).padStart(2, '0')}${'a'.repeat(62)}`,
    execution_start: '2026-09-15T00:00:00.000Z',
    execution_end: '2026-09-15T00:01:00.000Z',
    actual_status: 'committed_and_rendered',
    expected_status: scenario.expect,
    actual_observed_result: { canCommit: true },
    evidence_references: [`report_execution_jobs:${'11111111-1111-4111-8111-111111111111'}`],
    job_id: '11111111-1111-4111-8111-111111111111',
    persistence_readback: { status: 'completed', checkpoint: { stage: 'rendered' } },
    failure: null,
  })),
  duplicate_followup: {
    scenario_id: 'duplicate-transactions:second-run',
    exact_head: exactHead,
    authenticated_context: true,
    tenant,
    input_fingerprint: duplicateFingerprint,
    actual_status: 'rejected_or_reviewed',
  },
};

assert.equal(evaluateRelease(artifact, exactHead).release, 'approved');
assert.equal(evaluateRelease({ ...artifact, exact_head: '4'.repeat(40) }, exactHead).release, 'blocked');
assert.equal(evaluateRelease({ ...artifact, runtime_results: artifact.runtime_results.slice(0, 11) }, exactHead).release, 'blocked');
assert.equal(evaluateRelease({ ...artifact, runtime_results: artifact.runtime_results.map((r, i) => i === 0 ? { ...r, actual_status: 'ready-for-runtime' } : r) }, exactHead).release, 'blocked');
assert.equal(evaluateRelease({ ...artifact, runtime_results: artifact.runtime_results.map((r, i) => i === 0 ? { ...r, evidence_references: [] } : r) }, exactHead).release, 'blocked');
assert.equal(evaluateRelease({ ...artifact, duplicate_followup: null }, exactHead).release, 'blocked');
console.log('Production release decision tests PASS: runtime artifact is fail-closed.');
