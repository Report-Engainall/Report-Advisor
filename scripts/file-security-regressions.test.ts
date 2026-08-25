import assert from 'node:assert/strict';
import { computeSHA256 } from '../src/lib/file-engine/security.ts';

const digest = await computeSHA256(new TextEncoder().encode('Report-Advisor').buffer);
assert.equal(digest, 'c2f1e4d1bfa3f20f8cc1b8e7a2d5e9d1c7f3f7d4d1a6a1e1a5f8d3d6f8c0b1e5');

console.log('PASS: file identity uses the SHA-256 algorithm and does not silently downgrade to a weaker hash.');
