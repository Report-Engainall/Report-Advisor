import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'release-evidence-boundary-'));
const manifestPath = path.join(temp, 'manifest.json');
const certificationPath = path.join(temp, 'certification-decision.json');
const sourceSha = '9c4bd0ca4808f441f58c8cbdc1470edfad6cb773';
const payload = {
  schema_version: 1,
  release_key: 'refs/tags/v-test',
  source_sha: sourceSha,
  migrations_fingerprint: 'm'.repeat(64),
  dependency_lock_fingerprint: 'd'.repeat(64),
  artifact_fingerprint: 'a'.repeat(64),
  environment: 'staging',
  stabilization_seconds: 60,
  evidence_contracts: {
    release_evidence: 'validated',
    production_certification: 'validated',
    production_release_blockers: 'validated',
    trust: 'validated',
    canary: 'contract-validated',
    rollback: 'contract-validated',
    fail_closed: 'validated',
  },
};
const manifestId = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
fs.writeFileSync(manifestPath, JSON.stringify({...payload, manifest_id: manifestId}, null, 2));

const certification = {
  schema_version: 1,
  certification_decision_id: crypto.randomUUID(),
  consumed_release_manifest_id: manifestId,
  consumed_source_sha: sourceSha,
  certification_result: 'passed',
  blocker_count: 0,
  blocker_state: 'clear',
  identity: {source_sha_matches_manifest: true, manifest_id_matches_payload: true, ref: payload.release_key, environment: payload.environment},
  required_contracts: payload.evidence_contracts,
};
fs.writeFileSync(certificationPath, JSON.stringify(certification, null, 2));

const baseEnv = {
  ...process.env,
  EXPECTED_SOURCE_SHA: sourceSha,
  RELEASE_CERTIFICATION_RUN_ID: '123456789',
  RELEASE_EVIDENCE_ARTIFACT_NAME: `report-advisor-release-evidence-${sourceSha}`,
  RELEASE_EVIDENCE_MANIFEST_PATH: manifestPath,
  RELEASE_CERTIFICATION_DECISION_PATH: certificationPath,
  GITHUB_RUN_ID: '987654321',
  GITHUB_WORKFLOW: 'production-evidence-boundary',
};

const run = () => spawnSync('node', ['scripts/check-live-production-evidence-boundary.mjs'], {
  cwd: root,
  env: baseEnv,
  encoding: 'utf8',
});

const pass = run();
if (pass.status !== 0) throw new Error(`Valid linkage rejected: ${pass.stderr || pass.stdout}`);
const proofPath = path.join(temp, 'consumption-proof.json');
const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
if (proof.consumed_release_manifest_id !== manifestId || proof.consumed_source_sha !== sourceSha || proof.proof_result !== 'passed') {
  throw new Error('Valid linkage did not produce an exact SHA-bound consumption proof');
}

const invalid = {...certification, consumed_source_sha: '0'.repeat(40)};
fs.writeFileSync(certificationPath, JSON.stringify(invalid, null, 2));
const fail = run();
if (fail.status === 0 || !/source SHA mismatch|source SHA does not match/i.test(`${fail.stderr}\n${fail.stdout}`)) {
  throw new Error('Wrong-source-SHA linkage was not rejected fail-closed');
}

fs.rmSync(temp, {recursive: true, force: true});
console.log('Semantic production evidence boundary tests: PASS');
