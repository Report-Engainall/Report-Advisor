import fs from 'node:fs';
const p = fs.readFileSync('src/lib/intelligence/truthPolicy.ts', 'utf8');
for (const token of ['VERIFIED', 'QUALIFIED', 'INSUFFICIENT_DATA', 'BLOCKED', 'canDisplayAsFact', 'canDriveDecision', 'backtested']) {
  if (!p.includes(token)) throw new Error(`Truth policy contract missing: ${token}`);
}
const s = fs.readFileSync('src/lib/intelligence/safeAnalytics.ts', 'utf8');
for (const token of ['safeAnalyticalOutput', 'truth.status', 'INSUFFICIENT_DATA']) {
  if (!s.includes(token)) throw new Error(`Safe analytics contract missing: ${token}`);
}
console.log('Truth policy: PASS');
