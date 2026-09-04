import { strict as assert } from 'node:assert';
import { validateCertificationBoundary } from './check-certification-boundary-integrity.mjs';

const candidate = 'a'.repeat(40);
const child = 'b'.repeat(40);
const parent = candidate;
const index = `## CURRENT PROJECT STATE\n- Current code/test candidate: \`${candidate}\`.`;

assert.doesNotThrow(() => validateCertificationBoundary({ index, head: candidate, parent: '0'.repeat(40), changedFiles: [] }));
assert.doesNotThrow(() => validateCertificationBoundary({ index, head: child, parent, changedFiles: ['.github/workflows/final-certification-gate.yml'] }));
assert.throws(() => validateCertificationBoundary({ index, head: child, parent, changedFiles: ['src/app.tsx'] }), /non-governance changes/);
assert.throws(() => validateCertificationBoundary({ index, head: child, parent: 'c'.repeat(40), changedFiles: ['.github/workflows/final-certification-gate.yml'] }), /not an ancestor/);

console.log('PASS certification-boundary Test-of-Test: exact candidate, governed-only ancestry, source mutation rejection, and ancestry spoof rejection are covered.');
