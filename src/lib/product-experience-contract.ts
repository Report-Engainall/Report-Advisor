export const DECISION_LIFECYCLE = [
  'PROPOSED',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'OUTCOME',
] as const;

export type DecisionLifecycle = (typeof DECISION_LIFECYCLE)[number];

export const PRODUCT_TRUTH_STATES = [
  'AVAILABLE',
  'NOT_AVAILABLE',
  'NOT_YET_EXECUTED',
  'RUNTIME_BLOCKED',
] as const;

export type ProductTruthState = (typeof PRODUCT_TRUTH_STATES)[number];

export type OutcomeTruth = {
  expected: ProductTruthState;
  actual: ProductTruthState;
  delta: ProductTruthState;
  quality: ProductTruthState;
  feedback: ProductTruthState;
  learning: ProductTruthState;
};

export const OUTCOME_EMPTY_STATE: OutcomeTruth = {
  expected: 'AVAILABLE',
  actual: 'NOT_YET_EXECUTED',
  delta: 'NOT_YET_EXECUTED',
  quality: 'NOT_YET_EXECUTED',
  feedback: 'NOT_YET_EXECUTED',
  learning: 'RUNTIME_BLOCKED',
};

export const EXECUTIVE_REPORT_STORY = [
  'WHAT_HAPPENED',
  'WHY',
  'EVIDENCE',
  'RECOMMENDATION',
  'DECISION',
  'OWNER',
  'EXPECTED_IMPACT',
  'ACTUAL_OUTCOME',
  'LEARNING',
] as const;

export type ExecutiveReportStory = (typeof EXECUTIVE_REPORT_STORY)[number];

export const ALERT_CONTEXT = {
  critical_insight: '/decision-experience',
  approval_required: '/decision-experience',
  decision_approved: '/decision-experience',
  decision_rejected: '/decision-experience',
  task_assigned: '/decision-experience',
  task_due: '/decision-experience',
  task_completed: '/decision-experience',
  outcome_available: '/decision-experience',
  learning_signal_available: '/decision-experience',
} as const;

export function canTransitionDecision(from: DecisionLifecycle, to: DecisionLifecycle): boolean {
  const transitions: Record<DecisionLifecycle, readonly DecisionLifecycle[]> = {
    PROPOSED: ['PENDING_APPROVAL'],
    PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
    APPROVED: ['OPEN'],
    REJECTED: [],
    OPEN: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: ['OUTCOME'],
    OUTCOME: [],
  };
  return transitions[from].includes(to);
}

export function getOutcomeMessage(actual: ProductTruthState, learning: ProductTruthState): string {
  if (actual === 'NOT_YET_EXECUTED') return 'Awaiting actual outcome';
  if (learning === 'RUNTIME_BLOCKED') return 'Actual outcome is available; runtime learning is not yet verified.';
  if (actual === 'NOT_AVAILABLE') return 'Actual impact is not available from the canonical source.';
  return 'Outcome evidence is available for review.';
}
