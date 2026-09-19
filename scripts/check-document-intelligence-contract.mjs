import assert from 'node:assert/strict';
import fs from 'node:fs';

const contracts = fs.readFileSync('services/document-intelligence/app/contracts.py', 'utf8');
const policy = fs.readFileSync('services/document-intelligence/app/policy.py', 'utf8');
const requirements = fs.readFileSync('docs/DOCUMENT_INTELLIGENCE_ENGINE_REQUIREMENTS.md', 'utf8');
const intermediate = fs.readFileSync('services/document-intelligence/app/intermediate_model.py', 'utf8');
const main = fs.readFileSync('services/document-intelligence/app/main.py', 'utf8');
const pipeline = fs.readFileSync('services/document-intelligence/app/pipeline.py', 'utf8');

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

if (!intermediate.includes('from .contracts import') || intermediate.includes('@dataclass') || intermediate.includes('class DocumentEnvelope') || intermediate.includes('class Provenance')) {
  throw new Error('Document Intelligence intermediate_model must remain a compatibility re-export, not a second model');
}
if (!main.includes('from .contracts import') || !pipeline.includes('can_transition')) {
  throw new Error('Document Intelligence runtime must use the canonical contracts module');
}
if (!requirements.toLowerCase().includes('pymupdf')) {
  throw new Error('PDF runtime fallback requires PyMuPDF');
}
console.log('document-intelligence contract gate: PASS');
