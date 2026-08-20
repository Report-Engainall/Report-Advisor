export type QueryWindow={from?:string;to?:string};
export type QueryPlan={table:string;columns:string[];filters:Record<string,string|number|boolean|string[]>;window?:QueryWindow;limit:number;orderBy?:{column:string;ascending:boolean}};
const ALLOWED_TABLES=new Set(['products','inventory','orders','order_items','payments','customers','alternative_group_members']);
const SAFE_COLUMNS=new Set(['id','company_id','product_id','customer_id','order_id','quantity','stock','price','net_total','paid_amount','status','created_at','updated_at','sku','category_id','alternative_group_id']);
export function planQuery(input:{table:string;columns:string[];companyId:string;filters?:Record<string,string|number|boolean|string[]>;window?:QueryWindow;limit?:number;orderBy?:{column:string;ascending?:boolean}}):QueryPlan{
 if(!ALLOWED_TABLES.has(input.table)) throw new Error(`unsupported query table: ${input.table}`);
 const columns=[...new Set(input.columns)].filter(c=>SAFE_COLUMNS.has(c));
 if(!columns.length) throw new Error('query must request at least one safe column');
 if(!columns.includes('company_id')) columns.push('company_id');
 const filters={...(input.filters??{}),company_id:input.companyId};
 const limit=Math.min(Math.max(Math.trunc(input.limit??500),1),5000);
 const orderBy=input.orderBy&&SAFE_COLUMNS.has(input.orderBy.column)?{column:input.orderBy.column,ascending:input.orderBy.ascending!==false}:undefined;
 return {table:input.table,columns,filters,window:input.window,limit,orderBy};
}
export function planDateWindow(from?:string,to?:string){if(!from&&!to)return undefined;const f=from?new Date(from):undefined,t=to?new Date(to):undefined;if(f&&Number.isNaN(f.getTime())||t&&Number.isNaN(t.getTime()))throw new Error('invalid query date window');if(f&&t&&f>t)throw new Error('query window start must not exceed end');return {from,to};}
