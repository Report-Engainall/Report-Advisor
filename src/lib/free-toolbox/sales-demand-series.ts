import { supabase, COMPANY_ID } from '@/lib/supabase';
export interface DemandPoint { date:string; quantity:number; sales:number }
export interface ProductDemandSeries { productId:string; sku:string; name:string; points:DemandPoint[]; totalQuantity:number; averageDaily:number; peakDaily:number; trend:number }
const dayKey=(v:string)=>new Date(v).toISOString().slice(0,10);
export async function fetchProductDemandSeries(days=180):Promise<ProductDemandSeries[]>{
 const since=new Date(); since.setDate(since.getDate()-days);
 const {data:invoices,error:ie}=await supabase.from('sales_invoices').select('id,invoice_date').eq('company_id',COMPANY_ID).gte('invoice_date',since.toISOString()).order('invoice_date',{ascending:true});
 if(ie||!invoices?.length)return [];
 const ids=invoices.map(i=>i.id); const dateByInvoice=new Map(invoices.map(i=>[i.id,dayKey(i.invoice_date)]));
 const {data:items,error:se}=await supabase.from('sale_items').select('invoice_id,product_id,quantity,line_total,product:products(sku,name)').in('invoice_id',ids);
 if(se||!items?.length)return [];
 const map=new Map<string,ProductDemandSeries>();
 for(const row of items as any[]){if(!row.product_id)continue;const date=dateByInvoice.get(row.invoice_id);if(!date)continue;const e=map.get(row.product_id)??{productId:row.product_id,sku:row.product?.sku??'',name:row.product?.name??'غير معروف',points:[],totalQuantity:0,averageDaily:0,peakDaily:0,trend:0};const p=e.points.find(x=>x.date===date);if(p){p.quantity+=Number(row.quantity)||0;p.sales+=Number(row.line_total)||0}else e.points.push({date,quantity:Number(row.quantity)||0,sales:Number(row.line_total)||0});e.totalQuantity+=Number(row.quantity)||0;map.set(row.product_id,e)}
 for(const e of map.values()){e.points.sort((a,b)=>a.date.localeCompare(b.date));e.averageDaily=e.totalQuantity/Math.max(1,days);e.peakDaily=Math.max(...e.points.map(p=>p.quantity),0);const h=Math.max(1,Math.floor(e.points.length/2));const a=e.points.slice(0,h).reduce((s,p)=>s+p.quantity,0)/h;const b=e.points.slice(-h).reduce((s,p)=>s+p.quantity,0)/h;e.trend=a>0?(b-a)/a:b>0?1:0}
 return [...map.values()].sort((a,b)=>b.totalQuantity-a.totalQuantity)
}
