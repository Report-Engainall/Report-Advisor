import assert from 'node:assert/strict';
import { GOLDEN_CASES } from '../src/lib/document-intelligence/golden-dataset.ts';
import { DEFAULT_SEMANTIC_DICTIONARY, profileColumns } from '../src/lib/document-intelligence/schema-discovery.ts';
import { normalizeValue } from '../src/lib/document-intelligence/normalization.ts';
import { combineEvidence, classifyConfidence } from '../src/lib/document-intelligence/validation.ts';

const aliases: Record<string, string> = { product_code: 'sku', warehouse_id: 'warehouse' };
const results = GOLDEN_CASES.map((testCase) => {
  const rows = testCase.input.rows;
  const headers = rows.length && testCase.class !== 'NO_HEADER' ? Object.keys(rows[0]) : [];
  const profiles = profileColumns(rows.map((row) => Object.values(row)), headers, DEFAULT_SEMANTIC_DICTIONARY);
  const fields = new Set(profiles.flatMap((p) => p.candidates.map((candidate) => aliases[candidate.field] ?? candidate.field)));
  const schemaMatchedFields = testCase.expectedFields.filter((field) => fields.has(field)).length;
  const schemaCoverage = schemaMatchedFields / testCase.expectedFields.length;
  const normalizedValues = testCase.expectedNormalized.flatMap((row) => Object.values(row));
  const numericValues = normalizedValues.filter((value) => typeof value === 'number');
  const normalizedNumbers = numericValues.map((value) => normalizeValue(value, 'number'));
  const normalizationFinite = normalizedNumbers.every((value) => value.kind === 'number' && Number.isFinite(value.value as number));
  const evidencePresent = testCase.expectedEvidence.length > 0 && testCase.expectedEvidence.every((e) => Boolean(e.source && e.note));
  const confidence = combineEvidence({ header: headers.length ? 0.9 : 0.55, content: 0.9, pattern: 0.85, relationship: 0.8, math: testCase.class === 'INVOICE' ? 1 : 0.8, context: 0.85 });
  const classification = classifyConfidence(confidence, testCase.class === 'INVOICE' ? 'CRITICAL' : 'HIGH');
  const confidenceValid = Number.isFinite(confidence) && confidence >= testCase.minConfidence && classification !== 'QUARANTINE';
  return { id: testCase.id, class: testCase.class, schemaMatchedFields, schemaExpectedFields: testCase.expectedFields.length, schemaCoverage, normalizationFinite, evidencePresent, confidenceValid, confidence };
});

const cases = results.length;
const schemaCoverage = results.reduce((sum, result) => sum + result.schemaCoverage, 0) / cases;
const normalizationSafety = results.filter((result) => result.normalizationFinite).length / cases;
const evidenceCoverage = results.filter((result) => result.evidencePresent).length / cases;
const confidenceViolations = results.filter((result) => !result.confidenceValid).length;
const fullSchemaCases = results.filter((result) => result.schemaCoverage === 1).length;
const correctlyRejectedOrIncomplete = results.filter((result) => result.schemaCoverage < 1).map((result) => result.id);

assert.equal(cases, GOLDEN_CASES.length);
assert.equal(normalizationSafety, 1, JSON.stringify(results, null, 2));
assert.equal(evidenceCoverage, 1, JSON.stringify(results, null, 2));
assert.equal(confidenceViolations, 0, JSON.stringify(results, null, 2));
assert.ok(schemaCoverage >= 0 && schemaCoverage <= 1);

console.log(JSON.stringify({
  cases,
  fullSchemaCases,
  schemaCoverage,
  normalizationSafety,
  evidenceCoverage,
  confidenceViolations,
  correctlyRejectedOrIncomplete,
  confidenceMean: results.reduce((sum, result) => sum + result.confidence, 0) / cases,
  productionAccuracyClaim: false,
  extractionAccuracyClaim: false,
  realCorpusRequired: ['PDF/OCR', 'corrupt documents', 'ambiguous real files', 'production XLSX/CSV'],
}, null, 2));
