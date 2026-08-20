import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync('src/lib/freshness.ts', 'utf8');
for (const token of ['FRESH', 'WARNING', 'STALE', 'CRITICAL', 'UNKNOWN', 'canDriveAlerts', 'canDriveForecast', 'canDriveExecutiveDecisions', 'asOf', 'DEFAULT_FRESHNESS_POLICY']) assert.match(source, new RegExp(token), `freshness contract missing ${token}`);
assert.match(source, /WARNING.*false.*false.*false/s, 'warning state must block forecast and executive decisions');
assert.match(source, /STALE.*false.*false.*false/s, 'stale state must block decision surfaces');
assert.match(source, /UNKNOWN.*false.*false.*false/s, 'unknown freshness must block decision surfaces');
console.log('Freshness contract: PASS');
