import assert from 'node:assert/strict';
import fs from 'node:fs';

const contracts = fs.readFileSync('services/document-intelligence/app/contracts.py', 'utf8');
const policy = fs.readFileSync('services/document-intelligence/app/policy.py', 'utf8');
const requirements = fs.readFileSync('docs/DOCUMENT_INTELLIGENCE_ENGINE_REQUIREMENTS.md', 'utf8');
const gateway = fs.readFileSync('src/lib/documentIntelligenceGateway.ts', 'utf8');
const evidenceLedger = fs.readFileSync('src/lib/free-toolbox/evidence-ledger.ts', 'utf8');
const lineage = fs.readFileSync('src/lib/free-toolbox/data-lineage.ts', 'utf8');

for (const symbol of [
  'ProcessingState',
  'Provenance',
  'ExtractedField',
  'DocumentEnvelope',
  'DocumentParser',
  'OCRProvider',
  'TableExtractor',
  'EntityResolver',
  'ValidationEngine',
  'RoutingEngine',
]) assert.ok(contracts.includes(symbol), `missing contract: ${symbol}`);

assert.ok(policy.includes('require_validated'), 'validated boundary missing');
assert.ok(policy.includes('require_approved'), 'approved boundary missing');
assert.ok(policy.includes('RawDataBoundaryError'), 'raw data boundary guard missing');
assert.ok(requirements.includes('Raw → Extracted → Staging → Validated → Reconciled → Approved'), 'canonical lifecycle missing');
assert.ok(requirements.includes('Unknown does not mean ignored'), 'unknown preservation rule missing');

for (const symbol of [
  'DocumentExtractionFact',
  'sourceDocumentId',
  'sourceHash',
  'location',
  'extractedFactsToEvidence',
  'attachExtractedFactsToLineage',
]) assert.ok(gateway.includes(symbol), `document lineage bridge missing: ${symbol}`);

for (const symbol of ['sourceDocumentId', 'sourceHash', 'location']) {
  assert.ok(evidenceLedger.includes(symbol), `canonical evidence provenance missing: ${symbol}`);
}
assert.ok(lineage.includes('type:\'source\'|\'transform\'|\'metric\'|\'insight\'|\'decision\''), 'canonical lineage node types missing');
assert.ok(gateway.includes("if (!graph.nodes.some(node => node.id === targetId) || evidence.length === 0) return graph;"), 'bridge must not fabricate a downstream target');
assert.ok(gateway.includes("filter(fact => Boolean(fact.source) && Number.isFinite(fact.confidence)"), 'bridge must reject ungrounded facts');

console.log('document-intelligence contract gate: PASS');
