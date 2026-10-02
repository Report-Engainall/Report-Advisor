import { evaluateBusinessQuestion, sortBusinessQuestions } from './business-question-engine.ts';

const check = (condition, message) => { if (!condition) throw new Error(message); };

const answered = evaluateBusinessQuestion({
  id: 'sales.what',
  label: 'ماذا حدث في المبيعات؟',
  requiredFields: ['documentDate', 'netAmount'],
  minimumSample: 6,
  priority: 100,
  availableFields: ['documentDate', 'netAmount', 'customerCode'],
  sampleSize: 9,
  answer: { total: 1000 },
});
check(answered.state === 'ANSWERED' && answered.answer.total === 1000, 'available question should answer');

const unavailable = evaluateBusinessQuestion({
  id: 'sales.profitability',
  label: 'ما هو الهامش؟',
  requiredFields: ['netAmount', 'cost'],
  minimumSample: 12,
  priority: 80,
  availableFields: ['netAmount'],
  sampleSize: 100,
});
check(unavailable.state === 'NOT_AVAILABLE' && unavailable.missingFields.includes('cost'), 'missing inputs must be explicit');

const insufficient = evaluateBusinessQuestion({
  id: 'sales.trend',
  label: 'كيف تغيرت المبيعات؟',
  requiredFields: ['documentDate', 'netAmount'],
  minimumSample: 6,
  priority: 90,
  availableFields: ['documentDate', 'netAmount'],
  sampleSize: 3,
  answer: { trend: 'up' },
});
check(insufficient.state === 'INSUFFICIENT_SAMPLE' && insufficient.answer === null, 'small sample must not return answer');

const blocked = evaluateBusinessQuestion({
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
check(blocked.state === 'BLOCKED' && blocked.answer === null, 'blocked questions must fail closed');

const sorted = sortBusinessQuestions([answered, unavailable]);
check(sorted[0].id === 'sales.what', 'higher priority business question should come first');
console.log('business-question-engine: PASS');
