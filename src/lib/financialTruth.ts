export type FinancialDataState = 'CALCULABLE' | 'INSUFFICIENT_DATA' | 'UNKNOWN' | 'EXCLUDED';

export interface FinancialInput<T = number> {
  value: T | null | undefined;
  available: boolean;
}

export interface FinancialAssessment {
  state: FinancialDataState;
  reason: string;
}

/**
 * Financial truth boundary: absence is never converted to zero.
 * This module deliberately does not decide whether a business status is
 * included/excluded; that decision belongs to an explicit domain contract.
 */
export function assessRequiredFinancialValue(input: FinancialInput, field: string): FinancialAssessment {
  if (!input.available || input.value == null) {
    return { state: 'INSUFFICIENT_DATA', reason: `${field} is missing or unavailable` };
  }
  return { state: 'CALCULABLE', reason: `${field} is present` };
}

export function classifyFinancialStatus(status: string | null | undefined, explicitlyIncluded: readonly string[], explicitlyExcluded: readonly string[]): FinancialDataState {
  if (!status) return 'UNKNOWN';
  if (explicitlyExcluded.includes(status)) return 'EXCLUDED';
  if (explicitlyIncluded.includes(status)) return 'CALCULABLE';
  return 'UNKNOWN';
}

export function safeFinancialDifference(revenue: number | null | undefined, cost: number | null | undefined): number | null {
  if (revenue == null || cost == null || !Number.isFinite(revenue) || !Number.isFinite(cost)) return null;
  return revenue - cost;
}
