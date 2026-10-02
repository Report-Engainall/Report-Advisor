import { buildOutcomeLearningBinding } from './outcome-learning-binding.ts';

const check = (condition, message) => { if (!condition) throw new Error(message); };

const insufficient = buildOutcomeLearningBinding({
  outcomeId: 'outcome-1',
  recommendationId: 'rec-1',
  archetypeId: 'sales.transaction-detail',
  profileVersion: 2,
  ruleId: 'sales.signal.v2',
  sourceHash: 'sha256:test',
  reportExecutionJobId: 'job-1',
  evidenceSnapshotId: 'snapshot-1',
  expectedOutcome: 'انخفاض الأخطاء',
});
check(insufficient.outcomeState === 'INSUFFICIENT', 'expected-only outcome must be insufficient');
check(insufficient.profileVersion === 2, 'profile version must be retained');

const observed = buildOutcomeLearningBinding({
  outcomeId: 'outcome-2',
  recommendationId: 'rec-2',
  archetypeId: 'inventory.balance',
  profileVersion: 1,
  ruleId: 'inventory.coverage.v1',
  sourceHash: 'sha256:test2',
  reportExecutionJobId: 'job-2',
  actualOutcome: 'انخفض المخزون الراكد بنسبة مثبتة',
});
check(observed.outcomeState === 'OBSERVED', 'actual outcome must become observed');

const generic = buildOutcomeLearningBinding({
  outcomeId: 'outcome-3',
  recommendationId: 'rec-3',
  archetypeId: null,
  profileVersion: null,
  ruleId: null,
  sourceHash: 'sha256:test3',
  reportExecutionJobId: 'job-3',
});
check(generic.archetypeId === 'generic.report', 'unknown archetype must remain explicit');
check(generic.outcomeState === 'NOT_AVAILABLE', 'missing outcome must remain unavailable');
console.log('outcome-learning-binding: PASS');
