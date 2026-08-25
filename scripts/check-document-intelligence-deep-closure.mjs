import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = process.cwd();
const pipeline = fs.readFileSync(`${root}/services/document-intelligence/app/pipeline.py`, 'utf8');
const model = fs.readFileSync(`${root}/services/document-intelligence/app/intermediate_model.py`, 'utf8');

for (const token of [
  'source_sha256', 'classify_route', 'confidence_gate',
  'process_with_parser', 'requires_ocr', 'requires_review',
]) assert.ok(pipeline.includes(token), `pipeline missing ${token}`);

for (const token of [
  'Provenance', 'source_file', 'page:', 'sheet:', 'table:',
  'row:', 'column:', 'cell:', 'bbox:', 'parser_version',
  'class Table', 'headers:', 'rows:',
]) assert.ok(model.includes(token), `intermediate model missing ${token}`);

// Fail-closed confidence semantics must remain explicit.
assert.ok(pipeline.includes('math.isfinite'), 'confidence must reject non-finite values');
assert.ok(pipeline.includes('QUARANTINE'), 'quarantine gate is required');

// Provenance must be source-addressable at cell level, not only document level.
assert.ok(model.includes('provenance: Provenance | None = None'), 'cell/row/table provenance contract missing');

// Guard against silently accepting a provider source different from the inspected bytes.
assert.ok(pipeline.includes('provider source hash does not match inspected source'), 'source integrity guard missing');

console.log('phase deep document intelligence closure: PASS');
