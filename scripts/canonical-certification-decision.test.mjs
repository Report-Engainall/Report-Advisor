import assert from 'node:assert/strict';
import { evaluateCanonicalCertificationDecision } from './canonical-certification-decision.mjs';

const sourceSha = 'a'.repeat(40);
const manifestId = 'manifest-test-001';
const runId = 'run-test-001';
const keys = { tenant: 'validated', backup: 'validated', rollback: 'validated', artifact: 'validated', security: 'validated' };

const base = {
  certification_result: 'passed',
  blocker_state: 'clear',
  blocker_count: 0,
  consumed_source_sha: sourceSha,
  consumed_release_manifest_id: manifestId,
  certification_run_id: runId,
  required_contracts: keys,
  identity: {
    source_sha_matches_manifest: true,
    manifest_id_matches_payload: true,
    certification_run_id_matches_manifest: true,
  },
};

evaluateCanonicalCertificationDecision({ decision: base, expectedSourceSha: sourceSha, expectedManifestId: manifestId, expectedCertificationRunId: runId });

const attacks = {
  FORGED_RESULT: {...base, certification_result: 'blocked'},
  FORGED_CLEAR: {...base, blocker_count: 1},
  WRONG_SHA: {...base, consumed_source_sha: 'b'.repeat(40)},
  WRONG_MANIFEST: {...base, consumed_release_manifest_id: 'forged'},
  WRONG_RUN: {...base, certification_run_id: 'forged-run'},
  MISSING_CONTRACT: {...base, required_contracts: {...keys, tenant: undefined}},
  EMPTY_CONTRACTS: {...base, required_contracts: {}},
  UNKNOWN_CONTRACT: {...base, required_contracts: {...keys, forged: 'validated'}},
  UNVALIDATED_CONTRACT: {...base, required_contracts: {...keys, backup: 'missing'}},
  IDENTITY_LIE: {...base, identity: {...base.identity, source_sha_matches_manifest: false}},
};

for (const [name, decision] of Object.entries(attacks)) {
  assert.throws(
    () => evaluateCanonicalCertificationDecision({ decision, expectedSourceSha: sourceSha, expectedManifestId: manifestId, expectedCertificationRunId: runId }),
    /CANONICAL_CERTIFICATION_REJECTED/,
    name,
  );
}

console.log(`Canonical certification decision test: PASS (${Object.keys(attacks).length} forged decisions rejected)`);
