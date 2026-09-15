import fs from 'node:fs';

const EXPECTED_IDS = new Set([
  'excel-standard','excel-aliases','excel-missing-columns','csv-reordered','pdf-text','pdf-ocr-ar',
  'unknown-report','exchange-statement','multi-currency','duplicate-transactions','large-file','corrupt-data',
]);
const TERMINAL = new Set(['committed_and_rendered','reviewed','rejected_or_reviewed']);

export function evaluateRelease(raw) {
  const results = Array.isArray(raw?.results) ? raw.results : Object.values(raw ?? {});
  const failures = [];
  const expectedHead = raw?.exact_head;
  const expectedTenant = raw?.tenant;
  const generatedAt = Date.parse(raw?.generated_at ?? '');

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) failures.push({ id: '__artifact__', reason: 'invalid-root' });
  if (raw?.authenticated_runtime !== true) failures.push({ id: '__artifact__', reason: 'authenticated-runtime-not-proven' });
  if (!Number.isFinite(generatedAt)) failures.push({ id: '__artifact__', reason: 'missing-generated-at' });
  if (raw?.scenario_count !== EXPECTED_IDS.size) failures.push({ id: '__artifact__', reason: `scenario-count-field:${raw?.scenario_count ?? 'missing'}` });
  if (results.length !== EXPECTED_IDS.size) failures.push({ id: '__artifact__', reason: `scenario-count:${results.length}/${EXPECTED_IDS.size}` });
  if (typeof expectedHead !== 'string' || !/^[0-9a-f]{40}$/i.test(expectedHead)) failures.push({ id: '__artifact__', reason: 'missing-or-invalid-exact-head' });
  if (typeof expectedTenant !== 'string' || !/^[0-9a-f-]{36}$/i.test(expectedTenant)) failures.push({ id: '__artifact__', reason: 'missing-or-invalid-tenant' });
  if (typeof raw?.artifact_hash !== 'string' || !/^[0-9a-f]{64}$/i.test(raw.artifact_hash)) failures.push({ id: '__artifact__', reason: 'missing-or-invalid-artifact-hash' });

  const seen = new Set();
  for (const result of results) {
    const id = result?.scenario_id;
    if (!EXPECTED_IDS.has(id)) { failures.push({ id: id ?? 'unknown', reason: 'unknown-scenario' }); continue; }
    if (seen.has(id)) failures.push({ id, reason: 'duplicate-scenario-result' });
    seen.add(id);
    if (result?.actual_status === 'failed' || !TERMINAL.has(result?.actual_status)) failures.push({ id, reason: `non-terminal:${result?.actual_status ?? 'missing'}` });
    if (result?.exact_head !== expectedHead) failures.push({ id, reason: 'exact-head-mismatch' });
    if (result?.tenant !== expectedTenant) failures.push({ id, reason: 'tenant-mismatch' });
    if (!result?.execution_start || !result?.execution_end) failures.push({ id, reason: 'missing-runtime-window' });
    else {
      const start = Date.parse(result.execution_start); const end = Date.parse(result.execution_end);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) failures.push({ id, reason: 'invalid-runtime-window' });
      if (Number.isFinite(generatedAt) && Number.isFinite(end) && end > generatedAt + 60000) failures.push({ id, reason: 'runtime-after-artifact-generation' });
    }
    if (!result?.before_state || !result?.after_state) failures.push({ id, reason: 'missing-db-before-after' });
    if (!Array.isArray(result?.evidence_references) || result.evidence_references.length === 0) failures.push({ id, reason: 'missing-evidence-references' });
    if (!result?.input_fingerprint || !/^[0-9a-f]{64}$/i.test(result.input_fingerprint)) failures.push({ id, reason: 'missing-input-fingerprint' });
  }
  for (const id of EXPECTED_IDS) if (!seen.has(id)) failures.push({ id, reason: 'missing-result' });
  return { release: failures.length === 0 ? 'approved' : 'blocked', failures, scenarioCount: EXPECTED_IDS.size, observedScenarioCount: results.length, exactHead: expectedHead ?? null, tenant: expectedTenant ?? null, artifactHash: raw?.artifact_hash ?? null };
}

if (process.argv[1]?.endsWith('production-release-decision.mjs')) {
  const inputPath = process.argv[2] ?? 'release-evidence/production-regression-results.json';
  if (!fs.existsSync(inputPath)) { console.error(`BLOCKED: production regression evidence missing: ${inputPath}`); process.exit(2); }
  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const decision = evaluateRelease(raw);
  fs.mkdirSync('release-evidence', { recursive: true });
  fs.writeFileSync('release-evidence/certification-decision.json', JSON.stringify(decision, null, 2) + '\n');
  console.log(JSON.stringify(decision, null, 2));
  if (decision.release !== 'approved') process.exit(1);
}
