export type GrossProfitDateRange = { startDate?: string; endDate?: string };
export type GrossProfitStatus = 'CALCULATED' | 'INSUFFICIENT_DATA';
export interface GrossProfitTruth { revenue:number|null; cost:number|null; grossProfit:number|null; quantity:number; invoiceCount:number; status:GrossProfitStatus; tenantIds:string[]; currencyIds:string[]; dateRange:{startDate:string|null;endDate:string|null}; }

type GrossProfitRow = { company_id?:string|null; invoice_id?:string; invoice_date:string; status:string; total:number|string|null; quantity:number|string|null; cost_price:number|string|null; currency?:string|null };

export function calculateGrossProfitTruth(rows:GrossProfitRow[],range:GrossProfitDateRange={}):GrossProfitTruth{
 const start=range.startDate??null,end=range.endDate??null;
 const approved=rows.filter(row=>['confirmed','posted','paid'].includes(String(row.status).toLowerCase())&&(!start||row.invoice_date>=start)&&(!end||row.invoice_date<=end));
 const byInvoice=new Map<string,{company_id?:string|null;invoice_date:string;total:number|string|null;cost:number|null;quantity:number;currency:string|null}>();
 for(const row of approved){
   const id=row.invoice_id??`${row.company_id??''}:${row.invoice_date}`;
   const existing=byInvoice.get(id);
   if(!existing){byInvoice.set(id,{company_id:row.company_id,invoice_date:row.invoice_date,total:row.total,cost:row.cost_price==null?null:Number(row.cost_price)*Number(row.quantity??0),quantity:Number(row.quantity??0),currency:row.currency??null});continue;}
   if(existing.total!==row.total) existing.total=null;
   if(existing.currency!==row.currency) existing.currency=null;
   existing.quantity+=Number(row.quantity??0);
   if(row.cost_price==null) existing.cost=null;
   else if(existing.cost!==null) existing.cost+=Number(row.cost_price)*Number(row.quantity??0);
 }
 const invoices=[...byInvoice.values()];
 const tenantIds=[...new Set(invoices.map(i=>i.company_id).filter((id):id is string=>Boolean(id)))];
 const currencyIds=[...new Set(invoices.map(i=>i.currency).filter((id):id is string=>Boolean(id)))];
 const missingCurrency=invoices.some(i=>i.currency===null);
 const mixedCurrency=currencyIds.length>1;
 const revenue=invoices.some(i=>i.total==null)||missingCurrency||mixedCurrency?null:invoices.reduce((s,i)=>s+Number(i.total),0);
 const cost=invoices.some(i=>i.cost===null)||missingCurrency||mixedCurrency?null:invoices.reduce((s,i)=>s+(i.cost??0),0);
 const grossProfit=revenue===null||cost===null?null:revenue-cost;
 return{revenue,cost,grossProfit,quantity:invoices.reduce((s,i)=>s+i.quantity,0),invoiceCount:invoices.length,status:invoices.length===0||revenue===null||cost===null?'INSUFFICIENT_DATA':'CALCULATED',tenantIds,currencyIds,dateRange:{startDate:start,endDate:end}};
}