import assert from 'node:assert/strict';
import {
  addArithmeticRelationshipInsights,
  inferArithmeticRelationships,
  type ArithmeticRelationshipColumn,
  type ArithmeticRelationshipRow,
} from '../src/lib/report-intelligence/arithmetic-relationship-inference.ts';
import type { ReportIntelligence } from '../src/lib/report-intelligence/report-smart-insights.ts';

const numericColumns = (...names: string[]): ArithmeticRelationshipColumn[] =>
  names.map((name, index) => ({ name, index, dataType: 'decimal', mappingConfidence: 95 }));

function rowsFor(
  names: string[],
  make: (index: number) => Record<string, unknown>,
): ArithmeticRelationshipRow[] {
  return Array.from({ length: 18 }, (_, index) => ({
    row_number: 100 + index,
    data: make(index),
  }));
}

const additionRows = rowsFor(['left', 'right', 'net'], (i) => {
  const left = i - 7; // Includes negative values and zero.
  const right = i * 2 + 3;
  return { left, right, net: left + right };
});
const addition = inferArithmeticRelationships({
  rows: additionRows,
  columns: numericColumns('left', 'right', 'net'),
  expectedRowCount: additionRows.length,
});
assert.equal(addition.status, 'evaluated');
assert.ok(addition.candidates.some((item) =>
  item.formula === 'net = left + right' && item.status === 'supported'
), 'addition must pass independent validation, including negative and zero operands');
const additionCandidate = addition.candidates.find((item) => item.formula === 'net = left + right');
assert.ok(additionCandidate);
assert.equal(additionCandidate.validation.rows.length, 6);
assert.ok(additionCandidate.validation.rows.every((row) => row >= 100));
assert.equal(additionCandidate.counterexamples.length, 0);

const multiplicationRows = rowsFor(['quantity', 'unit_price', 'gross'], (i) => {
  const quantity = i + 1;
  const unit_price = i * 3 + 4;
  return { quantity, unit_price, gross: quantity * unit_price };
});
const multiplication = inferArithmeticRelationships({
  rows: multiplicationRows,
  columns: numericColumns('quantity', 'unit_price', 'gross'),
  expectedRowCount: multiplicationRows.length,
});
assert.ok(multiplication.candidates.some((item) =>
  item.formula === 'gross = quantity × unit_price' && item.status === 'supported'
), 'multiplication must be identified and independently validated');

const percentageRows = rowsFor(['fulfilled', 'ordered', 'fulfillment_pct'], (i) => {
  const fulfilled = i + 2;
  const ordered = i * 2 + 9;
  if (i === 4) return { fulfilled, ordered: 0, fulfillment_pct: null };
  return { fulfilled, ordered, fulfillment_pct: (fulfilled / ordered) * 100 };
});
const percentage = inferArithmeticRelationships({
  rows: percentageRows,
  columns: numericColumns('fulfilled', 'ordered', 'fulfillment_pct'),
  expectedRowCount: percentageRows.length,
});
const percentageCandidate = percentage.candidates.find((item) =>
  item.formula === 'fulfillment_pct = (fulfilled ÷ ordered) × 100'
);
assert.ok(percentageCandidate?.status === 'supported', 'percentage ratios must pass independent validation');
assert.ok(percentageCandidate.excludedRows.includes(104), 'division-by-zero row must be excluded with its source row number');

const counterexampleRows = rowsFor(['base', 'adjustment', 'final'], (i) => {
  const base = i * 5 + 10;
  const adjustment = i * 2 + 1;
  const final = base + adjustment + (i === 2 ? 25 : 0); // row 102 is in the held-out validation set.
  return { base, adjustment, final };
});
const counterexamples = inferArithmeticRelationships({
  rows: counterexampleRows,
  columns: numericColumns('base', 'adjustment', 'final'),
  expectedRowCount: counterexampleRows.length,
});
const contradicted = counterexamples.candidates.find((item) =>
  item.formula === 'final = base + adjustment'
);
assert.equal(contradicted?.status, 'counterexamples');
assert.ok(contradicted?.counterexamples.some((item) => item.row === 102));
assert.ok((contradicted?.validation.matches ?? 0) < (contradicted?.validation.sampleSize ?? 0));

const incomplete = inferArithmeticRelationships({
  rows: additionRows,
  columns: numericColumns('left', 'right', 'net'),
  expectedRowCount: additionRows.length + 1,
});
assert.equal(incomplete.status, 'partial_source');
assert.equal(incomplete.reason, 'SOURCE_ROWS_INCOMPLETE');
assert.equal(incomplete.candidates.length, 0, 'partial canonical rows must never produce candidate equations');

const tooSmall = inferArithmeticRelationships({
  rows: additionRows.slice(0, 11),
  columns: numericColumns('left', 'right', 'net'),
  expectedRowCount: 11,
});
assert.equal(tooSmall.status, 'insufficient');
assert.equal(tooSmall.reason, 'INSUFFICIENT_SOURCE_ROWS');

const duplicateSemanticRows = rowsFor(['raw_a', 'raw_b', 'raw_out'], (i) => ({
  total_value: i * 10 + 1,
}));
const duplicateSemantic = inferArithmeticRelationships({
  rows: duplicateSemanticRows,
  columns: [
    { name: 'raw_a', mappedField: 'total_value', dataType: 'decimal', index: 0 },
    { name: 'raw_b', mappedField: 'total_value', dataType: 'decimal', index: 1 },
    { name: 'raw_out', mappedField: 'total_value', dataType: 'decimal', index: 2 },
  ],
  expectedRowCount: duplicateSemanticRows.length,
});
assert.equal(duplicateSemantic.status, 'unavailable',
  'ambiguous duplicate mapped fields must not be used as a fallback source for arithmetic');

const baseIntelligence: ReportIntelligence = {
  businessQuestion: 'ما الذي حدث؟',
  summary: 'ملخص من المصدر.',
  signals: [],
  recommendations: [],
  forecast: {
    status: 'INSUFFICIENT_SAMPLE',
    metric: null,
    method: 'none',
    observedPeriods: 0,
    nextPeriod: null,
    nextValue: null,
    direction: null,
    note: 'العينة غير كافية.',
  },
  guidance: { focus: '', inspect: [], ownerHint: '', boundary: '' },
  findings: [],
  risks: [],
  opportunities: [],
  advisorBrief: {
    health: 'HEALTHY',
    headline: '',
    topFinding: null,
    topRisk: null,
    topOpportunity: null,
    recommendedAction: null,
    ownerHint: '',
    expectedOutcome: null,
    measurement: null,
    proofRequirement: '',
  },
};
const integrated = addArithmeticRelationshipInsights(baseIntelligence, addition);
assert.ok(integrated.signals.some((item) => item.id.startsWith('arithmetic:relationship:')));
assert.ok(integrated.recommendations.some((item) => item.id.startsWith('rec:arithmetic:relationship:')));
assert.ok(integrated.guidance.inspect.some((item) => item.includes('net = left + right')));
assert.ok(
  integrated.recommendations.every((item) =>
    !/أثر مالي مثبت|زيادة أرباح مؤكدة/.test(item.impact)
  ),
  'arithmetic relationships must not invent financial impact',
);

console.log('ARITHMETIC_RELATIONSHIP_INFERENCE_PASS');
