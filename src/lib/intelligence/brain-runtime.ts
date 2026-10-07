import { parseDate, parseNumber } from '../file-engine/normalizer.ts';

export type BrainMetricStatus = 'CALCULATED' | 'INSUFFICIENT_DATA' | 'UNAVAILABLE';
export type BrainSignalSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type BrainEvidence = {
  sourceHash?: string | null;
  fields: string[];
  rows: number[];
  sampleSize: number;
  note: string;
};

export type BrainMetric = {
  id: string;
  label: string;
  value: number | null;
  unit: 'currency' | 'number' | 'percent' | 'days' | 'ratio';
  status: BrainMetricStatus;
  requiredFields: string[];
  availableFields: string[];
  formula: string;
  evidence: BrainEvidence;
  direction?: 'higher-is-better' | 'lower-is-better' | 'contextual';
};

export type BrainSignal = {
  id: string;
  severity: BrainSignalSeverity;
  title: string;
  statement: string;
  metricId: string;
  value: number;
  threshold: number;
  evidence: BrainEvidence;
  why: string;
  soWhat: string;
  next: string;
};

export type BrainBenchmark = {
  state: 'INTERNAL_COMPARABLE' | 'INSUFFICIENT_SAMPLE' | 'UNAVAILABLE';
  metricId: string | null;
  dimension: string | null;
  entityCount: number;
  median: number | null;
  topQuartile: number | null;
  current: number | null;
  gapToMedian: number | null;
  gapToTopQuartile: number | null;
  boundary: string;
};

export type BrainOutcomeState = {
  state: 'OBSERVED' | 'PARTIAL' | 'PENDING' | 'INSUFFICIENT_DATA';
  observations: number;
  accuracy: number | null;
  actualValue: number | null;
  expectedValue: number | null;
  learning: 'CANDIDATE' | 'REVIEW_REQUIRED' | 'NOT_READY';
  boundary: string;
};

export type BrainWorkProposal = {
  state: 'PROPOSED' | 'BLOCKED' | 'NOT_AVAILABLE';
  title: string | null;
  ownerHint: string | null;
  expectedOutcome: string | null;
  measurement: string | null;
  evidenceRequired: string[];
};

export type BrainPacket = {
  version: 'brain.v1';
  status: 'ACTIONABLE' | 'REVIEW_REQUIRED' | 'INSUFFICIENT_DATA';
  metrics: BrainMetric[];
  signals: BrainSignal[];
  benchmark: BrainBenchmark;
  outcome: BrainOutcomeState;
  work: BrainWorkProposal;
  decision: {
    readiness: number;
    blockers: string[];
    recommendationEligible: boolean;
  };
  provenance: {
    sourceHash: string | null;
    reportJobId: string | null;
    archetypeId: string | null;
    evidenceSnapshotId: string | null;
    evidencePassportId: string | null;
    evidenceVerified: boolean;
  };
};

type Row = Record<string, unknown>;

export type BrainInput = {
  rows: Row[];
  sourceHash?: string | null;
  reportJobId?: string | null;
  archetypeId?: string | null;
  availableFields?: string[];
  evidenceVerified?: boolean;
  evidenceSnapshotId?: string | null;
  evidencePassportId?: string | null;
  recommendation?: {
    title?: string;
    action?: string;
    ownerHint?: string;
    expectedOutcome?: string;
    measurement?: string;
    evidence?: string[];
  } | null;
  decisionOutcomes?: Array<{
    label: 'correct' | 'incorrect' | 'partial' | 'unknown';
    actualValue?: number | null;
    expectedValue?: number | null;
  }>;
};

type FieldKey = string;
type MetricDef = {
  id: string;
  label: string;
  unit: BrainMetric['unit'];
  required: string[];
  formula: string;
  direction: BrainMetric['direction'];
  calculate: (ctx: Ctx) => Calc;
};

type Calc = { value: number | null; rows: number[]; note: string };

type Ctx = {
  rows: Row[];
  keys: Map<string, string>;
  field(name: string): string | null;
  value(row: Row, field: string): unknown;
  values(field: string): Array<{ value: number; index: number }>;
};

const n = (value: unknown): number | null => {
  const parsed = parseNumber(value);
  return parsed != null && Number.isFinite(parsed) ? parsed : null;
};

const text = (value: unknown): string => String(value ?? '').trim();

function norm(value: unknown): string {
  return text(value).toLowerCase().normalize('NFKC')
    .replace(/[إأآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ًٌٍَُِّْ]/g, '')
    .replace(/[\s_\-./]+/g, '');
}

