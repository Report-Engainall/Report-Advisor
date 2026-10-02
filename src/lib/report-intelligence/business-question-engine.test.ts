import { describe, expect, it } from 'vitest';
import { evaluateBusinessQuestion, sortBusinessQuestions } from './business-question-engine';

describe('business question engine', () => {
  it('answers only when required fields and sample exist', () => {
    const result = evaluateBusinessQuestion({
      id: 'sales.what',
      label: 'ماذا حدث في المبيعات؟',
      requiredFields: ['documentDate', 'netAmount'],
      minimumSample: 6,
      priority: 100,
      availableFields: ['documentDate', 'netAmount', 'customerCode'],
      sampleSize: 9,
      answer: { total: 1000 },
    });
    expect(result.state).toBe('ANSWERED');
    expect(result.answer).toEqual({ total: 1000 });
  });

  it('returns NOT_AVAILABLE for missing business input', () => {
    const result = evaluateBusinessQuestion({
      id: 'sales.profitability',
      label: 'ما هو الهامش؟',
      requiredFields: ['netAmount', 'cost'],
      minimumSample: 12,
      priority: 80,
      availableFields: ['netAmount'],
      sampleSize: 100,
    });
    expect(result.state).toBe('NOT_AVAILABLE');
    expect(result.missingFields).toEqual(['cost']);
  });

  it('returns INSUFFICIENT_SAMPLE rather than inventing a result', () => {
    const result = evaluateBusinessQuestion({
      id: 'sales.trend',
      label: 'كيف تغيرت المبيعات؟',
      requiredFields: ['documentDate', 'netAmount'],
      minimumSample: 6,
      priority: 90,
      availableFields: ['documentDate', 'netAmount'],
      sampleSize: 3,
      answer: { trend: 'up' },
    });
    expect(result.state).toBe('INSUFFICIENT_SAMPLE');
    expect(result.answer).toBeNull();
  });

  it('blocks when policy says execution is not allowed', () => {
    const result = evaluateBusinessQuestion({
      id: 'decision.execute',
      label: 'هل يمكن تنفيذ الإجراء؟',
      requiredFields: ['netAmount'],
      minimumSample: 1,
      priority: 50,
      availableFields: ['netAmount'],
      sampleSize: 10,
      answer: { ready: true },
      blockedReason: 'لا توجد موافقة مخولة.',
    });
    expect(result.state).toBe('BLOCKED');
    expect(result.answer).toBeNull();
  });

  it('sorts high-value questions first', () => {
    const questions = [
      evaluateBusinessQuestion({
        id: 'low', label: 'low', requiredFields: [], minimumSample: 0, priority: 10, availableFields: [], sampleSize: 1, answer: true,
      }),
      evaluateBusinessQuestion({
        id: 'high', label: 'high', requiredFields: [], minimumSample: 0, priority: 100, availableFields: [], sampleSize: 1, answer: true,
      }),
    ];
    expect(sortBusinessQuestions(questions).map((item) => item.id)).toEqual(['high', 'low']);
  });
});
