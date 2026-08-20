import fs from 'node:fs';
const source = fs.readFileSync('src/lib/dataQualityTrust.ts', 'utf8');
for (const token of ['assessCompleteness', 'assessUniqueness', 'assessValidity', 'buildDataQualityReport', 'blocking: score < 70', 'MISSING', 'UNKNOWN']) {
  if (!source.includes(token)) throw new Error(`Data quality trust contract missing: ${token}`);
}
console.log('Data quality trust contract: PASS');
