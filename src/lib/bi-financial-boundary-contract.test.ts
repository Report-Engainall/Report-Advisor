import { describe, expect, it } from 'vitest';
import { cashConversionCycle, projectLiquidity, scoreCustomer, scoreSupplier, whatIf } from './businessIntelligenceEngines';

describe('BI financial finite-result contract', () => {
  it('rejects CCC arithmetic overflow', () => {
    expect(() => cashConversionCycle({ receivables: Number.MAX_VALUE, revenue: Number.MIN_VALUE, inventory: 1, costOfSales: 1, payables: 1, purchases: 1 })).toThrow('BI_RESULT_OVERFLOW:ccc.dso');
  });
  it('rejects liquidity projection overflow', () => {
    expect(() => projectLiquidity({ openingLiquidity: 1, horizons: [Number.MAX_VALUE], dailyInflow: Number.MAX_VALUE, dailyOutflow: 0 })).toThrow('BI_RESULT_OVERFLOW:liquidity.expectedInflow');
  });
  it('rejects supplier delivery-risk overflow before clamping', () => {
    expect(() => scoreSupplier({ avgDeliveryDelayDays: Number.MAX_VALUE, priceVariationPct: 0, dependencyPct: 0 })).toThrow('BI_RESULT_OVERFLOW:supplier.deliveryRisk');
  });
  it('rejects supplier price-risk overflow before clamping', () => {
    expect(() => scoreSupplier({ avgDeliveryDelayDays: 0, priceVariationPct: Number.MAX_VALUE, dependencyPct: 0 })).toThrow('BI_RESULT_OVERFLOW:supplier.priceRisk');
  });
  it('rejects customer frequency overflow before clamping', () => {
    expect(() => scoreCustomer({ recencyDays: 1, orders: Number.MAX_VALUE, revenue: 100 })).toThrow('BI_RESULT_OVERFLOW:customer.frequency');
  });
  it('rejects what-if scenario overflow', () => {
    expect(() => whatIf({ baseline: Number.MAX_VALUE, changes: [{ label: 'growth', pct: 100 }] })).toThrow('BI_WHAT_IF_OVERFLOW');
  });
});
