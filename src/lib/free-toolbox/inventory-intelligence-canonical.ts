import { supabase } from '@/lib/supabase';
import type { DetailReportRow } from '@/lib/free-toolbox/grouped-report';

type Group = { id: string; name: string; members: string[] };
type SnapshotRow = {
  product_id: string;
  sku: string | null;
  product_name: string | null;
  stock_units: number | string | null;
  net_sales_units: number | string | null;
  daily_demand: number | string | null;
  group_id: string | null;
};

export type InventoryIntelligenceSource = {
  rows: DetailReportRow[];
  groups: Record<string, Group>;
};

const finiteOrUnknown = (value: unknown): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : Number.NaN;
};

export async function fetchInventoryIntelligenceSource(): Promise<InventoryIntelligenceSource> {
  const { data, error } = await supabase.rpc('inventory_intelligence_snapshot', {
    p_as_of: new Date().toISOString().slice(0, 10),
    p_days: 180,
  });
  if (error) throw error;

  const rows: DetailReportRow[] = [];
  const groups: Record<string, Group> = {};

  for (const item of (data ?? []) as SnapshotRow[]) {
    if (!item.sku?.trim() || !item.product_name?.trim()) continue;

    const groupId = item.group_id ?? undefined;
    if (groupId) {
      const group = groups[groupId] ?? {
        id: groupId,
        name: `مجموعة ${groupId.slice(0, 8)}`,
        members: [],
      };
      if (!group.members.includes(item.sku.trim())) group.members.push(item.sku.trim());
      groups[groupId] = group;
    }

    rows.push({
      sku: item.sku.trim(),
      name: item.product_name.trim(),
      groupId,
      stockUnits: finiteOrUnknown(item.stock_units),
      requestedUnits: Number.NaN,
      netSalesUnits: finiteOrUnknown(item.net_sales_units),
      dailyDemand: finiteOrUnknown(item.daily_demand),
    });
  }

  return { rows, groups };
}
