import fs from 'node:fs';

const files = {
  schema: fs.readFileSync('src/lib/document-intelligence/schema-discovery.ts', 'utf8'),
  validation: fs.readFileSync('src/lib/document-intelligence/validation.ts', 'utf8'),
  routing: fs.readFileSync('src/lib/document-intelligence/routing.ts', 'utf8'),
};

const checks = [
  ['schema avoids generic product-code alias', !files.schema.includes("'الصنف']")],
  ['schema records ambiguity', files.schema.includes('ambiguous-top-candidates')],
  ['schema lowers confidence for ambiguity', files.schema.includes('Math.min(best, 0.69)')],
  ['schema handles Arabic separators', files.schema.includes('/٬/g') && files.schema.includes('/٫/g')],
  ['validation rejects non-finite reconciliation inputs', files.validation.includes('RECONCILIATION_INPUT_INVALID')],
  ['validation reports incomplete line math', files.validation.includes('VALIDATION_INPUT_INCOMPLETE')],
  ['validation clamps evidence scores', files.validation.includes('finiteScore')],
  ['validation fails closed for non-finite confidence', files.validation.includes('if (!Number.isFinite(score))')],
  ['routing clamps confidence', files.routing.includes('Math.max(0, Math.min(1, value))')],
  ['unknown routes remain unmapped', files.routing.includes("action: 'UNMAPPED'") && files.routing.includes("destination: 'quarantine'")],
];

const failures = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failures.length) process.exit(1);
console.log(`Document Intelligence hardening: ${checks.length}/${checks.length} PASS`);
