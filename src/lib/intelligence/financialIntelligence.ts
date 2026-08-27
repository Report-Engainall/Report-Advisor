import { cashConversionCycle, projectLiquidity, type CashConversionCycle, type LiquidityProjection } from '../businessIntelligenceEngines';
import { prioritizeReceivables, prioritizeSupplierPayments, protectCashReserve, type PaymentPriority, type ReceivablePriority, type ReserveProtection } from '../financialDecisionEngines';
import { buildFinancialTruth } from '../financialTruth';

export interface FinancialIntelligenceInput { revenue:number|null; receivables:number; inventory:number; costOfSales:number|null; payables:number; purchases:number; openingCash:number; dailyInflow:number; dailyOutflow:number; committedOutflow?:number; receivablesItems?:Parameters<typeof prioritizeReceivables>[0]; supplierItems?:Parameters<typeof prioritizeSupplierPayments>[0]; periodDays?:number; }
export interface FinancialIntelligence { ccc:CashConversionCycle; liquidity:LiquidityProjection[]; reserve:ReserveProtection; collections:ReceivablePriority[]; supplierPayments:PaymentPriority[]; profitability:{revenue:number|null;costOfSales:number|null;grossProfit:number|null;marginPct:number|null;status:'READY'|'PROFIT_UNAVAILABLE'}; warnings:string[]; }

export function buildFinancialIntelligence(input:FinancialIntelligenceInput):FinancialIntelligence {
  const financialTruth=buildFinancialTruth({revenue:input.revenue,costOfSales:input.costOfSales});
  const revenue=financialTruth.revenue ?? 0;
  const cost=financialTruth.costOfSales;
  const ccc=cashConversionCycle({receivables:Math.max(0,input.receivables),revenue,inventory:Math.max(0,input.inventory),costOfSales:cost,payables:Math.max(0,input.payables),purchases:Math.max(0,input.purchases),periodDays:input.periodDays??365});
  const liquidity=projectLiquidity({openingLiquidity:Math.max(0,input.openingCash),horizons:[0,7,15,30,60,90],dailyInflow:Math.max(0,input.dailyInflow),dailyOutflow:Math.max(0,input.dailyOutflow),committedOutflow:Math.max(0,input.committedOutflow??0)});
  const reserve=protectCashReserve({openingCash:Math.max(0,input.openingCash),committedOutflow:Math.max(0,input.committedOutflow??0),collectibleInflow:Math.max(0,input.dailyInflow)*30});
  const collections=prioritizeReceivables(input.receivablesItems??[]);
  const supplierPayments=prioritizeSupplierPayments(input.supplierItems??[],reserve);
  const warnings:string[]=[];
  if(financialTruth.status==='INSUFFICIENT_DATA')warnings.push(`PROFIT_UNAVAILABLE: ${financialTruth.reasons.join(', ')}; لم يتم استخدام أي بديل صفري.`);
  if(ccc.status!=='READY')warnings.push('CCC غير مكتمل بسبب نقص بيانات التكلفة/المبيعات/المشتريات.');
  if(liquidity.some(row=>row.status==='GAP'))warnings.push('يوجد عجز سيولة متوقع ضمن أحد الآفاق الزمنية.');
  if(reserve.blockedAmount>0)warnings.push('حماية الاحتياطي النقدي مفعلة؛ يجب عدم استنزاف النقد التشغيلي.');
  return{ccc,liquidity,reserve,collections,supplierPayments,profitability:{revenue:financialTruth.revenue,costOfSales:financialTruth.costOfSales,grossProfit:financialTruth.grossProfit,marginPct:financialTruth.marginPct,status:financialTruth.status==='READY'?'READY':'PROFIT_UNAVAILABLE'},warnings};
}