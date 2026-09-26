import type { InventoryDecision } from './inventoryEngine';
import type { AlternativeGroupDecision } from './groupDemand';
export interface DecisionEvidence { metric:string; value:number; unit?:string; source:string; period?:string; }
export interface Decision { id:string; severity:'critical'|'high'|'medium'|'low'; title:string; action:string; confidence:number; evidence:DecisionEvidence[]; }

function optionalNumericEvidence(metric:string,value:number|null|undefined,unit:string,source:string):DecisionEvidence[]{return Number.isFinite(value)?[{metric,value:value as number,unit,source}]:[];}
function inventoryEvidenceIsUsable(item:InventoryDecision):boolean{
 return Number.isFinite(item.avgDailySales)&&Number.isFinite(item.reorderPoint)&&Number.isFinite(item.recommendedOrder);
}
function alternativeGroupEvidenceIsUsable(group:AlternativeGroupDecision):boolean{
 return Number.isFinite(group.normalizedStock)
   && Number.isFinite(group.normalizedDemand)
   && Number.isFinite(group.recommendedOrder)
   && Number.isFinite(group.trendPct);
}

export function inventoryDecisions(items:InventoryDecision[]):Decision[]{return items.flatMap((item):Decision[]=>{
 if(!inventoryEvidenceIsUsable(item))return[];
 if(item.priority==='critical'){
  if(!Number.isFinite(item.daysOfCover))return[];
  return[{id:`inventory:${item.sku}`,severity:'critical',title:`إعادة طلب عاجلة للصنف ${item.sku}`,action:`اطلب ${item.recommendedOrder} وحدة قبل نفاد المخزون المتوقع في ${item.stockoutDate??'غير محدد'}.`,confidence:.98,evidence:[{metric:'days_of_cover',value:item.daysOfCover,unit:'days',source:'inventory_engine'},{metric:'reorder_point',value:item.reorderPoint,unit:'units',source:'inventory_engine'},{metric:'recommended_order',value:item.recommendedOrder,unit:'units',source:'inventory_engine'}]}];
 }
 if(item.classification==='frozen')return[{id:`liquidity:${item.sku}`,severity:'medium',title:`مخزون راكد يحتاج خطة تصريف ${item.sku}`,action:'راجع السعر، الحزمة، القناة البيعية أو العرض الترويجي قبل شراء كمية إضافية.',confidence:.92,evidence:[{metric:'avg_daily_sales',value:item.avgDailySales,unit:'units/day',source:'inventory_engine'},{metric:'reorder_point',value:item.reorderPoint,unit:'units',source:'inventory_engine'},...optionalNumericEvidence('days_of_cover',item.daysOfCover,'days','inventory_engine')]}];
 return[];
});}

export function alternativeGroupDecisions(groups:AlternativeGroupDecision[]):Decision[]{return groups.flatMap((group):Decision[]=>{
 if(!alternativeGroupEvidenceIsUsable(group))return[];
 if(group.stockoutRisk==='critical')return[{id:`alternative-group:${group.id}`,severity:'critical',title:`خطر نفاد على مستوى المجموعة ${group.name}`,action:`اطلب ما يقارب ${group.recommendedOrder} وحدة قياسية للمجموعة، مع فحص توفر البدائل قبل اعتماد الطلب.`,confidence:.97,evidence:[{metric:'group_stock',value:group.normalizedStock,unit:'units',source:'alternative_group_engine'},{metric:'group_daily_demand',value:group.normalizedDemand,unit:'units/day',source:'alternative_group_engine'},...optionalNumericEvidence('group_coverage',group.coverageDays,'days','alternative_group_engine')]}];
 if(group.stockoutRisk==='high')return[{id:`alternative-group:${group.id}`,severity:'high',title:`تغطية المجموعة ${group.name} تقترب من الخطر`,action:'راجع التوريد والبدائل داخل المجموعة قبل وصول الرصيد إلى نقطة الخطر.',confidence:.94,evidence:[...optionalNumericEvidence('group_coverage',group.coverageDays,'days','alternative_group_engine'),{metric:'trend_pct',value:group.trendPct,unit:'percent',source:'alternative_group_engine'}]}];
 if(group.trendPct>15)return[{id:`alternative-group-trend:${group.id}`,severity:'medium',title:`تسارع الطلب على ${group.name}`,action:'ارفع أولوية المراقبة والشراء مؤقتًا لأن حركة المجموعة تتسارع.',confidence:.88,evidence:[{metric:'trend_pct',value:group.trendPct,unit:'percent',source:'alternative_group_engine'}]}];
 return[];
});}
