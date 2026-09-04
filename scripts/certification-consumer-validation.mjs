import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const REQUIRED_CERTIFICATION_EVIDENCE_KEYS = Object.freeze(['tenant', 'backup', 'rollback', 'artifact', 'security']);
const GIT_SHA = /^[a-f0-9]{40}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const ISO = /^\d{4}-\d{2}-\d{2}T/;

const reject = (reason) => { throw new Error(`CERTIFICATION_CONSUMER_REJECTED:${reason}`); };
const requiredString = (v, name) => {
  if (typeof v !== 'string' || v.trim() === '') reject(`INVALID_${name}`);
};
const exact = (v, expected, name) => {
  requiredString(v, name);
  if (v !== expected) reject(`MISMATCH_${name}`);
};
const requireGitSha = (v, name) => {
  requiredString(v, name);
  if (!GIT_SHA.test(v)) reject(`INVALID_${name}`);
};
const requireSha256 = (v, name) => {
  requiredString(v, name);
  if (!SHA256.test(v)) reject(`INVALID_${name}`);
};

export function validateMandatoryEvidence({ evidenceContracts, expectedSourceSha, manifestId, certificationRunId, artifactFingerprint, evidenceRoot = process.cwd(), now = Date.now(), maxAgeMs = 24 * 60 * 60 * 1000 }) {
  requireGitSha(expectedSourceSha, 'SOURCE_SHA');
  requiredString(manifestId, 'MANIFEST_ID');
  requiredString(certificationRunId, 'CERTIFICATION_RUN_ID');
  requireSha256(artifactFingerprint, 'ARTIFACT_FINGERPRINT');
  if (!evidenceContracts || typeof evidenceContracts !== 'object' || Array.isArray(evidenceContracts)) reject('MISSING_EVIDENCE_CONTRACTS');

  const actual = Object.keys(evidenceContracts).sort();
  const required = [...REQUIRED_CERTIFICATION_EVIDENCE_KEYS].sort();
  if (JSON.stringify(actual) !== JSON.stringify(required)) reject('MANDATORY_EVIDENCE_KEY_SET_MISMATCH');

  for (const key of REQUIRED_CERTIFICATION_EVIDENCE_KEYS) {
    const evidence = evidenceContracts[key];
    if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) reject(`MISSING_OR_MALFORMED_EVIDENCE:${key}`);
    if (evidence.status !== 'validated') reject(`EVIDENCE_NOT_VALIDATED:${key}`);
    exact(evidence.source_sha, expectedSourceSha, `${key}_SOURCE_SHA`);
    exact(evidence.manifest_id, manifestId, `${key}_MANIFEST_ID`);
    exact(evidence.certification_run_id, certificationRunId, `${key}_CERTIFICATION_RUN_ID`);
    exact(evidence.artifact_fingerprint, artifactFingerprint, `${key}_ARTIFACT_FINGERPRINT`);
    requiredString(evidence.evidence_ref, `${key}_EVIDENCE_REF`);
    requireSha256(evidence.evidence_fingerprint, `${key}_EVIDENCE_FINGERPRINT`);
    requiredString(evidence.proof_type, `${key}_PROOF_TYPE`);
    requiredString(evidence.verified_at, `${key}_VERIFIED_AT`);
    if (!ISO.test(evidence.verified_at)) reject(`INVALID_VERIFIED_AT:${key}`);
    const verifiedAt = Date.parse(evidence.verified_at);
    if (!Number.isFinite(verifiedAt) || verifiedAt > now || now - verifiedAt > maxAgeMs) reject(`STALE_OR_INVALID_EVIDENCE:${key}`);

    const resolved = path.resolve(evidenceRoot, evidence.evidence_ref);
    const root = path.resolve(evidenceRoot);
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) reject(`EVIDENCE_REF_OUTSIDE_ROOT:${key}`);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) reject(`MISSING_EVIDENCE_ARTIFACT:${key}`);
    const fingerprint = crypto.createHash('sha256').update(fs.readFileSync(resolved)).digest('hex');
    if (fingerprint !== evidence.evidence_fingerprint) reject(`EVIDENCE_FINGERPRINT_MISMATCH:${key}`);
  }
  return true;
}
