import { supabase } from './supabase';
import { calculateGrossProfitTruth, isGrossProfitDateInRange, type GrossProfitDateRange, type GrossProfitStatus, type GrossProfitTruth } from './grossProfitTruthCore';
export { calculateGrossProfitTruth, isGrossProfitDateInRange } from './grossProfitTruthCore';
export type { GrossProfitDateRange, GrossProfitStatus, GrossProfitTruth } from './grossProfitTruthCore';

async function fetchAll<T>(table:string,columns:string,pageSize=1000):Promise<T[]>{const rows:T[]=[];for(let from=0;;from+=pageSize){const{data,error}=await supabase.from(table).select(columns).range(from,from+pageSize-1);if(error)throw error;const page=(data??[])as T[];rows.push(...page);if(page.length<pageSize)break;}return rows;}
export async function fetchGrossProfitTruth(range:GrossProfitDateRange={}):Promise<GrossProfitTruth>{
 const invoices=await fetchAll<{id:string;company_id:string;invoice_date:string;status:string;total:number|null;currency:string|null}>('sales_invoices','id, company_id, invoice_date, status, total, currency');
 const approvedInvoices=invoices.filter(i=>['confirmed','posted','paid'].includes(String(i.status).toLowerCase())&&isGrossProfitDateInRange(i.invoice_date,range));
 if(!approvedInvoices.length)return calculateGrossProfitTruth([],range);
 const items:Array<{invoice_id:string;quantity:number|null;cost_price:number|null}>=[];
 for(let i=0;i<approvedInvoices.length;i+=100){const ids=approvedInvoices.slice(i,i+100).map(x=>x.id);const{data,error}=await supabase.from('sale_items').select('invoice_id, quantity, cost_price').in('invoice_id',ids);if(error)throw error;items.push(...((data??[])as typeof items));}
 const byInvoice=new Map<string,typeof items>();for(const item of items)byInvoice.set(item.invoice_id,[...(byInvoice.get(item.invoice_id)??[]),item]);
 const rows=approvedInvoices.flatMap(invoice=>{const its=byInvoice.get(invoice.id)??[];return its.length?its.map(item=>({invoice_id:invoice.id,company_id:invoice.company_id,invoice_date:invoice.invoice_date,status:invoice.status,total:invoice.total,quantity:item.quantity,cost_price:item.cost_price,currency:invoice.currency})):[{invoice_id:invoice.id,company_id:invoice.company_id,invoice_date:invoice.invoice_date,status:invoice.status,total:invoice.total,quantity:null,cost_price:null,currency:invoice.currency}];});
 return calculateGrossProfitTruth(rows,range);
}