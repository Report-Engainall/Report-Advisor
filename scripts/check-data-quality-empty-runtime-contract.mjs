import fs from 'node:fs';

const adapter = fs.readFileSync('src/lib/data-quality-snapshot.ts', 'utf8');

if (!/status:\s*'OK'\s*\|\s*'EMPTY'/.test(adapter)) {
  throw new Error('Data Quality adapter must preserve the canonical EMPTY status');
}
if (!/data\.status !== 'OK' && data\.status !== 'EMPTY'/.test(adapter)) {
  throw new Error('Data Quality adapter must accept only OK or EMPTY snapshots');
}
if (!/DATA_QUALITY_EMPTY_SNAPSHOT_INCONSISTENT/.test(adapter)) {
  throw new Error('EMPTY snapshots must be validated for zero entity totals/issues/scores');
}

console.log('Data Quality empty-runtime contract: PASS');
