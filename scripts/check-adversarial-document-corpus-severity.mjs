import assert from 'node:assert/strict';
import { adversarialCorpus } from './adversarial-document-corpus.mjs';

const byId = new Map(adversarialCorpus.map((x) => [x.id, x.expected]));
assert.equal(byId.get('truncated-pdf'), 'QUARANTINE');
assert.equal(byId.get('binary-garbage'), 'QUARANTINE');
for (const id of ['empty-sheet', 'merged-header', 'duplicate-header', 'hidden-rows']) assert.equal(byId.get(id), 'REVIEW');
for (const id of ['arabic-ocr-noise', 'wrong-extension']) assert.equal(byId.get(id), 'FALLBACK_OR_REVIEW');
for (const id of ['numeric-separator-chaos', 'formula-values']) assert.equal(byId.get(id), 'PASS');
console.log('ADVERSARIAL_DOCUMENT_CORPUS_SEVERITY_PASS');
