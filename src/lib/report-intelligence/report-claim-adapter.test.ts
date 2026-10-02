import { describe, expect, it } from 'vitest';
import { buildClaimsFromReportIntelligence } from './report-claim-adapter';
import type { ReportIntelligence } from './report-smart-insights';

const intelligence: ReportIntelligence = {
  summary: 'اختبار',
  signals: [{
    id: 'sales:date-missing',
    severity: 'medium',
    title: 'الفترة الزمنية غير مثبتة',
    message: 'لا يوجد حقل تاريخ واضح.',
    evidence: ['dateField=missing'],
  }],
  recommendations: [{
    id: 'rec:sales:date-missing',
    status: 'PROPOSED',
    priority: 'medium',
    title: 'راجع: الفترة الزمنية غير مثبتة',
    action: 'ثبّت تاريخًا موحدًا للمصدر.',
    why: 'لا يوجد حقل تاريخ واضح.',
    evidence: ['dateField=missing'],
  }],
  forecast: {
    status: 'INSUFFICIENT_SAMPLE',
    metric: null,
    method: 'deterministic-monthly-trend',
    observedPeriods: 0,
    nextPeriod: null,
    nextValue: null,
    direction: null,
    note: 'لا يوجد توقع.',
  },
  guidance: {
    focus: 'الفترة الزمنية غير مثبتة',
    inspect: ['لا يوجد حقل تاريخ واضح.'],
    ownerHint: 'المسؤول',
    boundary: 'الإشارة تحتاج تدقيقًا.',
  },
};

describe('report claim adapter', () => {
  const base = {
    intelligence,
    provenance: {
      tenantId: 'tenant-1',
      sourceHash: 'sha256:test',
      reportExecutionJobId: 'job-1',
      evidenceSnapshotId: 'snapshot-1',
      evidencePassportId: 'passport-1',
    },
    inputFields: ['netAmount'] as const,
    sampleSize: 20,
    archetypeId: 'sales.transaction-detail',
    profileVersion: 1,
  };

  it('turns signals and recommendations into source-bound claims', () => {
    const claims = buildClaimsFromReportIntelligence(base);
    expect(claims).toHaveLength(2);
    expect(claims[0].status).toBe('DERIVED');
    expect(claims[0].state).toBe('VALID');
    expect(claims[0].sourceHash).toBe('sha256:test');
    expect(claims[0].ruleId).toBe('sales:date-missing');
    expect(claims[1].status).toBe('RECOMMENDED');
    expect(claims[1].state).toBe('VALID');
  });

  it('fails closed to review when evidence is absent', () => {
    const claims = buildClaimsFromReportIntelligence({
      ...base,
      provenance: { ...base.provenance, evidenceSnapshotId: null, evidencePassportId: null },
    });
    expect(claims.every((claim) => claim.state === 'REVIEW_REQUIRED')).toBe(true);
  });

  it('preserves limitations instead of upgrading a signal to causality', () => {
    const claims = buildClaimsFromReportIntelligence(base);
    expect(claims[0].limitations.join(' ')).toContain('وليست إثباتًا سببيًا');
  });
});
