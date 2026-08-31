import { describe, expect, it } from 'vitest';
import { explainDecision } from './free-toolbox/evidence-ledger';

describe('evidence confidence boundaries', () => {
  const base = { sourceId: 'src', sourceDocumentId: 'doc', sourceHash: 'hash', method: 'native' as const };
  it('does not propagate NaN confidence', () => expect(explainDecision('d', 'claim', [{ ...base, confidence: Number.NaN }]).confidence).toBe(1));
  it('clamps overconfident evidence to one', () => expect(explainDecision('d', 'claim', [{ ...base, confidence: 5 }]).confidence).toBe(1));
  it('clamps negative evidence confidence to zero', () => expect(explainDecision('d', 'claim', [{ ...base, confidence: -1 }]).confidence).toBe(0));
  it('uses the default confidence when evidence confidence is absent', () => expect(explainDecision('d', 'claim', [base]).confidence).toBe(1));
});
