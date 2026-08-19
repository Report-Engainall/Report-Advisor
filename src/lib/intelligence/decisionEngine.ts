import type { InventoryDecision } from './inventoryEngine';

export interface DecisionEvidence { metric: string; value: number; unit?: string; source: string; period?: string; }
export interface Decision { id: string; severity: 'critical'|'high'|'medium'|'low'; title: string; action: string; confidence: number; evidence: DecisionEvidence[]; }

export function inventoryDecisions(items: InventoryDecision[]): Decision[] {
  return items.flatMap(item => {
    if (item.priority === 'critical') return [{ id:`inventory:${item.sku}`, severity:'critical', title:`إعادة طلب عاجلة للصنف ${item.sku}`, action:`اطلب ${item.recommendedOrder} وحدة قبل نفاد المخزون المتوقع في ${item.stockoutDate ?? 'غير محدد'}.`, confidence:0.98, evidence:[
      {metric:'days_of_cover',value:item.daysOfCover,unit:'days',source:'inventory_engine'},
      {metric:'reorder_point',value:item.reorderPoint,unit:'units',source:'inventory_engine'},
      {metric:'recommended_order',value:item.recommendedOrder,unit:'units',source:'inventory_engine'},
    ]}];
    if (item.classification === 'frozen') return [{ id:`liquidity:${item.sku}`, severity:'medium', title:`مخزون راكد يحتاج خطة تصريف ${item.sku}`, action:'راجع السعر، الحزمة، القناة البيعية أو العرض الترويجي قبل شراء كمية إضافية.', confidence:0.92, evidence:[{metric:'days_of_cover',value:item.daysOfCover,unit:'days',source:'inventory_engine'}]}];
    return [];
  });
}
