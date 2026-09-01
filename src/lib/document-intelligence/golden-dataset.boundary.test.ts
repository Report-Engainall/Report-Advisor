import { describe, expect, it } from 'vitest';
import { GOLDEN_CASES, evaluateGoldenCase, scoreGoldenCases } from './golden-dataset';

describe('document intelligence golden corpus boundaries', () => {
  it('keeps the golden corpus deterministic and complete', () => {
    expect(GOLDEN_CASES.length).toBe(8);
    expect(new Set(GOLDEN_CASES.map((item) => item.id)).size).toBe(GOLDEN_CASES.length);
    expect(GOLDEN_CASES.every((item) => item.minConfidence >= 0 && item.minConfidence <= 1)).toBe(true);
  });

  it('fails a case closed when confidence is non-finite or below the threshold', () => {
    const expected = GOLDEN_CASES[0];
    const actual = {
      fields: expected.expectedFields,
      normalized: expected.expectedNormalized,
      evidence: expected.expectedEvidence,
      confidence: Number.NaN,
    };
    expect(evaluateGoldenCase(expected, actual).passed).toBe(false);

    expect(evaluateGoldenCase(expected, { ...actual, confidence: expected.minConfidence - 0.01 }).passed).toBe(false);
    expect(evaluateGoldenCase(expected, { ...actual, confidence: expected.minConfidence }).passed).toBe(true);
  });

  it('requires schema, normalized output and provenance evidence together', () => {
    const expected = GOLDEN_CASES[1];
    const valid = {
      fields: expected.expectedFields,
      normalized: expected.expectedNormalized,
      evidence: expected.expectedEvidence,
      confidence: expected.minConfidence,
    };

    expect(evaluateGoldenCase(expected, valid).passed).toBe(true);
    expect(evaluateGoldenCase(expected, { ...valid, evidence: [] }).passed).toBe(false);
    expect(evaluateGoldenCase(expected, { ...valid, normalized: [] }).passed).toBe(false);
    expect(evaluateGoldenCase(expected, { ...valid, fields: [] }).passed).toBe(false);
  });

  it('does not allow duplicate or unknown result IDs to inflate corpus readiness', () => {
    const ids = GOLDEN_CASES.map((item) => item.id);
    const results = [
      ...ids.map((id) => ({ id, passed: true })),
      { id: ids[0], passed: true },
      { id: 'unknown-case', passed: true },
    ];

    const score = scoreGoldenCases(results);
    expect(score.cases).toBe(8);
    expect(score.passed).toBe(8);
    expect(score.failed).toBe(0);
    expect(score.accuracy).toBe(1);
    expect(score.ready).toBe(true);
  });
});
