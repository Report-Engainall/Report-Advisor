import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const normalize = value => String(value ?? '').replaceAll('\r\n', '\n').trim();
const candidateFromIndex = index => normalize(index).match(/(?:CURRENT PROJECT STATE|CURRENT EXECUTION BOUNDARY)[\s\S]{0,1600}?(?:CURRENT_CODE_TEST_CANDIDATE|Current code\/test candidate|Current Code\/Test Candidate|Exact code\/test head entering this sweep)[^`]*`([0-9a-f]{40})`/i)?.[1]?.toLowerCase();

const isAncestor = (ancestor, descendant) => {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

export function validateCertificationBoundary({ index, head, parent, changedFiles, secondParent = '' }) {
  const indexed = candidateFromIndex(index);
  if (!indexed) throw new Error('CERTIFICATION BOUNDARY FAIL: current code/test candidate missing from Master Index');
  if (!/^[0-9a-f]{40}$/.test(head)) throw new Error(`CERTIFICATION BOUNDARY FAIL: invalid HEAD ${head}`);
  if (head === indexed) return true;

  const allowedGovernanceOnly = new Set([
    'docs/MASTER_EXECUTION_INDEX.md',
    'docs/EVIDENCE/2026-09-04_RBAC_APPROVAL_AUTHORITY_FORENSIC.md',
    'docs/EVIDENCE/2026-09-04_CANDIDATE_RECONCILIATION_c346-to-f89.md',
    'scripts/check-certification-boundary-integrity.mjs',
    'scripts/check-certification-boundary-integrity.test.mjs',
    'scripts/final-certification-provenance.test.mjs',
    'scripts/check-execution-enforcement-protocol.mjs',
    'scripts/check-execution-enforcement-protocol.test.mjs',
    'scripts/execution-enforcement-adversarial.test.mjs',
    'scripts/check-decision-approval-toctou-contract.mjs',
    '.github/workflows/execution-enforcement-contract.yml',
    '.github/workflows/final-certification-gate.yml',
  ]);

  const syntheticCandidateSide = Boolean(secondParent && isAncestor(indexed, secondParent));
  if (syntheticCandidateSide) {
    if (changedFiles.some(file => !allowedGovernanceOnly.has(file))) {
      throw new Error(`CERTIFICATION BOUNDARY FAIL: synthetic PR candidate side contains non-governance changes after indexed candidate ${indexed}`);
    }
  } else if (!Array.isArray(changedFiles) || changedFiles.length === 0 || changedFiles.some(file => !allowedGovernanceOnly.has(file))) {
    throw new Error(`CERTIFICATION BOUNDARY FAIL: HEAD ${head} differs from indexed candidate ${indexed} with non-governance changes`);
  }

  if (!isAncestor(indexed, head)) {
    throw new Error(`CERTIFICATION BOUNDARY FAIL: indexed candidate ${indexed} is not an ancestor of HEAD ${head}`);
  }

  // GitHub PR workflows commonly execute against a synthetic merge commit.
  // HEAD^1 is the target/base branch while HEAD^2 is the PR candidate side.
  // The indexed candidate must be an ancestor of the candidate side, not of the unrelated base.
  if (syntheticCandidateSide) return true;
  if (parent && parent !== indexed && !isAncestor(indexed, parent)) {
    throw new Error(`CERTIFICATION BOUNDARY FAIL: indexed candidate ${indexed} is not an ancestor of the checked parent ${parent}`);
  }
  return true;
}

if (process.argv[1]?.endsWith('check-certification-boundary-integrity.mjs')) {
  const index = fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md', 'utf8');
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const parent = execFileSync('git', ['rev-parse', 'HEAD^'], { encoding: 'utf8' }).trim();
  let secondParent = '';
  try { secondParent = execFileSync('git', ['rev-parse', 'HEAD^2'], { encoding: 'utf8' }).trim().toLowerCase(); } catch {}
  const indexed = candidateFromIndex(index);
  const diffBase = secondParent && indexed && isAncestor(indexed, secondParent) ? secondParent : head;
  const changedFiles = indexed ? execFileSync('git', ['diff', '--name-only', indexed, diffBase], { encoding: 'utf8' }).trim().split('\n').filter(Boolean) : [];
  validateCertificationBoundary({ index, head, parent, secondParent, changedFiles });
  console.log(`CERTIFICATION BOUNDARY PASS: indexed=${indexed} HEAD=${head} changed=${changedFiles.length}`);
}
