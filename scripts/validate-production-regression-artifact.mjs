import fs from 'node:fs';
import { scenarios } from './production-scenario-matrix.mjs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA = /^[0-9a-f]{40}$/i;
const FORBIDDEN_STATUS = new Set(['READY-FOR-RUNTIME', 'ready-for-runtime', 'PASS', 'pass', 'SUCCESS', 'success']);

export function validateProductionRegressionArtifact(artifact, expectedHead) {
  const failures = [];
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) failures.push('artifact-not-object');
  const head = typeof artifact?.exact_head === 'string' ? artifact.exact_head : '';
  if (!SHA.test(head)) failures.push('invalid-exact-head');
  if (!expectedHead || !SHA.test(expectedHead)) failures.push('expected-head-missing-or-invalid');
  if (expectedHead && head !== expectedHead) failures.push('exact-head-mismatch');
  if (artifact?.authenticated_runtime !== true) failures.push('authenticated-runtime-required');
  if (!UUID.test(String(artifact?.tenant ?? ''))) failures.push('tenant-required');
  if (artifact?.scenario_count !== scenarios.length) failures.push(`scenario-count:${artifact?.scenario_count}/${scenarios.length}`);
  const results = Array.isArray(artifact?.runtime_results) ? artifact.runtime_results : [];
  if (results.length !== scenarios.length) failures.push(`runtime-result-count:${results.length}/${scenarios.length}`);
  const expectedIds = scenarios.map(s => s.id);
  const ids = results.map(r => r?.scenario_id);
  if (new Set(ids).size !== ids.length) failures.push('duplicate-scenario-id');
  for (const id of expectedIds) if (!ids.includes(id)) failures.push(`missing-scenario:${id}`);
  for (const result of results) {
    if (!result || typeof result !== 'object') { failures.push('invalid-scenario-result'); continue; }
    if (result.exact_head !== head) failures.push(`scenario-head-mismatch:${result.scenario_id}`);
    if (result.authenticated_context !== true) failures.push(`scenario-auth-required:${result.scenario_id}`);
    if (!UUID.test(String(result.tenant ?? '')) || result.tenant !== artifact.tenant) failures.push(`scenario-tenant-mismatch:${result.scenario_id}`);
    if (!/^[0-9a-f]{64}$/i.test(String(result.input_fingerprint ?? ''))) failures.push(`fingerprint-missing:${result.scenario_id}`);
    if (!result.execution_start || !result.execution_end) failures.push(`execution-window-missing:${result.scenario_id}`);
    if (!result.actual_observed_result || typeof result.actual_observed_result !== 'object') failures.push(`observed-result-missing:${result.scenario_id}`);
    if (typeof result.actual_status !== 'string' || !result.actual_status || FORBIDDEN_STATUS.has(result.actual_status)) failures.push(`invalid-actual-status:${result.scenario_id}`);
    if (result.synthetic === true || result.synthetic_evidence === true) failures.push(`synthetic-evidence:${result.scenario_id}`);
    if (result.expected_status === 'ready-for-runtime' || result.status === 'ready-for-runtime') failures.push(`contract-status-not-runtime:${result.scenario_id}`);
    if (result.actual_status === 'committed_and_rendered') {
      if (!Array.isArray(result.evidence_references) || result.evidence_references.length === 0) failures.push(`evidence-required:${result.scenario_id}`);
      if (!result.job_id || !UUID.test(String(result.job_id))) failures.push(`job-required:${result.scenario_id}`);
      if (result.persistence_readback?.status !== 'completed' || result.persistence_readback?.checkpoint?.stage !== 'rendered') failures.push(`rendered-readback-required:${result.scenario_id}`);
    }
  }
  const duplicate = artifact.duplicate_followup;
  if (duplicate) {
    if (!duplicate.scenario_id || !String(duplicate.scenario_id).endsWith(':second-run')) failures.push('invalid-duplicate-followup');
    if (duplicate.input_fingerprint !== results.find(r => r.scenario_id === 'duplicate-transactions')?.input_fingerprint) failures.push('duplicate-fingerprint-mismatch');
  }
  return { ok: failures.length === 0, failures, exactHead: head, scenarioCount: results.length };
}

if (process.argv[1]?.endsWith('validate-production-regression-artifact.mjs')) {
  const inputPath = process.argv[2] ?? 'release-evidence/production-regression-results.json';
  const expectedHead = process.env.EXACT_HEAD ?? '';
  if (!fs.existsSync(inputPath)) { console.error(`BLOCKED: production regression evidence missing: ${inputPath}`); process.exit(2); }
  let artifact;
  try { artifact = JSON.parse(fs.readFileSync(inputPath, 'utf8')); } catch (error) { console.error(`BLOCKED: invalid production regression JSON: ${error instanceof Error ? error.message : String(error)}`); process.exit(2); }
  const validation = validateProductionRegressionArtifact(artifact, expectedHead);
  console.log(JSON.stringify(validation, null, 2));
  if (!validation.ok) process.exit(1);
}
