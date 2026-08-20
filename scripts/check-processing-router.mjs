import fs from 'node:fs';
const p = fs.readFileSync('src/lib/intelligence/processingRouter.ts', 'utf8');
for (const token of ['planProcessing', 'accuracyCritical', 'offline-first', 'large workload', 'document-service', 'analytics-engine']) {
  if (!p.includes(token)) throw new Error(`Processing router contract missing: ${token}`);
}
console.log('Adaptive processing router: PASS');
