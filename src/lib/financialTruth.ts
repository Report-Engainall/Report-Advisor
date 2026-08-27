export type FinancialTruthStatus = 'READY' | 'INSUFFICIENT_DATA';

export interface FinancialTruthInput {
  revenue: number | null | undefined;
  costOfSales: number | null | undefined;
  quantityBasisComplete?: boolean;
  currencyConsistent?: boolean;
}

export interface FinancialTruth {
  status: FinancialTruthStatus;
  revenue: number | null;
  costOfSales: number | null;
  grossProfit: number | null;
  marginPct: number | null;
  reasons: string[];
}

function finiteNonNegative(value: number | null | undefined): number | null {
  return value != null && Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Financial truth is fail-closed: missing or invalid evidence is never treated
 * as a financial zero. A zero is valid only when zero is actually supplied.
 */
export function buildFinancialTruth(input: FinancialTruthInput): FinancialTruth {
  const revenue = finiteNonNegative(input.revenue);
  const costOfSales = finiteNonNegative(input.costOfSales);
  const reasons: string[] = [];

  if (revenue == null) reasons.push('REVENUE_UNAVAILABLE');
  if (costOfSales == null) reasons.push('COST_OF_SALES_UNAVAILABLE');
  if (input.quantityBasisComplete === false) reasons.push('QUANTITY_BASIS_INCOMPLETE');
  if (input.currencyConsistent === false) reasons.push('CURRENCY_INCONSISTENT');

  if (reasons.length > 0) {
    return {
      status: 'INSUFFICIENT_DATA',
      revenue,
      costOfSales,
      grossProfit: null,
      marginPct: null,
      reasons,
    };
  }

  const grossProfit = revenue! - costOfSales!;
  const marginPct = revenue! === 0 ? null : (grossProfit / revenue!) * 100;

  return {
    status: 'READY',
    revenue,
    costOfSales,
    grossProfit,
    marginPct,
    reasons: [],
  };
}
