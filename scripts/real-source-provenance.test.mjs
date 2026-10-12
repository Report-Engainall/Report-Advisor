import assert from 'node:assert/strict';
import { isGovernedRealFileRecord } from './real-source-provenance.mjs';

const upload = {
  id: 'tenant-upload',
  file_name: 'invoice.pdf',
  storage_path: 'uploads/company-a/invoice.pdf',
  file_hash: 'sha256:' + 'a'.repeat(64),
  metadata: { report_corpus: 'true', source_path: 'uploads/company-a/invoice.pdf' },
};
assert.equal(isGovernedRealFileRecord(upload, 'uploads/company-a/invoice.pdf'), true);
assert.equal(isGovernedRealFileRecord({
  ...upload,
  metadata: { report_corpus: true, source_path: 'tests/fixtures/realistic-reports/invoice.pdf' },
}, 'tests/fixtures/realistic-reports/invoice.pdf'), false);
assert.equal(isGovernedRealFileRecord({
  ...upload,
  metadata: { report_corpus: true, source_path: 'tests\\\\fixtures\\\\realistic-reports\\\\invoice.pdf' },
}, 'tests\\\\fixtures\\\\realistic-reports\\\\invoice.pdf'), false);
assert.equal(isGovernedRealFileRecord({
  ...upload, metadata: { report_corpus: true, fixture_type: 'synthetic-realistic' },
}), false);
assert.equal(isGovernedRealFileRecord({
  ...upload, metadata: { report_corpus: true, catalog_id: 'report-intelligence.48' },
}), false);
assert.equal(isGovernedRealFileRecord({
  ...upload, metadata: { report_corpus: false, source_path: 'uploads/company-a/invoice.pdf' },
}), false);
console.log('REAL_SOURCE_PROVENANCE_CONTRACT_PASS');
