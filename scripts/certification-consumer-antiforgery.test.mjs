import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { REQUIRED_CERTIFICATION_EVIDENCE_KEYS, validateMandatoryEvidence } from './certification-consumer-validation.mjs';

const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const sourceSha = 'a'.repeat(40);
const manifestId = 'manifest-test-001';
const runId = 'run-test-001';
const artifactFingerprint = sha('dist-artifact');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cert-consumer-'));

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
validateMandatoryEvidence({ evidenceContracts: valid, expectedSourceSha: sourceSha, manifestId, certificationRunId: runId, artifactFingerprint, evidenceRoot: root });

const attacks = {
  REMOVE_REQUIRED_EVIDENCE: () => { const x = {...valid}; delete x.tenant; return x; },
  REPLACE_WITH_EMPTY: () => ({...valid, tenant: {}}),
  REPLACE_WITH_NULL: () => ({...valid, tenant: null}),
  REPLACE_WITH_WRONG_TYPE: () => ({...valid, tenant: 'validated'}),
  STALE_EVIDENCE: () => ({...valid, tenant: {...valid.tenant, verified_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()}}),
  WRONG_SHA: () => ({...valid, tenant: {...valid.tenant, source_sha: 'b'.repeat(40)}}),
  WRONG_MANIFEST: () => ({...valid, tenant: {...valid.tenant, manifest_id: 'forged-manifest'}}),
  WRONG_RUN: () => ({...valid, tenant: {...valid.tenant, certification_run_id: 'forged-run'}}),
  WRONG_ARTIFACT_FINGERPRINT: () => ({...valid, tenant: {...valid.tenant, artifact_fingerprint: sha('other')}}),
  WRONG_EVIDENCE_FINGERPRINT: () => ({...valid, tenant: {...valid.tenant, evidence_fingerprint: sha('other-proof')}}),
  UNKNOWN_CONTRACT: () => ({...valid, unknown: valid.tenant}),
  DUPLICATE_CONTRACT: () => ({...valid, tenant_duplicate: valid.tenant}),
};

for (const [name, mutate] of Object.entries(attacks)) {
  assert.throws(() => validateMandatoryEvidence({ evidenceContracts: mutate(), expectedSourceSha: sourceSha, manifestId, certificationRunId: runId, artifactFingerprint, evidenceRoot: root }), /CERTIFICATION_CONSUMER_REJECTED/, name);
}

const tamperedFile = path.join(root, valid.security.evidence_ref);
fs.writeFileSync(tamperedFile, 'tampered');
assert.throws(() => validateMandatoryEvidence({ evidenceContracts: valid, expectedSourceSha: sourceSha, manifestId, certificationRunId: runId, artifactFingerprint, evidenceRoot: root }), /EVIDENCE_FINGERPRINT_MISMATCH/);

console.log(`Certification consumer anti-forgery test: PASS (${Object.keys(attacks).length + 1} adversarial mutations rejected)`);
