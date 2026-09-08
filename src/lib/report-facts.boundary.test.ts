import { describe, expect, it } from 'vitest';
import { assertReportFacts, fact } from './free-toolbox/report-facts';

describe('report fact confidence boundaries', () => {
  it('normalizes NaN confidence to zero', () => expect(fact('x', 1, Number.NaN).confidence).toBe(0));
  it('normalizes infinite confidence to zero', () => expect(fact('x', 1, Number.POSITIVE_INFINITY).confidence).toBe(0));
  it('clamps confidence above one', () => expect(fact('x', 1, 2).confidence).toBe(1));
  it('clamps negative confidence', () => expect(fact('x', 1, -1).confidence).toBe(0));
  it('flags non-finite confidence as decision-unsafe', () => expect(assertReportFacts([{ ...fact('x', 1, 0.8), confidence: Number.NaN }])).toHaveLength(1));
});
