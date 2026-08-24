export type DemandHorizon = {
  days: number;
  requests: number;
  normalizedDailyRequests: number;
  label: string;
};

export function normalizeDemandHorizon(requests: number, days: number): DemandHorizon {
  assertPositiveDays(days, 'SOURCE_HORIZON_DAYS');
  const safeRequests = Number.isFinite(requests) && requests >= 0 ? requests : 0;
  return {
    days,
    requests: safeRequests,
    normalizedDailyRequests: safeRequests / days,
    label: `${days}-DAY_HORIZON`,
  };
}

export function projectDemand(requests: number, sourceDays: number, targetDays: number): number {
  assertPositiveDays(targetDays, 'TARGET_HORIZON_DAYS');
  return normalizeDemandHorizon(requests, sourceDays).normalizedDailyRequests * targetDays;
}

export function assertPositiveDays(days: number, field: string): void {
  if (!Number.isFinite(days) || days <= 0) throw new Error(`${field}_REQUIRED`);
}
