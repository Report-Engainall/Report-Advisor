import fs from 'node:fs';

const adapter = fs.readFileSync('src/lib/data-quality-snapshot-runtime.ts', 'utf8');
const page = fs.readFileSync('src/pages/DataQualitySnapshotPage.tsx', 'utf8');

for (const pattern of [
  /status:\s*'OK'\s*\|\s*'EMPTY'/,
  /typeof data\.tenant_id !== 'string'/,
  /Number\.isFinite\(entity\.total\)/,
  /entity\.issues > entity\.total/,
  /entity\.score > 100/,
  /Number\.isFinite\(issue\.count\)/,
  /issue\.count < 0/,
  /DATA_QUALITY_EMPTY_SNAPSHOT_INCONSISTENT/,
]) {
  if (!pattern.test(adapter)) throw new Error(`Missing runtime truth invariant: ${pattern}`);
}

for (const pattern of [
  /snapshot\.status === 'EMPTY' \? 0/,
  /Math\.max\(0, Math\.min\(100/,
]) {
  if (!pattern.test(page)) throw new Error(`Missing UI truth invariant: ${pattern}`);
}

console.log('Data Quality empty-runtime contract: PASS');
