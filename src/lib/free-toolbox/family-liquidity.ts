export interface FamilyLiquidityInput {
  familyId: string;
  salesUnits: number;
  salesRevenue: number;
  grossProfit?: number;
  stockValue?: number;
  inventoryDays?: number;
  cashCycleDays?: number;
}

export interface FamilyLiquiditySignal {
  familyId: string;
  revenue: number;
  grossProfit: number;
  stockValue: number;
  revenueShare: number;
  profitShare: number;
  capitalIntensity: number;
  liquidityRole: 'cash_generator' | 'capital_tied' | 'balanced' | 'insufficient_data';
  evidence: string[];
}

const n = (v: number | undefined) => Number.isFinite(v) ? Math.max(0, v as number) : 0;

export function analyzeFamilyLiquidity(rows: FamilyLiquidityInput[]): FamilyLiquiditySignal[] {
  const grouped = new Map<string, { revenue: number; profit: number; stock: number }>();
  for (const row of rows) {
    const current = grouped.get(row.familyId) ?? { revenue: 0, profit: 0, stock: 0 };
    current.revenue += n(row.salesRevenue);
    current.profit += n(row.grossProfit);
    current.stock += n(row.stockValue);
    grouped.set(row.familyId, current);
  }
  const totalRevenue = [...grouped.values()].reduce((a, x) => a + x.revenue, 0);
  const totalProfit = [...grouped.values()].reduce((a, x) => a + x.profit, 0);
  return [...grouped.entries()].map(([familyId, value]) => {
    const capitalIntensity = value.revenue > 0 ? value.stock / value.revenue : 0;
    let liquidityRole: FamilyLiquiditySignal['liquidityRole'] = 'insufficient_data';
    if (value.revenue > 0 || value.profit > 0 || value.stock > 0) {
      if (value.revenue > 0 && capitalIntensity <= 0.25) liquidityRole = 'cash_generator';
      else if (value.stock > 0 && capitalIntensity >= 0.75) liquidityRole = 'capital_tied';
      else liquidityRole = 'balanced';
    }
    const evidence = [`revenue=${value.revenue}`, `stock_value=${value.stock}`];
    if (value.profit > 0) evidence.push(`gross_profit=${value.profit}`);
    evidence.push(`stock_value/revenue=${capitalIntensity.toFixed(3)}`);
    return { familyId, revenue: value.revenue, grossProfit: value.profit, stockValue: value.stock, revenueShare: totalRevenue > 0 ? value.revenue / totalRevenue : 0, profitShare: totalProfit > 0 ? value.profit / totalProfit : 0, capitalIntensity, liquidityRole, evidence };
  });
}
