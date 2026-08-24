export type ScenarioVariable = { key: string; base: number; min: number; max: number; step: number };
export type ScenarioResult = { values: Record<string, number>; score: number; risk: 'low' | 'medium' | 'high'; rationale: string[] };

export type ScenarioInput = {
  demand: number;
  sellableStock: number;
  dailyVelocity: number;
  unitMargin: number;
  cashAvailable: number;
  protectedCash: number;
  purchaseUnitCost: number;
  confidence: number;
};

export function simulateScenario(input: ScenarioInput, variables: Record<string, number>): ScenarioResult {
  const demandMultiplier = finitePositive(variables.demandMultiplier ?? 1);
  const supplyMultiplier = finitePositive(variables.supplyMultiplier ?? 1);
  const costMultiplier = finitePositive(variables.costMultiplier ?? 1);
  const reserve = Math.max(0, input.protectedCash);
  const effectiveCash = Math.max(0, input.cashAvailable - reserve);
  const projectedDemand = input.demand * demandMultiplier;
  const projectedStock = input.sellableStock * supplyMultiplier;
  const projectedVelocity = Math.max(0, input.dailyVelocity * demandMultiplier);
  const daysCover = projectedVelocity > 0 ? projectedStock / projectedVelocity : Infinity;
  const purchaseCost = Math.max(0, projectedDemand - projectedStock) * input.purchaseUnitCost * costMultiplier;
  const liquidityPressure = effectiveCash > 0 ? purchaseCost / effectiveCash : purchaseCost > 0 ? Infinity : 0;
  const margin = input.unitMargin * projectedDemand;
  const score = margin - purchaseCost;
  const risk: ScenarioResult['risk'] = liquidityPressure > 0.8 || daysCover < 3 || input.confidence < 0.5 ? 'high' : liquidityPressure > 0.5 || daysCover < 7 || input.confidence < 0.7 ? 'medium' : 'low';
  const rationale: string[] = [];
  if (daysCover < 3) rationale.push('LOW_STOCK_COVER');
  if (liquidityPressure > 0.8) rationale.push('HIGH_LIQUIDITY_PRESSURE');
  if (input.confidence < 0.5) rationale.push('LOW_FORECAST_CONFIDENCE');
  if (purchaseCost > effectiveCash) rationale.push('PURCHASE_EXCEEDS_AVAILABLE_OPERATING_CASH');
  return { values: { demand: projectedDemand, stock: projectedStock, velocity: projectedVelocity, daysCover, purchaseCost, margin, liquidityPressure }, score, risk, rationale };
}

export function sensitivity(base: ScenarioInput, variable: ScenarioVariable): ScenarioResult[] {
  if (!Number.isFinite(variable.step) || variable.step <= 0 || variable.min > variable.max) throw new Error('INVALID_SCENARIO_RANGE');
  const results: ScenarioResult[] = [];
  for (let value = variable.min; value <= variable.max + variable.step / 1000; value += variable.step) {
    results.push(simulateScenario(base, { [variable.key]: Number(value.toFixed(8)) }));
  }
  return results;
}

function finitePositive(value: number): number { return Number.isFinite(value) && value > 0 ? value : 1; }