const aliases: Record<string, string[]> = {
  netAmount: ['netAmount','net_amount','net_sales','sales_amount','purchase_amount','الصافي','صافيالقيمة','صافيالمبيعات','مبلغصافالمحلي'],
  grossAmount: ['grossAmount','gross_amount','total','اجمالي','الإجمالي','الاجمالي'],
  profit: ['profit','grossProfit','الربح','مجملالربح','الربحالإجمالي'],
  cost: ['cost','cost_price','التكلفه','التكلفة','متوسطالتكلفة'],
  discount: ['discount','الخصم','قيمةالخصم'],
  quantity: ['quantity','qty','الكمية','العدد'],
  returnQty: ['returnQty','return_qty','returnedQty','المرتجعات','كميةالمرتجع'],
  customerCode: ['customerCode','customer_code','customerId','رقمالعميل','كودالعميل'],
  supplierCode: ['supplierCode','supplier_code','supplierId','رقمالمورد','كودالمورد'],
  productCode: ['productCode','product_code','sku','itemCode','رقمالصنف','كودالصنف'],
  documentNo: ['documentNo','document_no','invoiceNo','invoice_number','رقمالفاتوره','رقمالفاتورة'],
  documentDate: ['documentDate','document_date','date','invoiceDate','التاريخ','تاريخالفاتورة'],
  targetAmount: ['targetAmount','target_amount','target','المستهدف','الهدف'],
  paidAmount: ['paidAmount','paid_amount','paid','المدفوع','المبلغالمدفوع'],
  balance: ['balance','outstanding','outstanding_balance','الرصيدالمستحق','المتبقي','الرصيد'],
  dueDate: ['dueDate','due_date','تاريخالاستحقاق','الاستحقاق'],
  leadTimeDays: ['leadTimeDays','lead_time_days','leadTime','مدهالتوريد','مدةالتوريد'],
  currentStock: ['currentStock','current_stock','stock','onHand','on_hand','الرصيدالحالي','المخزونالحالي','الكميةالمتوفرة','الكميةالمتاحه'],
  dailySalesRate: ['dailySalesRate','daily_sales_rate','dailyRate','معدل البيع اليومي','متوسطالبيعاليومي'],
  stockAgeDays: ['stockAgeDays','stock_age_days','stockAge','عمرالمخزون'],
  openingStock: ['openingStock','opening_stock','openingBalance','الرصيدالافتتاحي','المخزونالافتتاحي'],
  inbound: ['inbound','incoming','الوارد','كميةالوارد'],
  outbound: ['outbound','الصادر','كميةالصادر'],
  requestedQty: ['requestedQty','requested_qty','الكميةالمطلوبه'],
  fulfilledQty: ['fulfilledQty','fulfilled_qty','الكميةالمنفذه','المحققه'],
  orderedQty: ['orderedQty','ordered_qty','كميةالطلب','الكميةالمطلوبه_للشراء'],
  receivedQty: ['receivedQty','received_qty','الكميةالمستلمه'],
  inflow: ['inflow','cashInflow','التدفقاتالواردة','المتحصلات'],
  outflow: ['outflow','cashOutflow','التدفقاتالخارجه','المدفوعات'],
};

function makeCtx(rows: Row[], availableFields?: string[]): Ctx {
  const keys = new Map<string, string>();
  const declared = new Set((availableFields ?? []).map(norm));
  for (const field of Object.keys(aliases)) {
    const candidates = aliases[field] ?? [field];
    const match = [...declared].length
      ? candidates.find(candidate => declared.has(norm(candidate))) ?? Object.keys(rows[0] ?? {}).find(k => candidates.some(c => norm(c) === norm(k)))
      : Object.keys(rows[0] ?? {}).find(k => candidates.some(c => norm(c) === norm(k)));
    if (match) keys.set(field, match);
  }
  for (const field of Object.keys(aliases)) {
    if (keys.has(field)) continue;
    const match = rows.flatMap(row => Object.keys(row)).find(k => aliases[field].some(alias => norm(alias) === norm(k)));
    if (match) keys.set(field, match);
  }
  const field = (name: string) => keys.get(name) ?? null;
  const value = (row: Row, name: string) => {
    const key = field(name);
    if (!key) return undefined;
    return row[key];
  };
  const values = (name: string) => {
    const out: Array<{value:number; index:number}> = [];
    rows.forEach((row,index) => {
      const valueNum = n(value(row,name));
      if (valueNum != null) out.push({ value: valueNum, index });
    });
    return out;
  };
  return { rows, keys, field, value, values };
}

function calcSum(ctx: Ctx, field: string): Calc {
  const values = ctx.values(field);
  return values.length ? { value: values.reduce((sum,item) => sum + item.value, 0), rows: values.map(item => item.index), note: 'sum of non-null source rows' } : { value: null, rows: [], note: 'required field unavailable or non-numeric' };
}

function calcRatio(ctx: Ctx, numerator: string, denominator: string, percent = false): Calc {
  const numVals = ctx.values(numerator);
  const denVals = ctx.values(denominator);
  if (!numVals.length || !denVals.length) return { value:null, rows:[], note:'both operands require numeric source values' };
  const rowCount = Math.min(numVals.length, denVals.length);
  const sumNum = numVals.slice(0,rowCount).reduce((s,x)=>s+x.value,0);
  const sumDen = denVals.slice(0,rowCount).reduce((s,x)=>s+x.value,0);
  if (sumDen === 0) return { value:null, rows:numVals.slice(0,rowCount).map(x=>x.index), note:'denominator is zero' };
  return { value: (sumNum / Math.abs(sumDen)) * (percent ? 100 : 1), rows: numVals.slice(0,rowCount).map(x=>x.index), note: 'ratio of source aggregates' };
}

