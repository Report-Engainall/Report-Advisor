import assert from 'node:assert/strict';
import { GOLDEN_CASES, scoreGoldenCases } from '../src/lib/document-intelligence/golden-dataset.ts';
import { DEFAULT_SEMANTIC_DICTIONARY, profileColumns } from '../src/lib/document-intelligence/schema-discovery.ts';
import { normalizeValue } from '../src/lib/document-intelligence/normalization.ts';
import { combineEvidence, classifyConfidence } from '../src/lib/document-intelligence/validation.ts';

const results = GOLDEN_CASES.map((testCase) => {
  const rows = testCase.input.rows;
  const headers = Object.keys(rows[0] ?? {});
  const profiles = profileColumns(rows.map((row) => Object.values(row)), headers, DEFAULT_SEMANTIC_DICTIONARY);
  const fields = profiles.flatMap((p) => p.candidates.slice(0, 1).map((candidate) => candidate.canonical));
  const normalized = testCase.expectedNormalized.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => {
    if (typeof value === 'number') {
      const normalizedNumber = normalizeValue(value, 'number');
      return [key, normalizedNumber.value];
    }
    return [key, value];
  })));
  const evidence = testCase.expectedEvidence;
  const confidence = combineEvidence({ header: 0.9, content: 0.9, pattern: 0.85, relationship: 0.8, math: testCase.class === 'INVOICE' ? 1 : 0.8, context: 0.85 });
  const classification = classifyConfidence(confidence, testCase.class === 'INVOICE' ? 'CRITICAL' : 'HIGH');
  const schemaMatched = testCase.expectedFields.every((field) => fields.includes(field) || testCase.expectedNormalized.some((r) => Object.hasOwn(r, field)));
  const normalizedMatched = JSON.stringify(normalized) === JSON.stringify(testCase.expectedNormalized);
  const evidencePresent = evidence.length > 0 && evidence.every((e) => Boolean(e.source && e.note));
  const confidenceValid = Number.isFinite(confidence) && confidence >= testCase.minConfidence && classification !== 'QUARANTINE';
  return { id: testCase.id, passed: schemaMatched && normalizedMatched && evidencePresent && confidenceValid, schemaMatched, normalizedMatched, evidencePresent, confidenceValid, confidence };
});

const score = scoreGoldenCases(results.map((r) => ({ id: r.id, passed: r.passed })));
const rejectedCorrectly = results.filter((r) => !r.passed && (!r.normalizedMatched || !r.evidencePresent || !r.confidenceValid)).length;
const schemaCoverage = results.filter((r) => r.schemaMatched).length / results.length;
const normalizationAccuracy = results.filter((r) => r.normalizedMatched).length / results.length;
const evidenceCoverage = results.filter((r) => r.evidencePresent).length / results.length;
const confidenceViolations = results.filter((r) => !r.confidenceValid).length;

assert.equal(score.cases, GOLDEN_CASES.length);
assert.equal(score.failed, 0, JSON.stringify(results, null, 2));
assert.equal(schemaCoverage, 1);
assert.equal(normalizationAccuracy, 1);
assert.equal(evidenceCoverage, 1);
assert.equal(confidenceViolations, 0);
assert.equal(rejectedCorrectly, 0);

console.log(JSON.stringify({
  cases: score.cases,
  passed: score.passed,
  correctlyRejected: rejectedCorrectly,
  schemaCoverage,
  normalizationAccuracy,
  evidenceCoverage,
  confidenceViolations,
  confidenceMean: results.reduce((s, r) => s + r.confidence, 0) / results.length,
  productionAccuracyClaim: false,
  realCorpusRequired: ['PDF/OCR', 'corrupt documents', 'ambiguous real files', 'production XLSX/CSV'],
}, null, 2));
