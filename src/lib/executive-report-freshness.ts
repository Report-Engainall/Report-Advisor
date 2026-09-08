export type ExecutiveReportFreshness = {
  generatedAt: string;
  asOf: string;
  source: 'executive_decision_read_model';
  status: 'LIVE_READ_MODEL' | 'EMPTY' | 'UNAVAILABLE';
};

export function buildExecutiveReportFreshness(generatedAt: string, asOf: string, hasRows: boolean): ExecutiveReportFreshness {
  const generatedMs = Date.parse(generatedAt);
  const asOfMs = Date.parse(asOf);
  const validGenerated = Number.isFinite(generatedMs);
  const validAsOf = Number.isFinite(asOfMs);
  const normalizedGenerated = validGenerated ? generatedAt : new Date().toISOString();
  const normalizedAsOf = validAsOf ? asOf : normalizedGenerated;
  return {
    generatedAt: normalizedGenerated,
    asOf: normalizedAsOf,
    source: 'executive_decision_read_model',
    status: hasRows ? 'LIVE_READ_MODEL' : 'EMPTY',
  };
}
