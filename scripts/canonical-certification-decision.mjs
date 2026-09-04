import { REQUIRED_CERTIFICATION_EVIDENCE_KEYS } from './certification-consumer-validation.mjs';

const reject = (reason) => { throw new Error(`CANONICAL_CERTIFICATION_REJECTED:${reason}`); };

export function evaluateCanonicalCertificationDecision({ decision, expectedSourceSha, expectedManifestId, expectedCertificationRunId }) {
  if (!decision || typeof decision !== 'object' || Array.isArray(decision)) reject('MISSING_DECISION');
  if (decision.certification_result !== 'passed') reject('RESULT_NOT_PASSED');
  if (decision.blocker_state !== 'clear' || decision.blocker_count !== 0) reject('UNRESOLVED_BLOCKERS');
  if (decision.consumed_source_sha !== expectedSourceSha) reject('SOURCE_SHA_MISMATCH');
  if (decision.consumed_release_manifest_id !== expectedManifestId) reject('MANIFEST_ID_MISMATCH');
  if (decision.certification_run_id !== expectedCertificationRunId) reject('RUN_ID_MISMATCH');
  if (!decision.required_contracts || typeof decision.required_contracts !== 'object' || Array.isArray(decision.required_contracts)) reject('REQUIRED_CONTRACTS_NOT_OBJECT');
  const actualKeys = Object.keys(decision.required_contracts).sort();
  const expectedKeys = [...REQUIRED_CERTIFICATION_EVIDENCE_KEYS].sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) reject('MANDATORY_CONTRACT_SET_MISMATCH');
  for (const key of REQUIRED_CERTIFICATION_EVIDENCE_KEYS) {
    if (decision.required_contracts[key] !== 'validated') reject(`CONTRACT_NOT_VALIDATED:${key}`);
  }
  if (decision.identity?.source_sha_matches_manifest !== true) reject('SOURCE_IDENTITY_NOT_PROVEN');
  if (decision.identity?.manifest_id_matches_payload !== true) reject('MANIFEST_IDENTITY_NOT_PROVEN');
  if (decision.identity?.certification_run_id_matches_manifest !== true) reject('RUN_IDENTITY_NOT_PROVEN');
  return true;
}