function calcConcentration(ctx: Ctx, dimension: string, measure: string): Calc {
  const dimensionKey = ctx.field(dimension);
  const measureKey = ctx.field(measure);
  if (!dimensionKey || !measureKey) return { value:null, rows:[], note:'dimension or measure unavailable' };
  const groups = new Map<string,{value:number; rows:number[]}>();
  ctx.rows.forEach((row,index)=>{
    const name=text(row[dimensionKey]);
    const value=n(row[measureKey]);
    if(!name || value==null) return;
    const item=groups.get(name) ?? {value:0,rows:[]};
    item.value += Math.abs(value); item.rows.push(index); groups.set(name,item);
  });
  if(groups.size<2) return {value:null,rows:[],note:'at least two entities required'};
  const ordered=[...groups.values()].sort((a,b)=>b.value-a.value);
  const total=ordered.reduce((s,x)=>s+x.value,0);
  if(!total) return {value:null,rows:[],note:'measure aggregate is zero'};
  const top=ordered[0];
  return {value:(top.value/total)*100,rows:top.rows,note:`top-entity share across ${groups.size} entities`};
}

function calcGrowth(ctx: Ctx, measure: string, dateField: string): Calc {
  const dateKey=ctx.field(dateField); const measureKey=ctx.field(measure);
  if(!dateKey || !measureKey) return {value:null,rows:[],note:'date or measure unavailable'};
  const points: Array<{time:number;value:number;index:number}>=ctx.rows.flatMap((row,index)=>{
    const value=n(row[measureKey]); const date=parseDate(row[dateKey]);
    if(value==null || !date || !Number.isFinite(date.getTime())) return [];
    return [{time:date.getTime(),value,index}];
  });
  if(points.length<2) return {value:null,rows:[],note:'at least two dated observations required'};
  const sorted=points.sort((a,b)=>a.time-b.time);
  const first=sorted[0]; const last=sorted[sorted.length-1];
  if(first.value===0) return {value:null,rows:[first.index,last.index],note:'previous value is zero'};
  return {value:((last.value-first.value)/Math.abs(first.value))*100,rows:[first.index,last.index],note:'latest dated observation vs earliest dated observation'};
}

function calcAverage(ctx: Ctx, field: string): Calc {
  const values=ctx.values(field);
  return values.length ? {value:values.reduce((s,x)=>s+x.value,0)/values.length,rows:values.map(x=>x.index),note:'mean of source values'} : {value:null,rows:[],note:'required field unavailable'};
}

function calcZeroShare(ctx: Ctx, field: string): Calc {
  const values=ctx.values(field); if(!values.length) return {value:null,rows:[],note:'required field unavailable'};
  const bad=values.filter(x=>x.value<=0); return {value:(bad.length/values.length)*100,rows:bad.map(x=>x.index),note:'share of rows with zero or negative balance'};
}

function calcDays(ctx: Ctx, stock: string, daily: string): Calc {
  if (!ctx.field(stock) || !ctx.field(daily)) return {value:null,rows:[],note:'stock and daily demand are required'};
  const rows:number[]=[]; const values:number[]=[];
  ctx.rows.forEach((row,index)=>{
    const stockValue=n(ctx.value(row,stock));
    const dailyValue=n(ctx.value(row,daily));
    if(stockValue != null && dailyValue != null && dailyValue > 0){ values.push(stockValue/dailyValue); rows.push(index); }
  });
  return values.length ? {value:values.reduce((s,x)=>s+x,0)/values.length,rows,note:'row-aligned mean stock coverage in days using source daily demand'} : {value:null,rows:[],note:'no row has positive daily demand with numeric stock'};
}

function calcDeadShare(ctx: Ctx, age: string, demand: string): Calc {
  if (!ctx.field(age) || !ctx.field(demand)) return {value:null,rows:[],note:'age and demand are required'};
  let comparable=0; const bad:number[]=[];
  ctx.rows.forEach((row,index)=>{
    const ageValue=n(ctx.value(row,age));
    const demandValue=n(ctx.value(row,demand));
    if(ageValue == null || demandValue == null) return;
    comparable += 1;
    if(ageValue >= 180 && demandValue <= 1) bad.push(index);
  });
  return comparable ? {value:(bad.length/comparable)*100,rows:bad,note:'row-aligned share aged >=180 days with demand <=1'} : {value:null,rows:[],note:'no row has numeric age and demand'};
}

function calcReconciliation(ctx: Ctx): Calc {
  const opening=ctx.field('openingStock') ? ctx.values('openingStock') : ctx.values('currentStock');
  const inbound=ctx.values('inbound'); const outbound=ctx.values('outbound'); const closing=ctx.values('currentStock');
  if(!inbound.length || !closing.length) return {value:null,rows:[],note:'opening/inbound/current stock required'};
  const count=Math.min(opening.length,inbound.length,outbound.length,closing.length); const mismatches:number[]=[];
  for(let i=0;i<count;i++){const expected=opening[i].value+inbound[i].value-outbound[i].value;if(Math.abs(expected-closing[i].value)>0.01)mismatches.push(closing[i].index);}
  return {value:count ? (mismatches.length/count)*100 : null,rows:mismatches,note:'share of rows failing opening + inbound - outbound = closing'};
}

