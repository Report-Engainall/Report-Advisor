export type ExecutiveReportFreshness = {
  generatedAt: string;
  asOf: string;
  source: 'executive_decision_read_model';
  status: 'LIVE_READ_MODEL' | 'EMPTY' | 'UNAVAILABLE';
};

export function buildExecutiveReportFreshness(generatedAt: string, asOf: string, hasRows: boolean): ExecutiveReportFreshness {
  return {
    generatedAt,
    asOf,
    source: 'executive_decision_read_model',
    status: hasRows ? 'LIVE_READ_MODEL' : 'EMPTY',
  };
}
