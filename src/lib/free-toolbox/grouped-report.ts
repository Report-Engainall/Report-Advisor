export type ReportMode='detail'|'grouped'
export interface DetailReportRow{sku:string;name:string;groupId?:string;stockUnits:number;requestedUnits:number;netSalesUnits:number;dailyDemand:number}
export interface GroupedReportRow{groupId:string;name:string;memberSkus:string[];stockUnits:number;requestedUnits:number;netSalesUnits:number;dailyDemand:number;daysOfCover:number}

type MissingState={stock:boolean;requested:boolean;sales:boolean;demand:boolean}

/** Presentation-only grouping. Business truth is supplied by the authoritative snapshot. */
export function toGroupedReport(rows:DetailReportRow[],groups:Record<string,{name:string;members:string[]}>):GroupedReportRow[]{
 const out=new Map<string,GroupedReportRow>();
 const missing=new Map<string,MissingState>();
 for(const r of rows){
  if(!r.groupId)continue;
  const g=groups[r.groupId];if(!g)continue;
  const x=out.get(r.groupId)??{groupId:r.groupId,name:g.name,memberSkus:g.members,stockUnits:0,requestedUnits:0,netSalesUnits:0,dailyDemand:0,daysOfCover:Number.NaN};
  const state=missing.get(r.groupId)??{stock:false,requested:false,sales:false,demand:false};
  if(Number.isFinite(r.stockUnits))x.stockUnits+=Math.max(0,r.stockUnits);else state.stock=true;
  if(Number.isFinite(r.requestedUnits))x.requestedUnits+=Math.max(0,r.requestedUnits);else state.requested=true;
  if(Number.isFinite(r.netSalesUnits))x.netSalesUnits+=Math.max(0,r.netSalesUnits);else state.sales=true;
  if(Number.isFinite(r.dailyDemand))x.dailyDemand+=Math.max(0,r.dailyDemand);else state.demand=true;
  missing.set(r.groupId,state);out.set(r.groupId,x);
 }
 return [...out.values()].map(x=>{
  const state=missing.get(x.groupId);
  if(state?.stock)x.stockUnits=Number.NaN;
  if(state?.requested)x.requestedUnits=Number.NaN;
  if(state?.sales)x.netSalesUnits=Number.NaN;
  if(state?.demand)x.dailyDemand=Number.NaN;
  return {...x,daysOfCover:Number.isFinite(x.stockUnits)&&Number.isFinite(x.dailyDemand)&&x.dailyDemand>0?x.stockUnits/x.dailyDemand:Number.NaN};
 });
}
export function applyReportMode(rows:DetailReportRow[],mode:ReportMode,groups:Record<string,{name:string;members:string[]}>):DetailReportRow[]|GroupedReportRow[]{return mode==='grouped'?toGroupedReport(rows,groups):rows}