const metricDefs: MetricDef[] = [
  {id:'sales.total',label:'إجمالي قيمة النشاط',unit:'currency',required:['netAmount'],formula:'SUM(netAmount)',direction:'contextual',calculate:ctx=>calcSum(ctx,'netAmount')},
  {id:'sales.growth',label:'نمو القيمة عبر الزمن',unit:'percent',required:['netAmount','documentDate'],formula:'(latest - earliest) / |earliest| × 100',direction:'higher-is-better',calculate:ctx=>calcGrowth(ctx,'netAmount','documentDate')},
  {id:'sales.average-document',label:'متوسط قيمة المستند',unit:'currency',required:['documentNo','netAmount'],formula:'SUM(netAmount) / COUNT(DISTINCT documentNo)',direction:'contextual',calculate:ctx=>{
    const total=calcSum(ctx,'netAmount'); const docs=ctx.rows.map(row=>text(row[ctx.field('documentNo')||''])).filter(Boolean);
    const unique=new Set(docs); return total.value!=null && unique.size ? {value:total.value/unique.size,rows:total.rows,note:'aggregate value divided by distinct source document numbers'}:{value:null,rows:[],note:'document numbers required'};
  }},
  {id:'sales.customer-concentration',label:'تركيز أكبر عميل',unit:'percent',required:['customerCode','netAmount'],formula:'MAX(customer value) / total customer value × 100',direction:'lower-is-better',calculate:ctx=>calcConcentration(ctx,'customerCode','netAmount')},
  {id:'sales.return-rate',label:'معدل المرتجعات',unit:'percent',required:['returnQty','quantity'],formula:'SUM(returnQty) / |SUM(quantity)| × 100',direction:'lower-is-better',calculate:ctx=>calcRatio(ctx,'returnQty','quantity',true)},
  {id:'sales.discount-rate',label:'معدل الخصم',unit:'percent',required:['discount','grossAmount'],formula:'SUM(discount) / |SUM(grossAmount)| × 100',direction:'lower-is-better',calculate:ctx=>calcRatio(ctx,'discount','grossAmount',true)},
  {id:'sales.target-gap',label:'فجوة المستهدف',unit:'percent',required:['targetAmount','netAmount'],formula:'(actual - target) / |target| × 100',direction:'higher-is-better',calculate:ctx=>{
    const target=ctx.values('targetAmount'), actual=ctx.values('netAmount'); if(!target.length||!actual.length)return{value:null,rows:[],note:'target and actual required'};
    const sumT=target.reduce((s,p)=>s+p.value,0); const sumA=actual.reduce((s,p)=>s+p.value,0);
    return sumT ? {value:((sumA-sumT)/Math.abs(sumT))*100,rows:[...new Set([...target.map(p=>p.index),...actual.map(p=>p.index)])],note:'aggregate actual vs aggregate target; row alignment not assumed'} : {value:null,rows:[],note:'target aggregate is zero'};
  }},
  {id:'purchases.supplier-concentration',label:'تركيز أكبر مورد',unit:'percent',required:['supplierCode','netAmount'],formula:'MAX(supplier spend) / total supplier spend × 100',direction:'lower-is-better',calculate:ctx=>calcConcentration(ctx,'supplierCode','netAmount')},
  {id:'purchases.average-lead-time',label:'متوسط مدة التوريد',unit:'days',required:['leadTimeDays'],formula:'AVG(leadTimeDays)',direction:'lower-is-better',calculate:ctx=>calcAverage(ctx,'leadTimeDays')},
  {id:'purchases.receipt-fulfillment',label:'نسبة الاستلام مقابل الطلب',unit:'percent',required:['receivedQty','orderedQty'],formula:'SUM(receivedQty) / |SUM(orderedQty)| × 100',direction:'higher-is-better',calculate:ctx=>calcRatio(ctx,'receivedQty','orderedQty',true)},
  {id:'inventory.coverage-days',label:'تغطية المخزون بالأيام',unit:'days',required:['currentStock','dailySalesRate'],formula:'AVG(currentStock / dailySalesRate)',direction:'higher-is-better',calculate:ctx=>calcDays(ctx,'currentStock','dailySalesRate')},
  {id:'inventory.zero-negative-share',label:'نسبة الأرصدة الصفرية/السالبة',unit:'percent',required:['currentStock'],formula:'COUNT(stock <= 0) / COUNT(stock) × 100',direction:'lower-is-better',calculate:ctx=>calcZeroShare(ctx,'currentStock')},
  {id:'inventory.dead-share',label:'نسبة المخزون الراكد',unit:'percent',required:['currentStock','stockAgeDays','dailySalesRate'],formula:'COUNT(age >= 180 AND daily demand <= 1) / COUNT(rows) × 100',direction:'lower-is-better',calculate:ctx=>calcDeadShare(ctx,'stockAgeDays','dailySalesRate')},
  {id:'inventory.reconciliation-gap',label:'نسبة عدم تسوية حركة المخزون',unit:'percent',required:['openingStock','inbound','outbound','currentStock'],formula:'COUNT(opening + inbound - outbound != closing) / COUNT(rows) × 100',direction:'lower-is-better',calculate:calcReconciliation},
  {id:'receivables.collection-rate',label:'نسبة التحصيل',unit:'percent',required:['paidAmount','balance'],formula:'SUM(paid) / (SUM(paid) + SUM(balance)) × 100',direction:'higher-is-better',calculate:ctx=>{
    const p=ctx.values('paidAmount'), b=ctx.values('balance'); if(!p.length||!b.length)return{value:null,rows:[],note:'paid and balance required'};
    const sumP=p.reduce((s,x)=>s+x.value,0),sumB=b.reduce((s,x)=>s+Math.max(0,x.value),0),den=sumP+sumB; return den ? {value:(sumP/den)*100,rows:[...p,...b].map(x=>x.index),note:'collection ratio from paid and outstanding amounts'}:{value:null,rows:[],note:'no receivable balance'};
  }},
  {id:'profitability.margin',label:'هامش الربح',unit:'percent',required:['profit','netAmount'],formula:'SUM(profit) / |SUM(netAmount)| × 100',direction:'higher-is-better',calculate:ctx=>calcRatio(ctx,'profit','netAmount',true)},
  {id:'finance.cash-net-movement',label:'صافي الحركة النقدية',unit:'currency',required:['inflow','outflow'],formula:'SUM(inflow) - SUM(outflow)',direction:'higher-is-better',calculate:ctx=>{const a=calcSum(ctx,'inflow'),b=calcSum(ctx,'outflow');return a.value!=null&&b.value!=null?{value:a.value-b.value,rows:[...new Set([...a.rows,...b.rows])],note:'source inflows less source outflows'}:{value:null,rows:[],note:'inflow and outflow required'}}},
  {id:'fulfillment.rate',label:'نسبة تنفيذ الطلب',unit:'percent',required:['fulfilledQty','requestedQty'],formula:'SUM(fulfilledQty) / |SUM(requestedQty)| × 100',direction:'higher-is-better',calculate:ctx=>calcRatio(ctx,'fulfilledQty','requestedQty',true)},
];

