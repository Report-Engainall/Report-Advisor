import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const script = fs.readFileSync(path.join(process.cwd(), 'scripts/check-phase7-watcher-lifecycle-closure.mjs'), 'utf8');
assert.match(script, /stripComments/);
assert.match(script, /sanitizedDecoy/);
assert.match(script, /Math\.max\(1000,policy\.pollIntervalMs\)/);
assert.match(script, /failedFiles:1/);
assert.doesNotMatch(script, /TODO|FIXME/);
console.log('Phase 7 closure test-of-test: PASS');
