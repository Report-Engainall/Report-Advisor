import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/check-phase7-watcher-lifecycle-closure.mjs', 'utf8');
assert.match(source, /stripComments/);
assert.match(source, /Comment-decoy bypass detected/);
assert.match(source, /Math\.max\(1000,policy\.pollIntervalMs\)/);
assert.match(source, /failedFiles:1/);
assert.doesNotMatch(source, /TODO|FIXME/);
console.log('Phase 7 watcher closure self-test: PASS');