function evidence(metric: MetricDef, calc: Calc, ctx: Ctx, sourceHash?: string | null): BrainEvidence {
  const availableFields = metric.required.filter(field=>Boolean(ctx.field(field)));
  return {
    sourceHash: sourceHash ?? null,
    fields: availableFields,
    rows: calc.rows.slice(0,20).map(index => index + 1),
    sampleSize: ctx.rows.length,
    note: calc.note,
  };
}

export function calculateBrainMetrics(input: BrainInput): BrainMetric[] {
  const ctx=makeCtx(input.rows,input.availableFields);
  return metricDefs.map(def=>{
    const calc=def.calculate(ctx);
    const available=def.required.filter(field=>Boolean(ctx.field(field)));
    const status=calc.value == null ? (available.length===def.required.length ? 'INSUFFICIENT_DATA' : 'UNAVAILABLE') : 'CALCULATED';
    return {id:def.id,label:def.label,value:calc.value,unit:def.unit,status,requiredFields:def.required,availableFields:available,formula:def.formula,evidence:evidence(def,calc,ctx,input.sourceHash),direction:def.direction};
  });
}

function percentile(sorted: number[], p: number): number | null {
  if(!sorted.length) return null;
  const index=(sorted.length-1)*p; const lower=Math.floor(index); const upper=Math.ceil(index);
  if(lower===upper)return sorted[lower]; const weight=index-lower; return sorted[lower]*(1-weight)+sorted[upper]*weight;
}

function benchmarkFromMetric(input: BrainInput, metricId: string, dimension: string): BrainBenchmark {
  const def=metricDefs.find(item=>item.id===metricId); if(!def) return {state:'UNAVAILABLE',metricId:null,dimension:null,entityCount:0,median:null,topQuartile:null,current:null,gapToMedian:null,gapToTopQuartile:null,boundary:'metric definition unavailable'};
  const ctx=makeCtx(input.rows,input.availableFields);
  if(!ctx.field(dimension)) return {state:'UNAVAILABLE',metricId,dimension,entityCount:0,median:null,topQuartile:null,current:null,gapToMedian:null,gapToTopQuartile:null,boundary:'requested benchmark dimension is not present in the source'};
  const key=ctx.field(dimension) as string;
  const groups=new Map<string,Row[]>();
  input.rows.forEach(row=>{const value=text(row[key]);if(!value)return;const list=groups.get(value)??[];list.push(row);groups.set(value,list);});
  if(groups.size<5) return {state:'INSUFFICIENT_SAMPLE',metricId,dimension,entityCount:groups.size,median:null,topQuartile:null,current:null,gapToMedian:null,gapToTopQuartile:null,boundary:'internal benchmark requires at least five comparable entities'};
  const groupValues:number[]=[];
  for(const rows of groups.values()){
    const value=def.calculate(makeCtx(rows,input.availableFields)).value;
    if(value!=null && Number.isFinite(value)) groupValues.push(value);
  }
  if(groupValues.length<5)return {state:'INSUFFICIENT_SAMPLE',metricId,dimension,entityCount:groupValues.length,median:null,topQuartile:null,current:null,gapToMedian:null,gapToTopQuartile:null,boundary:'fewer than five entities produced a valid metric'};
  const sorted=[...groupValues].sort((a,b)=>a-b);
  const current=def.calculate(ctx).value;
  const median=percentile(sorted,.5);
  const topQuartile=def.direction==='lower-is-better'?percentile(sorted,.25):percentile(sorted,.75);
  return {
    state:'INTERNAL_COMPARABLE',metricId,dimension,entityCount:groupValues.length,median,topQuartile,current,
    gapToMedian: current!=null&&median!=null ? current-median : null,
    gapToTopQuartile: current!=null&&topQuartile!=null ? current-topQuartile : null,
    boundary:'مقارنة داخلية بين كيانات من نفس المصدر فقط؛ ليست متوسط سوق أو مقارنة خارجية.',
  };
}

