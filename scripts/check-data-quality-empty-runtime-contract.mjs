import fs from 'node:fs';

const adapter = fs.readFileSync('src/lib/data-quality-snapshot-runtime.ts', 'utf8');
const page = fs.readFileSync('src/pages/DataQualitySnapshotPage.tsx', 'utf8');

if (!/status:\s*'OK'\s*\|\s*'EMPTY'/.test(adapter)) throw new Error('Missing canonical EMPTY status');
if (!/data\.status !== 'OK' && data\.status !== 'EMPTY'/.test(adapter)) throw new Error('Adapter accepts an invalid status');
if (!/DATA_QUALITY_EMPTY_SNAPSHOT_INCONSISTENT/.test(adapter)) throw new Error('EMPTY consistency guard missing');
if (!/snapshot\.status === 'EMPTY' \? 0/.test(page)) throw new Error('UI must not convert EMPTY into 100%');
if (!/Math\.max\(0, Math\.min\(100/.test(page)) throw new Error('UI score must be bounded');

console.log('Data Quality empty-runtime contract: PASS');
