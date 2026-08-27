import type { AlternativeGroup, AlternativeMember, AlternativeItemSnapshot, AlternativeGroupAggregate } from './alternative-groups';
import { aggregateAlternativeGroups } from './alternative-groups';

export interface AlternativeReportOptions { mode: 'detail' | 'grouped'; includeEmptyGroups?: boolean }
export interface AlternativeReportRow {
  rowType: 'item' | 'group'; id: string; label: string; memberCount: number;
  requestedUnits: number | null; stockUnits: number | null; netSalesUnits: number | null;
  avgDailyDemand: number | null; daysOfCover: number | null; fillRate: number | null;
  lostUnits: number | null; lostRevenue: number | null;
}

export function buildAlternativeReport(options: AlternativeReportOptions, groups: AlternativeGroup[], members: AlternativeMember[], items: AlternativeItemSnapshot[]): AlternativeReportRow[] {
  if (options.mode === 'detail') return items.map(i => {
    const hasDemand = i.avgDailyDemand !== null && Number.isFinite(i.avgDailyDemand);
    const hasStock = i.stockUnits !== null && Number.isFinite(i.stockUnits);
    const hasRequested = i.requestedUnits !== null && Number.isFinite(i.requestedUnits);
    const hasPrice = i.unitPrice !== null && i.unitPrice !== undefined && Number.isFinite(i.unitPrice);
    const complete = hasDemand && hasStock && hasRequested;
    const daysOfCover = complete && i.avgDailyDemand! > 0 ? i.stockUnits! / i.avgDailyDemand! : null;
    const fillRate = complete && i.requestedUnits! > 0 ? Math.max(0, Math.min(1, i.stockUnits! / i.requestedUnits!)) : null;
    const lostUnits = complete ? Math.max(0, i.requestedUnits! - i.stockUnits!) : null;
    const lostRevenue = lostUnits !== null && hasPrice ? lostUnits * Math.max(0, i.unitPrice!) : null;
    return { rowType: 'item', id: i.sku, label: i.sku, memberCount: 1, requestedUnits: i.requestedUnits, stockUnits: i.stockUnits, netSalesUnits: i.netSalesUnits, avgDailyDemand: i.avgDailyDemand, daysOfCover, fillRate, lostUnits, lostRevenue };
  });

  const aggregates = aggregateAlternativeGroups(groups, members, items);
  const rows = aggregates.map((a: AlternativeGroupAggregate) => ({ rowType: 'group' as const, id: a.groupId, label: a.groupName, memberCount: a.memberSkus.length, requestedUnits: a.requestedUnits, stockUnits: a.stockUnits, netSalesUnits: a.netSalesUnits, avgDailyDemand: a.avgDailyDemand, daysOfCover: a.daysOfCover, fillRate: a.weightedFillRate, lostUnits: a.estimatedLostUnits, lostRevenue: a.estimatedLostRevenue }));
  if (options.includeEmptyGroups) {
    const existing = new Set(rows.map(r => r.id));
    for (const g of groups.filter(g => g.active && !existing.has(g.groupId))) rows.push({ rowType: 'group', id: g.groupId, label: g.name, memberCount: members.filter(m => m.groupId === g.groupId).length, requestedUnits: null, stockUnits: null, netSalesUnits: null, avgDailyDemand: null, daysOfCover: null, fillRate: null, lostUnits: null, lostRevenue: null });
  }
  return rows;
}
