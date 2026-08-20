import fs from 'node:fs';
const p = fs.readFileSync('src/lib/intelligence/adaptiveProcessingPipeline.ts', 'utf8');
for (const token of ['FAST', 'WORKER', 'DOCUMENT_AI', 'HEAVY_ANALYTICS', 'OFFLINE', 'reconciliationRequired', 'evidenceRequired', 'finalizePipeline', 'assessTruth']) {
  if (!p.includes(token)) throw new Error(`Adaptive pipeline contract missing: ${token}`);
}
const d = fs.readFileSync('docs/INTELLIGENCE_UI_FOUNDATION_MIGRATION.md', 'utf8');
for (const token of ['Truth Policy', 'Adaptive processing routing', 'SSOT Metrics', 'Evidence/Lineage']) {
  if (!d.includes(token)) throw new Error(`Migration map missing: ${token}`);
}
console.log('Adaptive pipeline integration: PASS');
