import fs from 'node:fs';
const source = fs.readFileSync('src/lib/intelligence/operationalIntelligence.ts', 'utf8');
const required = [
  'classifyABCXYZ', 'classifyFSN', 'decideReplenishment', 'scoreCustomer', 'scoreSupplier',
  'detectAnomalies', 'opportunityScan', 'warnings',
];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`Operational intelligence contract missing: ${token}`);
}
if (!source.includes('leadTimeDays')) throw new Error('Replenishment must consider lead time');
if (!source.includes('RFM/churn')) throw new Error('Customer intelligence warning contract missing');
console.log('Operational intelligence contract: PASS');
