export interface CustomerProductPoint {
  customerId: string;
  productKey: string;
  period: string;
  requestedUnits: number;
  fulfilledUnits: number;
  revenue?: number;
}

export interface CustomerProductObservation {
  customerId: string;
  productKey: string;
  date: string;
  quantity: number;
  fulfilledQuantity?: number;
}

export interface CustomerProductSignal extends CustomerProductContinuitySignal {
  totalQuantity: number;
  orders: number;
  lastQuantity: number;
  previousQuantity: number;
  trend: 'rising' | 'falling' | 'stable';
  fulfilledQuantity: number;
  unfulfilledQuantity: number;
  lastSeen: string;
  status: 'active' | 'at_risk' | 'lapsed';
}

export interface CustomerProductContinuitySignal {
  customerId: string;
  productKey: string;
  periods: number;
  totalRequested: number;
  totalFulfilled: number;
  lostUnits: number;
  activePeriods: number;
  lastActivePeriod?: string;
  previousActivePeriod?: string;
  continuity: 'active' | 'declining' | 'lapsed' | 'new' | 'insufficient_data';
  fillRate: number;
  evidence: string[];
  totalQuantity: number;
  orders: number;
  lastQuantity: number;
  previousQuantity: number;
  trend: 'rising' | 'falling' | 'stable';
  fulfilledQuantity: number;
  unfulfilledQuantity: number;
  lastSeen: string;
  status: 'active' | 'at_risk' | 'lapsed';
}

const nonNegative = (value: number | undefined): number => Number.isFinite(value) ? Math.max(0, value as number) : 0;

export function analyzeCustomerProductContinuity(rows: CustomerProductPoint[]): CustomerProductContinuitySignal[] {
  const groups = new Map<string, CustomerProductPoint[]>();
  for (const row of rows) {
    const key = `${row.customerId}::${row.productKey}`;
    const items = groups.get(key) ?? [];
    items.push(row);
    groups.set(key, items);
  }

  return [...groups.entries()].map(([key, items]) => {
    const ordered = [...items].sort((a, b) => a.period.localeCompare(b.period));
    const requested = ordered.reduce((sum, row) => sum + nonNegative(row.requestedUnits), 0);
    const fulfilled = ordered.reduce((sum, row) => sum + Math.min(nonNegative(row.requestedUnits), nonNegative(row.fulfilledUnits)), 0);
    const lost = Math.max(0, requested - fulfilled);
    const active = ordered.filter(row => nonNegative(row.requestedUnits) > 0).length;
    const last = ordered.findLast(row => nonNegative(row.requestedUnits) > 0)?.period;
    const previous = [...ordered].reverse().find((row, index) => nonNegative(row.requestedUnits) > 0 && row.period !== last)?.period;

    let continuity: CustomerProductContinuitySignal['continuity'] = 'insufficient_data';
    if (active === 0) continuity = 'insufficient_data';
    else if (ordered.length === 1 || previous === undefined) continuity = 'new';
    else {
      const lastIndex = ordered.findIndex(row => row.period === last);
      const previousIndex = ordered.findIndex(row => row.period === previous);
      continuity = lastIndex - previousIndex > 1
        ? 'lapsed'
        : nonNegative(ordered.at(-1)?.requestedUnits) < nonNegative(ordered.at(-2)?.requestedUnits) * 0.7
          ? 'declining'
          : 'active';
    }

    const evidence = [`${ordered.length} periods observed`, `requested=${requested}`, `fulfilled=${fulfilled}`];
    if (lost > 0) evidence.push(`unfulfilled=${lost}`);
    if (last) evidence.push(`last_active=${last}`);

    return {
      customerId: key.split('::')[0],
      productKey: key.split('::').slice(1).join('::'),
      periods: ordered.length,
      totalRequested: requested,
      totalFulfilled: fulfilled,
      lostUnits: lost,
      activePeriods: active,
      lastActivePeriod: last,
      previousActivePeriod: previous,
      continuity,
      fillRate: requested > 0 ? fulfilled / requested : 1,
      evidence,
    };
  });
}

export function buildCustomerProductSignals(
  rows: CustomerProductObservation[],
  asOf: string,
  lapseDays = 60,
): CustomerProductSignal[] {
  const groups = new Map<string, CustomerProductObservation[]>();
  for (const row of rows) {
    const key = `${row.customerId}::${row.productKey}`;
    const items = groups.get(key) ?? [];
    items.push(row);
    groups.set(key, items);
  }

  const day = (value: string): number => new Date(value).getTime();

  return [...groups.values()].map(rowsForProduct => {
    const ordered = [...rowsForProduct].sort((a, b) => day(a.date) - day(b.date));
    const last = ordered.at(-1)!;
    const previous = ordered.at(-2);
    const totalQuantity = ordered.reduce((sum, row) => sum + nonNegative(row.quantity), 0);
    const fulfilledQuantity = ordered.reduce(
      (sum, row) => sum + Math.min(nonNegative(row.quantity), nonNegative(row.fulfilledQuantity ?? row.quantity)),
      0,
    );
    const unfulfilledQuantity = Math.max(0, totalQuantity - fulfilledQuantity);
    const delta = nonNegative(last.quantity) - nonNegative(previous?.quantity);
    const base = Math.max(1, nonNegative(previous?.quantity ?? last.quantity));
    const trendRatio = delta / base;
    const daysSinceLastSeen = Math.max(0, (day(asOf) - day(last.date)) / 86400000);
    const continuity = daysSinceLastSeen > lapseDays
      ? 'lapsed'
      : unfulfilledQuantity > 0
        ? 'declining'
        : ordered.length === 1
          ? 'new'
          : 'active';

    const evidence = [
      `${ordered.length} observations observed`,
      `requested=${totalQuantity}`,
      `fulfilled=${fulfilledQuantity}`,
      `last_seen=${last.date}`,
    ];
    if (unfulfilledQuantity > 0) evidence.push(`unfulfilled=${unfulfilledQuantity}`);

    return {
      customerId: last.customerId,
      productKey: last.productKey,
      periods: ordered.length,
      totalRequested: totalQuantity,
      totalFulfilled: fulfilledQuantity,
      lostUnits: unfulfilledQuantity,
      activePeriods: ordered.filter(row => nonNegative(row.quantity) > 0).length,
      lastActivePeriod: last.date,
      previousActivePeriod: previous?.date,
      continuity,
      fillRate: totalQuantity > 0 ? fulfilledQuantity / totalQuantity : 1,
      evidence,
      totalQuantity,
      orders: ordered.length,
      lastQuantity: nonNegative(last.quantity),
      previousQuantity: nonNegative(previous?.quantity),
      trend: trendRatio > 0.1 ? 'rising' : trendRatio < -0.1 ? 'falling' : 'stable',
      fulfilledQuantity,
      unfulfilledQuantity,
      lastSeen: last.date,
      status: daysSinceLastSeen > lapseDays ? 'lapsed' : unfulfilledQuantity > 0 ? 'at_risk' : 'active',
    };
  });
}
