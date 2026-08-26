export type GrossProfitDateRange = { startDate?: string; endDate?: string };
export type GrossProfitStatus = 'CALCULATED' | 'INSUFFICIENT_DATA' | 'UNSUPPORTED';
export interface GrossProfitTruth { revenue:number|null; cost:number|null; grossProfit:number|null; quantity:number|null; invoiceCount:number; status:GrossProfitStatus; tenantIds:string[]; currencyIds:string[]; dateRange:{startDate:string|null;endDate:string|null}; }

type GrossProfitRow = { company_id?:string|null; invoice_id?:string; line_id?:string|null; invoice_date:string; status:string; total:number|string|null; quantity:number|string|null; cost_price:number|string|null; currency?:string|null };

export function isGrossProfitDateInRange(invoiceDate:string, range:GrossProfitDateRange={}):boolean {
 const value=Date.parse(invoiceDate);
 if(!Number.isFinite(value)) return false;
 const start=range.startDate;
 const end=range.endDate;
 if(start){ const startValue=Date.parse(start); if(!Number.isFinite(startValue)||value<startValue) return false; }
 if(end){
   const endValue=/^\d{4}-\d{2}-\d{2}$/.test(end)
     ? Date.parse(`${end}T00:00:00.000Z`)+86_400_000
     : Date.parse(end);
   if(!Number.isFinite(endValue)||value>=endValue) return false;
 }
 return true;
}

export function calculateGrossProfitTruth(rows:GrossProfitRow[],range:GrossProfitDateRange={}):GrossProfitTruth{
 const start=range.startDate??null,end=range.endDate??null;
 const approved=rows.filter(row=>['confirmed','posted','paid'].includes(String(row.status).toLowerCase())&&isGrossProfitDateInRange(row.invoice_date,range));
 const byInvoice=new Map<string,{company_id?:string|null;invoice_date:string;total:number|string|null;cost:number|null;quantity:number|null;currency:string|null;lineIds:Set<string>}>();
 let duplicateLine=false;
 for(const row of approved){
   const id=row.invoice_id??`${row.company_id??''}:${row.invoice_date}`;
   const existing=byInvoice.get(id);
   const lineId=row.line_id??null;
   if(existing&&lineId){ if(existing.lineIds.has(lineId)) duplicateLine=true; else existing.lineIds.add(lineId); }
   if(!existing){
     const quantity=row.quantity==null?null:Number(row.quantity);
     byInvoice.set(id,{company_id:row.company_id,invoice_date:row.invoice_date,total:row.total,cost:row.cost_price==null||quantity==null?null:Number(row.cost_price)*quantity,quantity,currency:row.currency??null,lineIds:lineId?new Set([lineId]):new Set()});
     continue;
   }
   if(existing.total!==row.total) existing.total=null;
   if(existing.currency!==row.currency) existing.currency=null;
   if(existing.quantity!==null&&row.quantity!==null) existing.quantity+=Number(row.quantity);
   else existing.quantity=null;
   if(row.cost_price==null||row.quantity==null) existing.cost=null;
   else if(existing.cost!==null) existing.cost+=Number(row.cost_price)*Number(row.quantity);
 }
 const invoices=[...byInvoice.values()];
 const tenantIds=[...new Set(invoices.map(i=>i.company_id).filter((id):id is string=>Boolean(id)))];
 const currencyIds=[...new Set(invoices.map(i=>i.currency).filter((id):id is string=>Boolean(id)))];
 const missingCurrency=invoices.some(i=>i.currency===null);
 const mixedCurrency=currencyIds.length>1;
 const invalidQuantity=invoices.some(i=>i.quantity===null);
 const revenue=invoices.some(i=>i.total==null)||missingCurrency||mixedCurrency||duplicateLine?null:invoices.reduce((s,i)=>s+Number(i.total),0);
 const cost=invoices.some(i=>i.cost===null)||missingCurrency||mixedCurrency||duplicateLine?null:invoices.reduce((s,i)=>s+(i.cost??0),0);
 const quantity=invalidQuantity?null:invoices.reduce((s,i)=>s+(i.quantity??0),0);
 const grossProfit=revenue===null||cost===null?null:revenue-cost;
 return{revenue,cost,grossProfit,quantity,invoiceCount:invoices.length,status:invoices.length===0||revenue===null||cost===null||quantity===null?'INSUFFICIENT_DATA':'CALCULATED',tenantIds,currencyIds,dateRange:{startDate:start,endDate:end}};
}
