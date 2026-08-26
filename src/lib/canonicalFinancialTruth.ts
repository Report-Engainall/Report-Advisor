export type FinancialTruthStatus = 'CALCULABLE' | 'INSUFFICIENT_DATA' | 'UNKNOWN' | 'EXCLUDED';

export interface GrossProfitInput {
  line_total: number | null | undefined;
  cost_price: number | null | undefined;
  quantity: number | null | undefined;
}

export interface GrossProfitResult {
  status: FinancialTruthStatus;
  revenue: number | null;
  costOfSales: number | null;
  grossProfit: number | null;
}

function finite(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && Number.isFinite(value);
}

/**
 * Canonical financial truth for gross profit.
 *
 * Revenue is the sum of sale_items.line_total for the same invoice scope.
 * Cost of sales is quantity * cost_price for those same sale items.
 * Missing financial inputs are never coerced to zero.
 */
export function calculateGrossProfit(rows: GrossProfitInput[]): GrossProfitResult {
  if (rows.length === 0) {
    return { status: 'INSUFFICIENT_DATA', revenue: null, costOfSales: null, grossProfit: null };
  }

  let revenue = 0;
  let costOfSales = 0;

  for (const row of rows) {
    if (!finite(row.line_total) || !finite(row.cost_price) || !finite(row.quantity)) {
      return { status: 'INSUFFICIENT_DATA', revenue: null, costOfSales: null, grossProfit: null };
    }
    revenue += row.line_total;
    costOfSales += row.cost_price * row.quantity;
  }

  return {
    status: 'CALCULABLE',
    revenue,
    costOfSales,
    grossProfit: revenue - costOfSales,
  };
}

export function assertGrossProfitInvariant(result: GrossProfitResult): void {
  if (result.status !== 'CALCULABLE') {
    if (result.revenue !== null || result.costOfSales !== null || result.grossProfit !== null) {
      throw new Error('FINANCIAL_TRUTH_STATUS_VALUE_MISMATCH');
    }
    return;
  }
  if (result.revenue === null || result.costOfSales === null || result.grossProfit === null) {
    throw new Error('FINANCIAL_TRUTH_CALCULABLE_VALUE_MISSING');
  }
  if (result.grossProfit !== result.revenue - result.costOfSales) {
    throw new Error('FINANCIAL_TRUTH_GROSS_PROFIT_FORMULA_MISMATCH');
  }
}
