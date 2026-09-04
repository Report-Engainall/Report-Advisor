import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { validateCertificationBoundary } from './check-certification-boundary-integrity.mjs';

const child = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const candidate = execFileSync('git', ['rev-parse', 'HEAD^'], { encoding: 'utf8' }).trim();
const index = `## CURRENT PROJECT STATE\n- Current code/test candidate: \`${candidate}\`.`;

assert.doesNotThrow(() => validateCertificationBoundary({ index, head: candidate, parent: '', changedFiles: [] }));
assert.doesNotThrow(() => validateCertificationBoundary({ index, head: child, parent: candidate, changedFiles: ['.github/workflows/final-certification-gate.yml'] }));
assert.throws(() => validateCertificationBoundary({ index, head: child, parent: candidate, changedFiles: ['src/app.tsx'] }), /non-governance changes/);
assert.throws(() => validateCertificationBoundary({ index, head: child, parent: '0'.repeat(40), changedFiles: ['.github/workflows/final-certification-gate.yml'] }), /not an ancestor/);

console.log('PASS certification-boundary Test-of-Test: exact candidate, governed-only ancestry, source mutation rejection, and ancestry spoof rejection are covered.');
