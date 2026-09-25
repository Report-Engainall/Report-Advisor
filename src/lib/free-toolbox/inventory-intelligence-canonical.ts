import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';
import { fetchProductDemandSeries } from './sales-demand-series';
import type { DetailReportRow } from './grouped-report';

type Product = { id: string; sku: string; name: string };
type Member = { group_id: string; sku: string };

function requiredRows<T extends Record<string, unknown>>(value: unknown, label: string): T[] {
  if (!Array.isArray(value)) throw new Error(`REPORT_DATA_UNAVAILABLE: inventory ${label} missing`);
  if (value.some((item) => item === null || typeof item !== 'object' || Array.isArray(item))) throw new Error(`REPORT_DATA_UNAVAILABLE: inventory ${label} invalid`);
  return value as T[];
}

export interface InventoryIntelligenceSource {
  rows: DetailReportRow[];
  groups: Record<string, { id: string; name: string; members: string[] }>;
}

/** Canonical application boundary for Inventory Intelligence data assembly. */
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

  const memberRows = requiredRows<Member>(members, 'group members');
  const balanceRows = requiredRows<Record<string, unknown>>(balances, 'balances');
  const productRows = requiredRows<Product>(products, 'products');
  for (const member of memberRows) if (!member.group_id?.trim() || !member.sku?.trim()) throw new Error('REPORT_DATA_UNAVAILABLE: inventory group member shape invalid');
  for (const product of productRows) if (!product.id?.trim() || !product.sku?.trim() || !product.name?.trim()) throw new Error('REPORT_DATA_UNAVAILABLE: inventory product shape invalid');
  for (const balance of balanceRows) if (typeof balance.product_id !== 'string' || !balance.product_id.trim() || !Number.isFinite(Number(balance.quantity))) throw new Error('REPORT_DATA_UNAVAILABLE: inventory balance shape invalid');

  const productById = new Map(productRows.map((p: Product) => [p.id, p]));
  const demandByProduct = new Map(demand.map((item) => [item.productId, item]));
  const groups: InventoryIntelligenceSource['groups'] = {};
  for (const member of memberRows) {
    const group = groups[member.group_id] ?? { id: member.group_id, name: `مجموعة ${member.group_id.slice(0, 8)}`, members: [] };
    group.members.push(member.sku);
    groups[member.group_id] = group;
  }

  const skuToGroup = new Map<string, string>();
  for (const group of Object.values(groups)) for (const sku of group.members) skuToGroup.set(sku, group.id);

  const stockByProduct = new Map<string, number>();
  for (const balance of balanceRows) {
    const quantity = Number(balance.quantity);
    if (!Number.isFinite(quantity)) continue;
    stockByProduct.set(balance.product_id, (stockByProduct.get(balance.product_id) ?? 0) + quantity);
  }

  const rows: DetailReportRow[] = [];
  for (const [productId, stock] of stockByProduct) {
    const product = productById.get(productId);
    if (!product) continue;
    const series = demandByProduct.get(productId);
    rows.push({
      sku: product.sku,
      name: product.name,
      groupId: skuToGroup.get(product.sku),
      stockUnits: stock,
      requestedUnits: Number.NaN,
      netSalesUnits: series?.totalQuantity ?? Number.NaN,
      dailyDemand: series?.averageDaily ?? Number.NaN,
    });
  }

  return { rows, groups };
}
