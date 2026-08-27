import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';
import { fetchProductDemandSeries, type ProductDemandSeries } from '@/lib/free-toolbox/sales-demand-series';
import type { DetailReportRow } from '@/lib/free-toolbox/grouped-report';

type Group = { id: string; name: string; members: string[] };
type MemberRow = { group_id: string; sku: string };
type BalanceRow = { product_id: string; quantity: number | string | null };
type ProductRow = { id: string; sku: string | null; name: string | null };

export type InventoryIntelligenceSource = {
  rows: DetailReportRow[];
  groups: Record<string, Group>;
};

const finiteQuantity = (value: unknown): number | null => {
  const quantity = Number(value);
  return Number.isFinite(quantity) ? quantity : null;
};

export async function fetchInventoryIntelligenceSource(): Promise<InventoryIntelligenceSource> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED: لا يمكن تحميل ذكاء المخزون بدون شركة مصادق عليها.');

  const [{ data: members, error: memberError }, { data: balances, error: balanceError }, { data: products, error: productError }, demand] = await Promise.all([
    supabase.from('alternative_item_group_members').select('group_id,sku').eq('company_id', companyId),
    supabase.from('inventory_balances').select('product_id,quantity').eq('company_id', companyId),
    supabase.from('products').select('id,sku,name').eq('company_id', companyId),
    fetchProductDemandSeries(180),
  ]);

  if (memberError || balanceError || productError) throw memberError || balanceError || productError;

  const groupMap: Record<string, Group> = {};
  for (const member of (members ?? []) as MemberRow[]) {
    const group = groupMap[member.group_id] ?? {
      id: member.group_id,
      name: `مجموعة ${member.group_id.slice(0, 8)}`,
      members: [],
    };
    group.members.push(member.sku);
    groupMap[member.group_id] = group;
  }

  const skuToGroup = new Map<string, string>();
  for (const group of Object.values(groupMap)) {
    for (const sku of group.members) skuToGroup.set(sku, group.id);
  }

  const productById = new Map<string, ProductRow>();
  for (const product of (products ?? []) as ProductRow[]) {
    if (product.sku?.trim() && product.name?.trim()) productById.set(product.id, product);
  }

  const stockByProduct = new Map<string, number>();
  for (const balance of (balances ?? []) as BalanceRow[]) {
    const quantity = finiteQuantity(balance.quantity);
    if (quantity === null) continue;
    stockByProduct.set(balance.product_id, (stockByProduct.get(balance.product_id) ?? 0) + quantity);
  }

  const demandByProduct = new Map<string, ProductDemandSeries>(demand.map((item) => [item.productId, item]));
  const rows: DetailReportRow[] = [];
  for (const [productId, stockUnits] of stockByProduct) {
    const product = productById.get(productId);
    if (!product?.sku || !product.name) continue;
    const demandPoint = demandByProduct.get(productId);
    rows.push({
      sku: product.sku,
      name: product.name,
      groupId: skuToGroup.get(product.sku),
      stockUnits,
      requestedUnits: Number.NaN,
      netSalesUnits: demandPoint?.totalQuantity ?? Number.NaN,
      dailyDemand: demandPoint?.averageDaily ?? Number.NaN,
    });
  }

  return { rows, groups: groupMap };
}
