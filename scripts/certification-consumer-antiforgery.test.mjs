import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { REQUIRED_CERTIFICATION_EVIDENCE_KEYS, validateMandatoryEvidence } from './certification-consumer-validation.mjs';

const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const sourceSha = 'a'.repeat(40);
const manifestId = 'manifest-test-001';
const runId = 'run-test-001';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cert-consumer-'));
const artifactPath = path.join(root, 'release-dist.tar');
fs.writeFileSync(artifactPath, 'release-artifact-real-bytes');
const artifactFingerprint = sha(fs.readFileSync(artifactPath));

function fixture() {
  const contracts = {};
  for (const key of REQUIRED_CERTIFICATION_EVIDENCE_KEYS) {
    const file = path.join(root, `${key}.proof`);
    fs.writeFileSync(file, `${key}-real-proof`);
    contracts[key] = {
      status: 'validated',
      source_sha: sourceSha,
      manifest_id: manifestId,
      certification_run_id: runId,
      artifact_fingerprint: artifactFingerprint,
      evidence_ref: path.relative(root, file),
      evidence_fingerprint: sha(`${key}-real-proof`),
      proof_type: 'runtime-verification',
      verified_at: new Date().toISOString(),
    };
  }
  return contracts;
}

const valid = fixture();
const validate = contracts => validateMandatoryEvidence({
  evidenceContracts: contracts,
  expectedSourceSha: sourceSha,
  manifestId,
  certificationRunId: runId,
  artifactFingerprint,
  artifactPath,
  evidenceRoot: root,
});

validate(valid);

const attacks = {
  WRONG_SHA: () => ({...valid, tenant: {...valid.tenant, source_sha: 'b'.repeat(40)}}),
  STALE_SHA: () => ({...valid, tenant: {...valid.tenant, source_sha: 'c'.repeat(40)}}),
  WRONG_MANIFEST: () => ({...valid, tenant: {...valid.tenant, manifest_id: 'forged-manifest'}}),
  STALE_MANIFEST: () => ({...valid, tenant: {...valid.tenant, manifest_id: 'old-manifest'}}),
  WRONG_RUN: () => ({...valid, tenant: {...valid.tenant, certification_run_id: 'forged-run'}}),
  STALE_RUN: () => ({...valid, tenant: {...valid.tenant, certification_run_id: 'old-run'}}),
  WRONG_ARTIFACT_FINGERPRINT: () => ({...valid, tenant: {...valid.tenant, artifact_fingerprint: sha('other-artifact')}}),
  WRONG_EVIDENCE_FINGERPRINT: () => ({...valid, tenant: {...valid.tenant, evidence_fingerprint: sha('other-proof')}}),
  DUPLICATE_CONTRACT: () => ({...valid, tenant_duplicate: valid.tenant}),
  UNKNOWN_CONTRACT: () => ({...valid, forged: valid.tenant}),
  MISSING_MANDATORY_CONTRACT: () => { const x = {...valid}; delete x.rollback; return x; },
  UNVALIDATED_CONTRACT: () => ({...valid, backup: {...valid.backup, status: 'missing'}}),
  FORGED_IDENTITY_PAYLOAD: () => ({...valid, security: {...valid.security, proof_type: 'identity=true'}}),
};

for (const [name, mutate] of Object.entries(attacks)) {
  assert.throws(() => validate(mutate()), /CERTIFICATION_CONSUMER_REJECTED/, name);
}

const wrongArtifactPath = path.join(root, 'wrong-artifact.tar');
fs.writeFileSync(wrongArtifactPath, 'different-real-artifact');
assert.throws(() => validateMandatoryEvidence({
  evidenceContracts: valid,
  expectedSourceSha: sourceSha,
  manifestId,
  certificationRunId: runId,
  artifactFingerprint,
  artifactPath: wrongArtifactPath,
  evidenceRoot: root,
}), /ARTIFACT_FINGERPRINT_MISMATCH/);

fs.writeFileSync(artifactPath, 'tampered-artifact');
assert.throws(() => validate(valid), /ARTIFACT_FINGERPRINT_MISMATCH/);

fs.writeFileSync(artifactPath, 'release-artifact-real-bytes');
fs.unlinkSync(artifactPath);
assert.throws(() => validate(valid), /MISSING_ARTIFACT_BYTES/);

for (const key of REQUIRED_CERTIFICATION_EVIDENCE_KEYS) {
  const file = path.join(root, `${key}.proof`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, `${key}-real-proof`);
}

console.log(`Certification consumer anti-forgery test: PASS (${Object.keys(attacks).length + 3} adversarial attacks rejected, including byte-level artifact substitution/tamper/missing cases)`);