function defaultBenchmark(input: BrainInput, metrics: BrainMetric[]): BrainBenchmark {
  const choices:[
    string,string
  ]=[
    ['sales.customer-concentration','customerCode'],
    ['purchases.supplier-concentration','supplierCode'],
    ['inventory.zero-negative-share','productCode'],
  ];
  for(const [metricId,dimension] of choices){
    const candidate=benchmarkFromMetric(input,metricId,dimension);
    if(candidate.state==='INTERNAL_COMPARABLE') return candidate;
  }
  const first=candidatesForBenchmark(metrics).find(item=>item.status==='CALCULATED');
  return first ? benchmarkFromMetric(input, first.id, guessDimension(input)) : {state:'UNAVAILABLE',metricId:null,dimension:null,entityCount:0,median:null,topQuartile:null,current:null,gapToMedian:null,gapToTopQuartile:null,boundary:'لا يوجد بعد مرجع مقارن داخلي صالح.'};
}

function candidatesForBenchmark(metrics: BrainMetric[]): BrainMetric[] { return metrics.filter(item=>item.status==='CALCULATED'); }

function guessDimension(input: BrainInput): string {
  if(input.availableFields?.some(field => norm(field)==='customercode' || norm(field)==='رقمالعميل')) return 'customerCode';
  if(input.availableFields?.some(field => norm(field)==='productcode' || norm(field)==='رقمالصنف')) return 'productCode';
  return 'supplierCode';
}

