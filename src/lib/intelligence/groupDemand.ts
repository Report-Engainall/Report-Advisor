export interface AlternativeMember { sku:string; factor?:number; dailyDemand:number; stock:number; netSales?:number; }
export interface AlternativeGroupInput { id:string; name:string; members:AlternativeMember[]; }
export type GroupDataState='KNOWN'|'INSUFFICIENT_DATA';
export interface AlternativeGroupDecision { id:string; name:string; memberSkus:string[]; normalizedDemand:number|null; normalizedStock:number|null; coverageDays:number|null; normalizedSales:number|null; stockoutRisk:'critical'|'high'|'medium'|'low'|'insufficient_data'; trendPct:number|null; recommendedOrder:number|null; dataState:GroupDataState; }

const clamp=(n:number,min:number,max:number)=>Math.min(max,min,n);
const positive=(n:number)=>Number.isFinite(n)&&n>0?n:0;
const known=(n:number)=>Number.isFinite(n);

export function aggregateAlternativeGroup(group:AlternativeGroupInput,recentDemandBySku?:Record<string,number>,targetDays=30):AlternativeGroupDecision{
 const seen=new Set<string>();
 const members=group.members.filter(m=>m.sku&&!seen.has(m.sku)&&seen.add(m.sku));
 const demandComplete=members.length>0&&members.every(m=>known(m.dailyDemand));
 const stockComplete=members.length>0&&members.every(m=>known(m.stock));
 const salesComplete=members.every(m=>m.netSales===undefined||known(m.netSales));
 const demand=demandComplete?members.reduce((s,m)=>s+positive(m.dailyDemand)*positive(m.factor??1),0):null;
 const stock=stockComplete?members.reduce((s,m)=>s+positive(m.stock)*positive(m.factor??1),0):null;
 const sales=salesComplete?members.reduce((s,m)=>s+positive(m.netSales??0),0):null;
 const recentComplete=members.every(m=>known(recentDemandBySku?.[m.sku]??m.dailyDemand));
 const recent=recentComplete?members.reduce((s,m)=>s+positive(recentDemandBySku?.[m.sku]??m.dailyDemand)*positive(m.factor??1),0):null;
 const trendPct=demand!==null&&demand>0&&recent!==null?clamp(((recent/demand)-1)*100,-100,500):null;
 const coverageDays=demand!==null&&stock!==null&&demand>0?stock/demand:null;
 const risk=demand===null||stock===null?'insufficient_data':stock<=0?'critical':coverageDays!==null&&coverageDays<=7?'critical':coverageDays!==null&&coverageDays<=14?'high':coverageDays!==null&&coverageDays<=30?'medium':'low';
 const recommendedOrder=demand!==null&&stock!==null?Math.max(0,Math.ceil(demand*Math.max(1,targetDays)-stock)):null;
 return{id:group.id,name:group.name,memberSkus:members.map(m=>m.sku),normalizedDemand:demand,normalizedStock:stock,coverageDays,normalizedSales:sales,stockoutRisk:risk,trendPct,recommendedOrder,dataState:demand!==null&&stock!==null?'KNOWN':'INSUFFICIENT_DATA'};
}

export function aggregateAlternativeGroups(groups:AlternativeGroupInput[],recentDemandBySku?:Record<string,number>,targetDays=30){const rank={critical:0,high:1,medium:2,low:3,insufficient_data:4} as const;return groups.map(g=>aggregateAlternativeGroup(g,recentDemandBySku,targetDays)).sort((a,b)=>rank[a.stockoutRisk]-rank[b.stockoutRisk]||(b.normalizedDemand??-Infinity)-(a.normalizedDemand??-Infinity));}
