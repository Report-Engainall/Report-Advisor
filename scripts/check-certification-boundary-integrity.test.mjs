import fs from 'node:fs';
import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { validateCertificationBoundary } from './check-certification-boundary-integrity.mjs';

const child = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const candidate = execFileSync('git', ['rev-parse', 'HEAD^'], { encoding: 'utf8' }).trim();
const index = `## CURRENT PROJECT STATE\n- Current code/test candidate: \`${candidate}\`.`;

assert.doesNotThrow(() => validateCertificationBoundary({ index, head: candidate, parent: '', changedFiles: [] }));
const controlPlaneIndex = '# CURRENT CONTROL-PLANE BOUNDARY\n- CURRENT CODE/TEST CANDIDATE: `' + candidate + '`';
assert.doesNotThrow(() => validateCertificationBoundary({ index: controlPlaneIndex, head: candidate, parent: '', changedFiles: [] }));
const arrowIndex = '# CURRENT EXECUTION BOUNDARY\n- CURRENT CODE/TEST CANDIDATE → `' + candidate + '`';
assert.doesNotThrow(() => validateCertificationBoundary({ index: arrowIndex, head: candidate, parent: '', changedFiles: [] }));
const historicalBeforeStartupBoundary = [
  '# LATEST SESSION WRITE-BACK',
  '- CURRENT CODE/TEST CANDIDATE: `0000000000000000000000000000000000000000`.',
  '',
  '# CURRENT EXECUTION BOUNDARY — CURRENT',
  '> This top block is the only startup boundary. Entries below are historical evidence and MUST NOT override it.',
  '- CURRENT CODE/TEST CANDIDATE: `' + candidate + '`.',
  '---',
].join('\n');
assert.doesNotThrow(() => validateCertificationBoundary({ index: historicalBeforeStartupBoundary, head: candidate, parent: '', changedFiles: [] }));
assert.doesNotThrow(() => validateCertificationBoundary({ index, head: child, parent: candidate, changedFiles: ['.github/workflows/final-certification-gate.yml'] }));
assert.doesNotThrow(() => validateCertificationBoundary({ index, head: child, parent: candidate, changedFiles: ['.github/workflows/full-product-browser-e2e.yml'] }));
assert.throws(() => validateCertificationBoundary({ index, head: child, parent: candidate, changedFiles: ['src/app.tsx'] }), /non-governance changes/);
assert.throws(() => validateCertificationBoundary({ index, head: child, parent: '0'.repeat(40), changedFiles: ['.github/workflows/final-certification-gate.yml'] }), /not an ancestor/);

console.log('PASS certification-boundary Test-of-Test: exact candidate, governed-only ancestry, source mutation rejection, and ancestry spoof rejection are covered.');

const liveMasterIndex = fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md', 'utf8');
const liveCandidate = liveMasterIndex.match(/CURRENT CODE\/TEST CANDIDATE\s*(?::|→)\s*`([0-9a-f]{40})`/i)?.[1];
assert.ok(liveCandidate, 'live Master Execution Index must expose a parser-compatible current code/test candidate');
const currentHead = child;
const parentHead = candidate;
const liveChangedFiles = execFileSync('git', ['diff', '--name-only', liveCandidate, currentHead], { encoding: 'utf8' }).trim().split('\n').map((file) => file.trim()).filter(Boolean);
assert.doesNotThrow(() => validateCertificationBoundary({ index: liveMasterIndex, head: currentHead, parent: parentHead, changedFiles: liveChangedFiles }));
console.log('PASS certification-boundary live-index fixture: startup marker, exact candidate parsing, ancestry and governance allowlist are wired to the repository state.');
