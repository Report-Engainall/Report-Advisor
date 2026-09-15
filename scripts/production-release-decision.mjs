import fs from 'node:fs';
import { scenarios } from './production-scenario-matrix.mjs';
import { validateProductionRegressionArtifact } from './validate-production-regression-artifact.mjs';

export function evaluateRelease(artifact, expectedHead) {
  const validation = validateProductionRegressionArtifact(artifact, expectedHead);
  const failures = validation.failures.map(reason => ({ id: 'artifact', reason }));
  const results = Array.isArray(artifact?.runtime_results) ? artifact.runtime_results : [];
  const byId = new Map(results.map(result => [result?.scenario_id, result]));

  for (const scenario of scenarios) {
    const result = byId.get(scenario.id);
    if (!result) {
      failures.push({ id: scenario.id, reason: 'missing-result' });
      continue;
    }
    if (result.actual_status !== 'committed_and_rendered') {
      failures.push({ id: scenario.id, reason: `runtime-status:${result.actual_status}` });
      continue;
    }
    if (!Array.isArray(result.evidence_references) || result.evidence_references.length === 0) {
      failures.push({ id: scenario.id, reason: 'missing-evidence' });
    }
    if (result.persistence_readback?.status !== 'completed' || result.persistence_readback?.checkpoint?.stage !== 'rendered') {
      failures.push({ id: scenario.id, reason: 'durable-rendered-readback-missing' });
    }
  }

  const duplicate = artifact?.duplicate_followup;
  if (!duplicate) failures.push({ id: 'duplicate-transactions', reason: 'duplicate-followup-missing' });
  else if (duplicate.actual_status === 'committed_and_rendered') failures.push({ id: 'duplicate-transactions', reason: 'duplicate-write-would-be-accepted' });

  return {
    release: failures.length === 0 ? 'approved' : 'blocked',
    failures,
    scenarioCount: scenarios.length,
    observedScenarioCount: results.length,
    exactHead: artifact?.exact_head ?? null,
    artifactValidated: validation.ok,
  };
}

if (process.argv[1]?.endsWith('production-release-decision.mjs')) {
  const inputPath = process.argv[2] ?? 'release-evidence/production-regression-results.json';
  const expectedHead = process.env.EXACT_HEAD ?? '';
  if (!fs.existsSync(inputPath)) {
    console.error(`BLOCKED: production regression evidence missing: ${inputPath}`);
    process.exit(2);
  }
  let raw;
  try { raw = JSON.parse(fs.readFileSync(inputPath, 'utf8')); }
  catch (error) { console.error(`BLOCKED: invalid production regression JSON: ${error instanceof Error ? error.message : String(error)}`); process.exit(2); }
  const decision = evaluateRelease(raw, expectedHead);
  fs.mkdirSync('release-evidence', { recursive: true });
  fs.writeFileSync('release-evidence/certification-decision.json', JSON.stringify(decision, null, 2) + '\n');
  console.log(JSON.stringify(decision, null, 2));
  if (decision.release !== 'approved') process.exit(1);
}
