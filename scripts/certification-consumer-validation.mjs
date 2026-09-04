import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const REQUIRED_CERTIFICATION_EVIDENCE_KEYS = Object.freeze([
  'tenant',
  'backup',
  'rollback',
  'artifact',
  'security',
]);

const SHA256 = /^[a-f0-9]{64}$/;

function fail(message) {
  throw new Error(`CERTIFICATION_CONSUMER_REJECTED:${message}`);
}

function requireString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') fail(`INVALID_${field}`);
}

function requireExact(value, expected, field) {
  requireString(value, field);
  if (value !== expected) fail(`MISMATCH_${field}`);
}

function requireSha256(value, field) {
  requireString(value, field);
  if (!SHA256.test(value)) fail(`INVALID_${field}`);
}

export function validateMandatoryEvidence({
  evidenceContracts,
  expectedSourceSha,
  manifestId,
  certificationRunId,
  artifactFingerprint,
  now = Date.now(),
  maxAgeMs = 24 * 60 * 60 * 1000,
  evidenceRoot = process.cwd(),
}) {
  requireExact(expectedSourceSha, expectedSourceSha, 'EXPECTED_SOURCE_SHA');
  requireString(manifestId, 'MANIFEST_ID');
  requireString(certificationRunId, 'CERTIFICATION_RUN_ID');
  requireSha256(artifactFingerprint, 'ARTIFACT_FINGERPRINT');

  if (!evidenceContracts || typeof evidenceContracts !== 'object' || Array.isArray(evidenceContracts)) {
    fail('MISSING_EVIDENCE_CONTRACTS');
  }

  const actualKeys = Object.keys(evidenceContracts).sort();
  const requiredKeys = [...REQUIRED_CERTIFICATION_EVIDENCE_KEYS].sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(requiredKeys)) {
    fail('MANDATORY_EVIDENCE_KEY_SET_MISMATCH');
  }

  const validated = {};
  for (const key of REQUIRED_CERTIFICATION_EVIDENCE_KEYS) {
    const evidence = evidenceContracts[key];
    if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
      fail(`MISSING_OR_MALFORMED_EVIDENCE:${key}`);
    }
    if (evidence.status !== 'validated') fail(`EVIDENCE_NOT_VALIDATED:${key}`);
    requireExact(evidence.source_sha, expectedSourceSha, `${key}_SOURCE_SHA`);
    requireExact(evidence.manifest_id, manifestId, `${key}_MANIFEST_ID`);
    requireExact(evidence.certification_run_id, certificationRunId, `${key}_CERTIFICATION_RUN_ID`);
    requireExact(evidence.artifact_fingerprint, artifactFingerprint, `${key}_ARTIFACT_FINGERPRINT`);
    requireString(evidence.evidence_ref, `${key}_EVIDENCE_REF`);
    requireSha256(evidence.evidence_fingerprint, `${key}_EVIDENCE_FINGERPRINT`);
    requireString(evidence.proof_type, `${key}_PROOF_TYPE`);
    requireString(evidence.verified_at, `${key}_VERIFIED_AT`);

    const verifiedAt = Date.parse(evidence.verified_at);
    if (!Number.isFinite(verifiedAt) || verifiedAt > now || now - verifiedAt > maxAgeMs) {
      fail(`STALE_OR_INVALID_EVIDENCE:${key}`);
    }

    const resolved = path.resolve(evidenceRoot, evidence.evidence_ref);
    const rootResolved = path.resolve(evidenceRoot);
    if (resolved !== rootResolved && !resolved.startsWith(`${rootResolved}${path.sep}`)) {
      fail(`EVIDENCE_REF_OUTSIDE_ROOT:${key}`);
    }
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      fail(`MISSING_EVIDENCE_ARTIFACT:${key}`);
    }
    const actualFingerprint = crypto.createHash('sha256').update(fs.readFileSync(resolved)).digest('hex');
    if (actualFingerprint !== evidence.evidence_fingerprint) {
      fail(`EVIDENCE_FINGERPRINT_MISMATCH:${key}`);
    }

    validated[key] = {
      status: evidence.status,
      evidence_ref: evidence.evidence_ref,
      evidence_fingerprint: evidence.evidence_fingerprint,
      proof_type: evidence.proof_type,
      verified_at: evidence.verified_at,
    };
  }

  return validated;
}
