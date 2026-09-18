export type DecisionRoiState = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'AWAITING_OUTCOME' | 'INSUFFICIENT_DATA';

export interface DecisionRoiInput {
  expected: number | null;
  actual: number | null;
  expectedAvailable?: boolean;
  actualAvailable?: boolean;
}

export interface DecisionRoiResult {
  expected: number | null;
  actual: number | null;
  delta: number | null;
  state: DecisionRoiState;
  deltaPercent: number | null;
}

export function evaluateDecisionRoi(input: DecisionRoiInput): DecisionRoiResult {
  const expectedAvailable = input.expectedAvailable ?? Number.isFinite(input.expected);
  const actualAvailable = input.actualAvailable ?? Number.isFinite(input.actual);

  if (!expectedAvailable && !actualAvailable) {
    return { expected: null, actual: null, delta: null, state: 'INSUFFICIENT_DATA', deltaPercent: null };
  }
  if (!actualAvailable) {
    return { expected: input.expected, actual: null, delta: null, state: 'AWAITING_OUTCOME', deltaPercent: null };
  }
  if (!Number.isFinite(input.actual)) {
    return { expected: input.expected, actual: null, delta: null, state: 'INSUFFICIENT_DATA', deltaPercent: null };
  }
  const expected = Number.isFinite(input.expected) ? Number(input.expected) : null;
  const actual = Number(input.actual);
  if (expected == null) {
    return { expected: null, actual, delta: null, state: 'INSUFFICIENT_DATA', deltaPercent: null };
  }
  const delta = actual - expected;
  const deltaPercent = expected === 0 ? null : (delta / Math.abs(expected)) * 100;
  return {
    expected,
    actual,
    delta,
    deltaPercent,
    state: delta > 0 ? 'POSITIVE' : delta < 0 ? 'NEGATIVE' : 'NEUTRAL',
  };
}

export const DECISION_ROI_LABELS: Record<DecisionRoiState, string> = {
  POSITIVE: 'أثر فعلي أعلى من المتوقع',
  NEUTRAL: 'الأثر الفعلي مطابق تقريبًا للتوقع',
  NEGATIVE: 'الأثر الفعلي أقل من المتوقع',
  AWAITING_OUTCOME: 'النتيجة الفعلية لم تُثبت بعد',
  INSUFFICIENT_DATA: 'بيانات الأثر غير كافية للحساب',
};
