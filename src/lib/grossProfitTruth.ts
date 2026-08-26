import { supabase } from './supabase';

export type GrossProfitDateRange = { startDate?: string; endDate?: string };
export type GrossProfitStatus = 'CALCULATED' | 'INSUFFICIENT_DATA';
export interface GrossProfitTruth { revenue:number|null; cost:number|null; grossProfit:number|null; quantity:number; invoiceCount:number; status:GrossProfitStatus; tenantIds:string[]; dateRange:{startDate:string|null;endDate:string|null}; }

/** One invoice total is counted once; sale_items only contribute quantity and COGS. NULL never becomes zero. */
export function calculateGrossProfitTruth(rows:Array<{company_id?:string|null;invoice_id?:string;invoice_date:string;status:string;total:number|string|null;quantity:number|string|null;cost_price:number|string|null}>,range:GrossProfitDateRange={}):GrossProfitTruth{
 const start=range.startDate??null,end=range.endDate??null; const approved=rows.filter(row=>['confirmed','posted','paid'].includes(String(row.status).toLowerCase())&&(!start||row.invoice_date>=start)&&(!end||row.invoice_date<=end));
 const byInvoice=new Map<string,{company_id?:string|null;invoice_date:string;total:number|string|null;cost:number|null;quantity:number}>();
 for(const row of approved){const id=row.invoice_id??`${row.company_id??''}:${row.invoice_date}`;const e=byInvoice.get(id)??{company_id:row.company_id,invoice_date:row.invoice_date,total:row.total,cost:0,quantity:0};if(e.total==null)e.total=row.total;e.quantity+=Number(row.quantity??0);if(row.cost_price==null)e.cost=null;else if(e.cost!==null)e.cost+=Number(row.cost_price)*Number(row.quantity??0);byInvoice.set(id,e);}
 const invoices=[...byInvoice.values()]; const revenueMissing=invoices.some(i=>i.total==null); const revenue=revenueMissing?null:invoices.reduce((s,i)=>s+Number(i.total),0); const costMissing=invoices.some(i=>i.cost===null); const cost=costMissing?null:invoices.reduce((s,i)=>s+(i.cost??0),0); const grossProfit=revenue===null||cost===null?null:revenue-cost;
 return {revenue,cost,grossProfit,quantity:invoices.reduce((s,i)=>s+i.quantity,0),invoiceCount:invoices.length,status:invoices.length===0||revenue===null||cost===null?'INSUFFICIENT_DATA':'CALCULATED',tenantIds:[...new Set(invoices.map(i=>i.company_id).filter((id):id is string=>Boolean(id)))],dateRange:{startDate:start,endDate:end}};
}

async function fetchAll<T>(table:string,columns:string,pageSize=1000):Promise<T[]>{const rows:T[]=[];for(let from=0;;from+=pageSize){const{data,error}=await supabase.from(table).select(columns).range(from,from+pageSize-1);if(error)throw error;const page=(data??[])as T[];rows.push(...page);if(page.length<pageSize)break;}return rows;}

export async function fetchGrossProfitTruth(range:GrossProfitDateRange={}):Promise<GrossProfitTruth>{
 const invoices=await fetchAll<{id:string;company_id:string;invoice_date:string;status:string;total:number|null}>('sales_invoices','id, company_id, invoice_date, status, total');
 const approvedInvoices=invoices.filter(i=>['confirmed','posted','paid'].includes(String(i.status).toLowerCase())&&(!range.startDate||i.invoice_date>=range.startDate)&&(!range.endDate||i.invoice_date<=range.endDate)); if(!approvedInvoices.length)return calculateGrossProfitTruth([],range);
 const items:Array<{invoice_id:string;quantity:number|null;cost_price:number|null}>=[];for(let i=0;i<approvedInvoices.length;i+=100){const ids=approvedInvoices.slice(i,i+100).map(x=>x.id);const{data,error}=await supabase.from('sale_items').select('invoice_id, quantity, cost_price').in('invoice_id',ids);if(error)throw error;items.push(...((data??[])as typeof items));}
 const byInvoice=new Map<string,typeof items>();for(const item of items)byInvoice.set(item.invoice_id,[...(byInvoice.get(item.invoice_id)??[]),item]);
 const rows=approvedInvoices.flatMap(invoice=>{const its=byInvoice.get(invoice.id)??[];return its.length?its.map(item=>({invoice_id:invoice.id,company_id:invoice.company_id,invoice_date:invoice.invoice_date,status:invoice.status,total:invoice.total,quantity:item.quantity,cost_price:item.cost_price})):[{invoice_id:invoice.id,company_id:invoice.company_id,invoice_date:invoice.invoice_date,status:invoice.status,total:invoice.total,quantity:0,cost_price:null}];});
 return calculateGrossProfitTruth(rows,range);
}
