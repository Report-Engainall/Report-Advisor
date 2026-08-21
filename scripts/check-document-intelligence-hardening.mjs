import fs from 'node:fs';

const hardening = fs.readFileSync('src/lib/document-intelligence/hardening.ts', 'utf8');
const pipeline = fs.readFileSync('src/lib/document-intelligence/pipeline.ts', 'utf8');
const index = fs.readFileSync('src/lib/document-intelligence/index.ts', 'utf8');

for (const token of [
  'buildRelationshipGraph',
  'classifyTable',
  'inferHeaderlessSchema',
  'resolveEntity',
  'buildIdempotencyEnvelope',
  'decideReview',
]) {
  if (!hardening.includes(token)) throw new Error(`Document intelligence hardening contract missing: ${token}`);
}
for (const token of ['runDocumentPreflight', 'assertEntityResolutionSafe', 'validateLineMath', 'validateInvoiceTotals']) {
  if (!pipeline.includes(token)) throw new Error(`Document intelligence pipeline contract missing: ${token}`);
}
if (!index.includes("./hardening") || !index.includes("./pipeline")) throw new Error('Document intelligence index does not expose hardening pipeline');

const graph = hardening.match(/type SchemaRelationshipGraph/);
const resolution = hardening.match(/type EntityResolution/);
if (!graph || !resolution) throw new Error('Hardening model types are incomplete');

console.log('Document intelligence hardening contract: PASS');
