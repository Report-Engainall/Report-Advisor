import assert from 'node:assert/strict';
import { adversarialCorpus } from './adversarial-document-corpus.mjs';

assert.equal(adversarialCorpus.length, 10);
const ids = adversarialCorpus.map((x) => x.id);
assert.equal(new Set(ids).size, ids.length);
const expected = new Set(['PASS', 'REVIEW', 'FALLBACK_OR_REVIEW', 'QUARANTINE']);
for (const item of adversarialCorpus) {
  assert.ok(item.id && item.failure);
  assert.ok(expected.has(item.expected));
}
for (const id of ['truncated-pdf', 'binary-garbage', 'empty-sheet', 'arabic-ocr-noise', 'numeric-separator-chaos']) {
  assert.ok(ids.includes(id), `missing adversarial case: ${id}`);
}
console.log('ADVERSARIAL_DOCUMENT_CORPUS_COMPLETENESS_PASS');
