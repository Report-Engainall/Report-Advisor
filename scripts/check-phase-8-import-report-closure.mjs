import fs from 'node:fs';

const required = [
  'src/lib/report-execution/report-execution-contract.ts',
  'src/lib/report-execution/execution-gate.ts',
  'src/lib/report-execution/idempotency.ts',
  'src/lib/report-execution/checkpoint.ts',
  'src/lib/report-execution/execution-ledger.ts',
  'src/lib/report-execution/artifact-integrity.ts',
  'src/lib/report-execution/durable-production-runner.ts',
  'src/lib/report-execution/renderers.ts',
  'src/lib/canonicalIntelligence.ts',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Phase 8 missing ${file}`);
}
const governance = fs.readFileSync('scripts/check-import-runtime-governance.mjs', 'utf8');
if (!governance.includes('runImportJob') || !governance.includes('import-upsert')) {
  throw new Error('Phase 8 import governance guard is not wired to the unified import path');
}
const businessKey = fs.readFileSync('scripts/check-import-business-key.mjs', 'utf8');
if (!businessKey.includes('SKU') && !businessKey.includes('sku')) {
  throw new Error('Phase 8 business-key protection is missing SKU coverage');
}
console.log('Phase 8 import/report execution closure: PASS');
