export type DemandHorizon = { days: number; requests: number; normalizedDailyRequests: number; label: string };

export function normalizeDemandHorizon(requests: number, days: number): DemandHorizon {
  const safeDays = Number.isFinite(days) && days > 0 ? days : 30;
  const safeRequests = Number.isFinite(requests) && requests >= 0 ? requests : 0;
  return {
    days: safeDays,
    requests: safeRequests,
    normalizedDailyRequests: safeRequests / safeDays,
    label: `${safeDays}-DAY_HORIZON`,
  };
}

export function projectDemand(requests: number, sourceDays: number, targetDays: number): number {
  const normalized = normalizeDemandHorizon(requests, sourceDays);
  const days = Number.isFinite(targetDays) && targetDays > 0 ? targetDays : 30;
  return normalized.normalizedDailyRequests * days;
}
