import { describe, expect, it } from 'vitest';
import {
  evaluateDecisionReadiness,
  isClaimDecisionReady,
  validateClaim,
  type Claim,
} from './claim-ledger';

function claim(overrides: Partial<Claim> = {}): Claim {
  return {
    claimId: 'claim-1',
    tenantId: 'tenant-1',
    sourceHash: 'sha256:test',
    reportExecutionJobId: 'job-1',
    evidenceSnapshotId: 'snapshot-1',
    evidencePassportId: 'passport-1',
    status: 'DERIVED',
    state: 'VALID',
    statement: 'إجمالي المبيعات ارتفع خلال الفترة.',
    inputFields: ['documentDate', 'netAmount'],
    calculationMethod: 'monthly_sum_delta',
    scope: { period: '2026-01/2026-09' },
    sampleSize: 9,
    limitations: ['لا يثبت هذا التحليل سبب التغير.'],
    supportingEvidence: ['monthly totals'],
    archetypeId: 'sales.transaction-detail',
    profileVersion: 1,
    ruleId: 'sales.trend.v1',
    ...overrides,
  };
}

describe('claim ledger', () => {
  it('accepts a fully source-bound claim', () => {
    const result = validateClaim(claim());
    expect(result.valid).toBe(true);
    expect(isClaimDecisionReady(claim())).toBe(true);
  });

  it('rejects a valid claim with missing provenance', () => {
    const result = validateClaim(claim({ sourceHash: '', evidenceSnapshotId: null, evidencePassportId: null }));
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('SOURCE_HASH_MISSING');
    expect(result.reasons).toContain('EVIDENCE_REFERENCE_MISSING');
  });

  it('keeps inference from becoming decision-ready', () => {
    const item = claim({ status: 'INFERRED' });
    expect(isClaimDecisionReady(item)).toBe(false);
    expect(validateClaim(item).valid).toBe(false);
  });

  it('separates severity-style materiality from evidence-backed readiness', () => {
    const result = evaluateDecisionReadiness({
      readiness: { evidenceStrength: 0.45, materiality: 0.95, actionability: 0.9, urgency: 0.9 },
      sampleSize: 24,
      minimumSample: 12,
      hasEvidence: true,
      hasAction: true,
    });
    expect(result.state).toBe('READY_WITH_REVIEW');
    expect(result.score).toBeGreaterThan(0.5);
  });

  it('fails closed when the sample is too small', () => {
    const result = evaluateDecisionReadiness({
      readiness: { evidenceStrength: 1, materiality: 1, actionability: 1, urgency: 1 },
      sampleSize: 3,
      minimumSample: 12,
      hasEvidence: true,
      hasAction: true,
    });
    expect(result.state).toBe('INSUFFICIENT_SAMPLE');
  });
});
