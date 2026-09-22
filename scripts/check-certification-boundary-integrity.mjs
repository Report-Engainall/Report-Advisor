import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

// Governance-only trigger: runtime certification remains fail-closed and exact-SHA bound.
const normalize = value => String(value ?? '').replaceAll('\r\n', '\n').trim();
const candidateFromIndex = index => normalize(index).match(/(?:CURRENT PROJECT STATE|CURRENT EXECUTION BOUNDARY)[\s\S]{0,1600}?(?:CURRENT_CODE_TEST_CANDIDATE|Current code\/test candidate|Current Code\/Test Candidate|Exact code\/test head entering this sweep)[^`]*`([0-9a-f]{40})`/i)?.[1]?.toLowerCase();

export function validateCertificationBoundary({ index, head, parent, changedFiles }) {
  const indexed = candidateFromIndex(index);
  if (!indexed) throw new Error('CERTIFICATION BOUNDARY FAIL: current code/test candidate missing from Master Index');
  if (!/^[0-9a-f]{40}$/.test(head)) throw new Error(`CERTIFICATION BOUNDARY FAIL: invalid HEAD ${head}`);
  if (head === indexed) return true;

  const allowedGovernanceOnly = new Set([
    'docs/MASTER_EXECUTION_INDEX.md',
    'ONE-PROGRAMMER-SESSION-MEMORY.md',
    'docs/MASTER_PRODUCT_REFERENCE.md',
    'docs/EVIDENCE/2026-09-04_RBAC_APPROVAL_AUTHORITY_FORENSIC.md',
    'docs/EVIDENCE/2026-09-04_CANDIDATE_RECONCILIATION_c346-to-f89.md',
    'scripts/check-artifact-migration-provenance.mjs',
    'scripts/check-certification-boundary-integrity.mjs',
    'scripts/check-certification-boundary-integrity.test.mjs',
    'scripts/final-certification-provenance.test.mjs',
    'scripts/check-production-gate-runtime.mjs',
    'scripts/check-execution-enforcement-protocol.mjs',
    'scripts/check-execution-enforcement-protocol.test.mjs',
    'scripts/execution-enforcement-adversarial.test.mjs',
    'scripts/check-decision-approval-toctou-contract.mjs',
    'scripts/check-decision-runtime-authorization.mjs',
    'scripts/check-governance-runtime-chain.mjs',
    'scripts/check-import-center-product-contract.mjs',
    'scripts/check-import-query-bounds.mjs',
    'scripts/check-import-source-field-preservation.mjs',
    'scripts/check-integration-boundaries.mjs',
    'scripts/check-release-decision-provenance.mjs',
    'scripts/check-release-drift.mjs',
    'scripts/check-release-manifest-integrity.mjs',
    'scripts/check-runtime-closure-integrity.mjs',
    'scripts/check-phase10-backup-restore-contract.mjs',
    'scripts/check-runtime-lifecycle-hardening.mjs',
    'scripts/check-tenant-resolver-lineage.mjs',
    'scripts/check-unified-evidence-action-learning.mjs',
    'scripts/real-business-e2e.mjs',
    'scripts/run-full-product-browser-e2e.mjs',
    '.github/workflows/execution-enforcement-contract.yml',
    '.github/workflows/final-certification-gate.yml',
    '.github/workflows/full-product-browser-e2e.yml',
  ]);
  if (!Array.isArray(changedFiles) || changedFiles.length === 0 || changedFiles.some(file => !allowedGovernanceOnly.has(file))) {
    throw new Error(`CERTIFICATION BOUNDARY FAIL: HEAD ${head} differs from indexed candidate ${indexed} with non-governance changes`);
  }
  try { execFileSync('git', ['merge-base', '--is-ancestor', indexed, head], { stdio: 'ignore' }); }
  catch { throw new Error(`CERTIFICATION BOUNDARY FAIL: indexed candidate ${indexed} is not an ancestor of HEAD ${head}`); }
  if (parent && parent !== indexed) {
    try { execFileSync('git', ['merge-base', '--is-ancestor', indexed, parent], { stdio: 'ignore' }); }
    catch { throw new Error(`CERTIFICATION BOUNDARY FAIL: indexed candidate ${indexed} is not an ancestor of parent ${parent}`); }
  }
  return true;
}

if (process.argv[1]?.endsWith('check-certification-boundary-integrity.mjs')) {
  const index = fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md', 'utf8');
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const parent = execFileSync('git', ['rev-parse', 'HEAD^'], { encoding: 'utf8' }).trim();
  const indexed = candidateFromIndex(index);
  const changedFiles = indexed ? execFileSync('git', ['diff', '--name-only', indexed, head], { encoding: 'utf8' }).trim().split('\n').filter(Boolean) : [];
  validateCertificationBoundary({ index, head, parent, changedFiles });
  console.log(`CERTIFICATION BOUNDARY PASS: indexed=${indexed} HEAD=${head} changed=${changedFiles.length}`);
}