function deriveSignals(metrics: BrainMetric[]): BrainSignal[] {
  const out: BrainSignal[]=[];
  const add=(metricId:string, severity:BrainSignalSeverity, threshold:number,title:string,statement:string,why:string,soWhat:string,next:string)=>{
    const metric=metrics.find(item=>item.id===metricId); if(!metric || metric.status!=='CALCULATED' || metric.value==null) return;
    out.push({id:'brain:'+metricId,severity,title,statement,metricId,value:metric.value,threshold,evidence:metric.evidence,why,soWhat,next});
  };
  const m=(id:string)=>metrics.find(item=>item.id===id)?.value ?? null;
  const zero=m('inventory.zero-negative-share'); if(zero!=null&&zero>0)add('inventory.zero-negative-share',zero>=10?'CRITICAL':zero>=5?'HIGH':'MEDIUM',0,'رصيد صفر أو سالب يحتاج معالجة',`نسبة ${zero.toFixed(1)}% من السجلات تحمل رصيدًا صفريًا أو سالبًا.`,'وجود رصيد غير متاح قد يعطل الخدمة أو يكشف عدم تسوية؛ لكنه لا يثبت سببًا واحدًا.', 'حدد الأصناف المتأثرة واربطها بطلب/تسوية/حركة قبل إعادة الطلب.', 'ابدأ بأكبر الأصناف المتأثرة واربط الإجراء بدليل الحركة.');
  const cover=m('inventory.coverage-days'); if(cover!=null&&cover<14)add('inventory.coverage-days',cover<7?'CRITICAL':'HIGH',14,'تغطية مخزون منخفضة',`متوسط التغطية المحسوبة من المصدر ${cover.toFixed(1)} يوم.`,'الرصيد أقل من نافذة تشغيلية أولية قدرها 14 يومًا؛ هذا معيار فرز وليس سياسة مؤسسية.', 'راجع أصناف النفاد القريب مقابل مدة التوريد قبل الشراء.', 'قارن تغطية كل صنف بزمن التوريد الفعلي ثم جهز قائمة الأولوية.');
  const conc=m('sales.customer-concentration'); if(conc!=null&&conc>60)add('sales.customer-concentration',conc>=80?'CRITICAL':'HIGH',60,'تركيز مرتفع لدى أكبر عميل',`أكبر عميل يمثل ${conc.toFixed(1)}% من القيمة في المصدر.`,'تركيز الإيراد يرفع حساسية النتيجة لفقد هذا الكيان.', 'حوّل التركيز إلى قائمة متابعة لا إلى حكم خسارة مؤكدة.', 'افتح مساهمة بقية العملاء وحدد فرص التنويع.');
  const supplier=m('purchases.supplier-concentration'); if(supplier!=null&&supplier>60)add('purchases.supplier-concentration',supplier>=80?'CRITICAL':'HIGH',60,'تركيز مرتفع لدى أكبر مورد',`أكبر مورد يمثل ${supplier.toFixed(1)}% من الإنفاق في المصدر.`,'الاعتماد المرتفع قد يرفع مخاطر الاستمرارية والتسعير.', 'راجع البدائل وتغير الأسعار قبل أي قرار توريد.', 'قسّم الاعتماد حسب الصنف والمدة والسعر.');
  const ret=m('sales.return-rate'); if(ret!=null&&ret>10)add('sales.return-rate',ret>=20?'CRITICAL':'HIGH',10,'معدل مرتجعات مرتفع',`المرتجعات تمثل ${ret.toFixed(1)}% من الكمية المرجعية.`,'المرتجع مرتفع بما يكفي ليتطلب فحص بؤر المنتجات والعملاء.', 'اعزل مساهمة المرتجعات حسب الصنف/العميل قبل معالجة السبب.', 'ابدأ بأعلى 10 بؤر مرتجعات، ثم اختبر السبب بالدليل.');
  const disc=m('sales.discount-rate'); if(disc!=null&&disc>15)add('sales.discount-rate',disc>=25?'HIGH':'MEDIUM',15,'خصومات تحتاج مراجعة',`الخصم يساوي ${disc.toFixed(1)}% من القيمة الإجمالية المرجعية.`,'الخصم المرتفع قد يضغط الهامش لكن لا يثبت خسارة دون تكلفة.', 'اربط الخصم بالهامش وبالعميل/الصنف قبل تغيير السياسة.', 'افحص أعلى الخصومات وأثرها على الربحية.');
  const gap=m('sales.target-gap'); if(gap!=null&&gap<-10)add('sales.target-gap',gap<-20?'CRITICAL':'HIGH',-10,'فجوة عن المستهدف',`الفعلي أقل من المستهدف بنحو ${Math.abs(gap).toFixed(1)}%.`,'الفجوة مقاسة من المصدر وليست توقعًا.', 'حدد المساهمين في الفجوة ثم اختبر إجراءً تصحيحيًا.', 'قسّم الفجوة حسب العميل/الصنف/الفترة.');
  const collection=m('receivables.collection-rate'); if(collection!=null&&collection<70)add('receivables.collection-rate',collection<50?'CRITICAL':'HIGH',70,'تحصيل منخفض',`نسبة التحصيل المحسوبة ${collection.toFixed(1)}%.`,'الرصيد غير المحصل ظاهر في المصدر ويحتاج ترتيب أولوية.', 'ابدأ بأكبر الأرصدة المستحقة بدل تعميم المشكلة.', 'رتّب العملاء بحسب الرصيد والاستحقاق ثم سجّل نتيجة التحصيل.');
  const margin=m('profitability.margin'); if(margin!=null&&margin<10)add('profitability.margin',margin<0?'CRITICAL':'HIGH',10,'هامش ربح ضعيف',`الهامش المحسوب ${margin.toFixed(1)}% من القيمة الصافية.`,'الهامش منخفض على مستوى المصدر؛ السبب يحتاج تحليل السعر/التكلفة.', 'راجع الأصناف والعملاء التي تسحب الهامش قبل تعديل الأسعار.', 'اختبر بدائل السعر والتكلفة في سيناريو مستقل.');
  const recon=m('inventory.reconciliation-gap'); if(recon!=null&&recon>0)add('inventory.reconciliation-gap',recon>=10?'CRITICAL':'HIGH',0,'فجوة تسوية في حركة المخزون',`نسبة ${recon.toFixed(1)}% من الصفوف لا تتطابق فيها معادلة الرصيد.`,'هناك تعارض بين حركات المصدر والرصيد النهائي.', 'أوقف الاستنتاج المالي للمخزون المتأثر حتى تتم المطابقة.', 'افتح الصفوف المخالفة واربطها بالمستند/الحركة.');
  return out.sort((a,b)=>({CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1}[b.severity]-({CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1}[a.severity]) || b.value-a.value));
}

function outcomeState(input: BrainInput): BrainOutcomeState {
  const outcomes=input.decisionOutcomes ?? [];
  if(!outcomes.length)return{state:'PENDING',observations:0,accuracy:null,actualValue:null,expectedValue:null,learning:'NOT_READY',boundary:'لا توجد نتيجة تنفيذية مرتبطة بعد؛ لا تُعامل التوصية المتوقعة كأثر متحقق.'};
  const known=outcomes.filter(item=>item.label!=='unknown');
  const correct=known.filter(item=>item.label==='correct').length;
  const accuracy=known.length ? correct/known.length : null;
  const last=outcomes[outcomes.length-1];
  const comparable=outcomes.filter(item=>item.actualValue!=null&&item.expectedValue!=null);
  return {
    state: known.length && known.some(item=>item.label==='partial'||item.label==='incorrect') ? 'PARTIAL' : known.length ? 'OBSERVED' : 'INSUFFICIENT_DATA',
    observations:outcomes.length,
    accuracy,
    actualValue:last?.actualValue ?? null,
    expectedValue:last?.expectedValue ?? null,
    learning:comparable.length>=3 ? 'CANDIDATE' : known.length ? 'REVIEW_REQUIRED' : 'NOT_READY',
    boundary:'التعلم مرشح للمراجعة البشرية بعد مقارنة actual مقابل expected؛ لا يتم تعديل قاعدة القرار تلقائيًا.',
  };
}

