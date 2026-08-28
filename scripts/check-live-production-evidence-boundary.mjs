import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const manifestPath = process.env.RELEASE_EVIDENCE_MANIFEST_PATH || 'release-evidence/manifest.json';
const certificationPath = process.env.RELEASE_CERTIFICATION_DECISION_PATH || 'release-evidence/certification-decision.json';
const expectedSourceSha = process.env.EXPECTED_SOURCE_SHA || process.env.GITHUB_SHA || '';
const certificationRunId = process.env.RELEASE_CERTIFICATION_RUN_ID || '';
const artifactName = process.env.RELEASE_EVIDENCE_ARTIFACT_NAME || '';

const requiredSourceContracts = [
  'scripts/check-release-evidence-completeness.mjs',
  'scripts/check-production-certification-contract.mjs',
  'scripts/check-production-release-blockers.mjs',
];
for (const file of requiredSourceContracts) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing production evidence contract component: ${file}`);
}

if (!expectedSourceSha) throw new Error('Missing expected source SHA for release evidence boundary');
if (!certificationRunId) throw new Error('Missing release certification workflow run identity');
if (!artifactName) throw new Error('Missing release evidence artifact identity');
if (artifactName !== `report-advisor-release-evidence-${expectedSourceSha}`) {
  throw new Error('Release evidence artifact is not bound to expected source SHA');
}
if (!fs.existsSync(path.join(root, manifestPath))) throw new Error(`Missing release evidence manifest: ${manifestPath}`);
if (!fs.existsSync(path.join(root, certificationPath))) throw new Error(`Missing certification decision: ${certificationPath}`);

const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8'));
const certification = JSON.parse(fs.readFileSync(path.join(root, certificationPath), 'utf8'));

for (const field of ['manifest_id', 'release_key', 'source_sha', 'migrations_fingerprint', 'dependency_lock_fingerprint', 'artifact_fingerprint', 'evidence_contracts']) {
  if (!manifest[field]) throw new Error(`Release evidence manifest missing: ${field}`);
}
if (manifest.source_sha !== expectedSourceSha) throw new Error('Release evidence source SHA mismatch');
if (!/^([a-f0-9]{64})$/.test(manifest.manifest_id)) throw new Error('Release evidence manifest identity is not a SHA-256 digest');

const payload = {
  schema_version: manifest.schema_version,
  release_key: manifest.release_key,
  source_sha: manifest.source_sha,
  migrations_fingerprint: manifest.migrations_fingerprint,
  dependency_lock_fingerprint: manifest.dependency_lock_fingerprint,
  artifact_fingerprint: manifest.artifact_fingerprint,
  environment: manifest.environment,
  stabilization_seconds: manifest.stabilization_seconds,
  evidence_contracts: manifest.evidence_contracts,
};
const recomputedManifestId = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
if (recomputedManifestId !== manifest.manifest_id) throw new Error('Release evidence manifest identity digest mismatch');

for (const token of ['release_evidence', 'production_certification', 'production_release_blockers', 'trust', 'canary', 'rollback', 'fail_closed']) {
  if (!manifest.evidence_contracts[token]) throw new Error(`Release evidence contract missing: ${token}`);
}
if (manifest.evidence_contracts.release_evidence !== 'validated') throw new Error('Release evidence contract is not validated');
if (manifest.evidence_contracts.production_certification !== 'validated') throw new Error('Production certification contract is not validated');
if (manifest.evidence_contracts.production_release_blockers !== 'validated') throw new Error('Production release blocker contract is not validated');
if (manifest.evidence_contracts.trust !== 'validated') throw new Error('Trust contract is not validated');
if (manifest.evidence_contracts.fail_closed !== 'validated') throw new Error('Fail-closed contract is not validated');
if (manifest.evidence_contracts.canary !== 'contract-validated') throw new Error('Canary evidence contract is not validated');
if (manifest.evidence_contracts.rollback !== 'contract-validated') throw new Error('Rollback evidence contract is not validated');

for (const field of ['certification_decision_id', 'consumed_release_manifest_id', 'consumed_source_sha', 'certification_result', 'blocker_count', 'blocker_state', 'identity', 'required_contracts']) {
  if (certification[field] === undefined || certification[field] === null) throw new Error(`Certification decision missing: ${field}`);
}
if (certification.consumed_release_manifest_id !== manifest.manifest_id) throw new Error('Certification consumed manifest mismatch');
if (certification.consumed_source_sha !== manifest.source_sha) throw new Error('Certification consumed source SHA mismatch');
if (certification.consumed_source_sha !== expectedSourceSha) throw new Error('Certification source SHA does not match boundary SHA');
if (certification.certification_result !== 'passed') throw new Error('Production certification decision is not passed');
if (certification.blocker_count !== 0) throw new Error('Production certification has blockers');
if (certification.blocker_state !== 'clear') throw new Error('Production certification blocker state is not clear');
if (certification.identity.source_sha_matches_manifest !== true) throw new Error('Certification identity proof is invalid');
if (certification.identity.manifest_id_matches_payload !== true) throw new Error('Certification manifest identity proof is invalid');

const evidence = fs.readFileSync(path.join(root, 'scripts/check-release-evidence-completeness.mjs'), 'utf8').toLowerCase();
const certificationContract = fs.readFileSync(path.join(root, 'scripts/check-production-certification-contract.mjs'), 'utf8').toLowerCase();
const blockers = fs.readFileSync(path.join(root, 'scripts/check-production-release-blockers.mjs'), 'utf8').toLowerCase();
for (const token of ['source_sha', 'migrations_fingerprint', 'dependency_fingerprint', 'artifact_fingerprint']) {
  if (!evidence.includes(token)) throw new Error(`Release evidence identity missing: ${token}`);
}
for (const token of ['tenant', 'backup', 'rollback', 'artifact', 'security']) {
  if (!certificationContract.includes(token)) throw new Error(`Certification evidence missing: ${token}`);
}
for (const token of ['blocker', 'production', 'fail']) {
  if (!blockers.includes(token)) throw new Error(`Production blocker contract missing: ${token}`);
}

const proof = {
  schema_version: 1,
  certification_decision_id: certification.certification_decision_id,
  consumed_release_manifest_id: manifest.manifest_id,
  consumed_source_sha: expectedSourceSha,
  certification_result: certification.certification_result,
  blocker_state: certification.blocker_state,
  release_certification_run_id: certificationRunId,
  release_evidence_artifact_name: artifactName,
  boundary_workflow: process.env.GITHUB_WORKFLOW || 'production-evidence-boundary',
  boundary_run_id: process.env.GITHUB_RUN_ID || null,
  proof_result: 'passed',
  generated_at: new Date().toISOString(),
};
fs.mkdirSync(path.dirname(path.join(root, 'release-evidence/consumption-proof.json')), { recursive: true });
fs.writeFileSync(path.join(root, 'release-evidence/consumption-proof.json'), JSON.stringify(proof, null, 2) + '\n');
console.log('Live production evidence boundary: PASS');
console.log(JSON.stringify({ manifest_id: manifest.manifest_id, source_sha: expectedSourceSha, certification_run_id: certificationRunId, artifact_name: artifactName }));
