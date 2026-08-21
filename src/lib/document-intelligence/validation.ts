export type Criticality = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OPTIONAL';
export type ValidationStatus = 'PASS' | 'WARN' | 'FAIL' | 'UNKNOWN';

export type ValidationIssue = {
  code: string;
  status: ValidationStatus;
  message: string;
  field?: string;
  criticality?: Criticality;
  evidence?: Record<string, unknown>;
};

export type ReconciliationResult = {
  passed: boolean;
  difference: number;
  tolerance: number;
  issues: ValidationIssue[];
};

export type ConfidenceInput = {
  header: number;
  content: number;
  pattern: number;
  relationship: number;
  math: number;
  context: number;
};

export function combineEvidence(input: ConfidenceInput): number {
  const weights = { header: 0.12, content: 0.22, pattern: 0.14, relationship: 0.22, math: 0.20, context: 0.10 } as const;
  return Math.max(0, Math.min(1,
    input.header * weights.header +
    input.content * weights.content +
    input.pattern * weights.pattern +
    input.relationship * weights.relationship +
    input.math * weights.math +
    input.context * weights.context
  ));
}

export function reconcileNumbers(actual: number, expected: number, absoluteTolerance = 0.01, relativeTolerance = 0.0001): ReconciliationResult {
  const difference = actual - expected;
  const tolerance = Math.max(absoluteTolerance, Math.abs(expected) * relativeTolerance);
  const passed = Math.abs(difference) <= tolerance;
  return {
    passed,
    difference,
    tolerance,
    issues: passed ? [] : [{
      code: 'RECONCILIATION_MISMATCH',
      status: 'FAIL',
      message: 'Actual and expected values exceed the configured tolerance.',
      evidence: { actual, expected, difference, tolerance }
    }]
  };
}

export function validateLineMath(row: Record<string, unknown>): ValidationIssue[] {
  const q = Number(row.quantity);
  const p = Number(row.unit_price);
  const subtotal = Number(row.subtotal ?? row.net_amount);
  if (![q, p, subtotal].every(Number.isFinite)) return [];
  const result = reconcileNumbers(q * p, subtotal, 0.02, 0.0005);
  return result.passed ? [] : result.issues.map(i => ({ ...i, code: 'LINE_MATH_MISMATCH', field: 'subtotal', criticality: 'HIGH' as const }));
}

export function validateInvoiceTotals(row: Record<string, unknown>): ValidationIssue[] {
  const subtotal = Number(row.subtotal);
  const tax = Number(row.tax ?? 0);
  const discount = Number(row.discount ?? 0);
  const shipping = Number(row.shipping ?? 0);
  const total = Number(row.total_amount ?? row.total);
  if (![subtotal, tax, discount, shipping, total].every(Number.isFinite)) return [];
  const expected = subtotal + tax - discount + shipping;
  const result = reconcileNumbers(total, expected, 0.02, 0.0005);
  return result.passed ? [] : result.issues.map(i => ({ ...i, code: 'INVOICE_TOTAL_MISMATCH', field: 'total_amount', criticality: 'CRITICAL' as const }));
}

export function classifyConfidence(score: number, criticality: Criticality): 'AUTO_APPROVE' | 'REVIEW' | 'QUARANTINE' {
  const criticalFloor = criticality === 'CRITICAL' ? 0.95 : criticality === 'HIGH' ? 0.90 : 0.80;
  if (score >= criticalFloor) return 'AUTO_APPROVE';
  if (score >= 0.80) return 'REVIEW';
  return 'QUARANTINE';
}