function readiness(metrics: BrainMetric[], signals: BrainSignal[], input: BrainInput): {score:number;blockers:string[];eligible:boolean}{
  const blockers:string[]=[];
  const calculated=metrics.filter(item=>item.status==='CALCULATED').length;
  const requiredEvidence=(input.sourceHash?15:0)+(input.reportJobId?10:0)+(input.rows.length?20:0)+(input.evidenceVerified?25:0);
  let score=Math.min(100,requiredEvidence+(metrics.length?Math.round((calculated/metrics.length)*35):0)+(signals.length?15:5));
  if(!input.sourceHash)blockers.push('SOURCE_HASH_REQUIRED');
  if(!input.reportJobId)blockers.push('REPORT_JOB_ID_REQUIRED');
  if(!input.evidenceVerified)blockers.push('VERIFIED_EVIDENCE_REQUIRED');
  if(!input.rows.length)blockers.push('ROWS_REQUIRED');
  if(!calculated)blockers.push('NO_CALCULATED_METRICS');
  if(signals.length && signals[0].evidence.sampleSize < 1)blockers.push('EVIDENCE_EMPTY');
  return {score,blockers,eligible:blockers.length===0&&score>=70};
}

export function buildBrainPacket(input: BrainInput): BrainPacket {
  const metrics=calculateBrainMetrics(input);
  const signals=deriveSignals(metrics);
  const benchmark=defaultBenchmark(input,metrics);
  const outcome=outcomeState(input);
  const ready=readiness(metrics,signals,input);
  const workEligible=Boolean(input.recommendation?.action) && ready.eligible;
  return {
    version:'brain.v1',
    status:ready.eligible ? (signals.length ? 'ACTIONABLE' : 'REVIEW_REQUIRED') : 'INSUFFICIENT_DATA',
    metrics,signals,benchmark,outcome,
    work:{
      state:workEligible ? 'PROPOSED' : input.recommendation?.action ? 'BLOCKED' : 'NOT_AVAILABLE',
      title:input.recommendation?.title ?? null,
      ownerHint:input.recommendation?.ownerHint ?? null,
      expectedOutcome:input.recommendation?.expectedOutcome ?? null,
      measurement:input.recommendation?.measurement ?? null,
      evidenceRequired:[input.sourceHash ? 'sourceHash' : 'sourceHash missing', input.reportJobId ? 'reportJobId' : 'reportJobId missing', ...((input.recommendation?.evidence ?? []).slice(0,5))],
    },
    decision:{readiness:ready.score,blockers:ready.blockers,recommendationEligible:ready.eligible},
    provenance:{sourceHash:input.sourceHash ?? null,reportJobId:input.reportJobId ?? null,archetypeId:input.archetypeId ?? null,evidenceSnapshotId:input.evidenceSnapshotId ?? null,evidencePassportId:input.evidencePassportId ?? null,evidenceVerified:Boolean(input.evidenceVerified)},
  };
}

export function validateBrainPacket(packet: BrainPacket): string[] {
  const errors:string[]=[];
  if(packet.version!=='brain.v1')errors.push('VERSION_INVALID');
  if(!packet.provenance.sourceHash)errors.push('SOURCE_HASH_MISSING');
  if(!packet.provenance.reportJobId)errors.push('REPORT_JOB_ID_MISSING');
  if(!packet.provenance.evidenceVerified)errors.push('VERIFIED_EVIDENCE_MISSING');
  if(packet.provenance.evidenceVerified && (!packet.provenance.evidenceSnapshotId || !packet.provenance.evidencePassportId))errors.push('VERIFIED_EVIDENCE_IDENTIFIERS_MISSING');
  for(const metric of packet.metrics){
    if(metric.status==='CALCULATED' && metric.value==null)errors.push('CALCULATED_WITHOUT_VALUE:'+metric.id);
    if(metric.requiredFields.some(field=>!metric.availableFields.includes(field)) && metric.status==='CALCULATED')errors.push('CALCULATED_WITH_MISSING_FIELD:'+metric.id);
    if(metric.evidence.sampleSize<1)errors.push('METRIC_WITHOUT_SAMPLE:'+metric.id);
  }
  for(const signal of packet.signals){
    if(signal.metricId===''||!Number.isFinite(signal.value))errors.push('SIGNAL_WITHOUT_METRIC:'+signal.id);
    if(signal.evidence.fields.length===0)errors.push('SIGNAL_WITHOUT_FIELD_EVIDENCE:'+signal.id);
  }
  if(packet.benchmark.state==='INTERNAL_COMPARABLE' && packet.benchmark.entityCount<5)errors.push('BENCHMARK_SAMPLE_TOO_SMALL');
  return [...new Set(errors)];
}
