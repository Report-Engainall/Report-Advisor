export type ReportKind =
  | 'executive' | 'management' | 'sales' | 'procurement' | 'warehouse'
  | 'finance' | 'audit' | 'board_pack' | 'daily_brief' | 'weekly_review' | 'monthly_review';

export type ReportSectionKind =
  | 'kpi' | 'chart' | 'table' | 'evidence' | 'risk' | 'recommendation'
  | 'decision' | 'task' | 'forecast' | 'commentary';

export type TrustState = 'unknown' | 'unverified' | 'trusted' | 'certified' | 'blocked';

export interface ReportMetricRef {
  metricId: string;
  metricVersion: string;
  value: number | string | null;
  dataAsOf: string;
  freshnessSeconds?: number;
  trust: TrustState;
}

export interface ReportEvidenceRef {
  evidenceId: string;
  sourceId: string;
  excerpt?: string;
  trust: TrustState;
}

export interface ReportRecommendation {
  id: string;
  title: string;
  rationale: string;
  evidenceIds: string[];
  metricIds: string[];
}

export interface ReportDecision {
  id: string;
  title: string;
  status: 'proposed' | 'approved' | 'rejected' | 'expired';
  recommendationIds: string[];
}

export interface ReportTask {
  id: string;
  title: string;
  role: string;
  department: string;
  dueAt?: string;
  slaMinutes?: number;
  status: 'pending' | 'in_progress' | 'done' | 'blocked';
  evidenceIds: string[];
}

export interface ReportOutcome {
  id: string;
  taskId?: string;
  expectedImpact?: number;
  actualImpact?: number;
  measuredAt?: string;
  status: 'pending' | 'measured' | 'failed';
}

export interface ReportSnapshot {
  reportId: string;
  snapshotId: string;
  metricVersions: Record<string, string>;
  ruleVersions: Record<string, string>;
  mappingVersions: Record<string, string>;
  filters: Record<string, string | number | boolean | null>;
  evidenceReferences: string[];
  generatedAt: string;
  dataAsOf: string;
  fingerprint: string;
}

export interface ReportSection {
  id: string;
  kind: ReportSectionKind;
  title: string;
  order: number;
  payload: unknown;
}

/** Canonical report projection. It consumes truth; it never calculates metric truth. */
export interface ReportIntelligenceModel {
  id: string;
  version: string;
  kind: ReportKind;
  title: string;
  period: { from: string; to: string };
  dataAsOf: string;
  generatedAt: string;
  executiveSummary?: string;
  businessHealth?: { score: number; trust: TrustState; rationale: string };
  criticalIssues: string[];
  opportunities: string[];
  metrics: ReportMetricRef[];
  evidence: ReportEvidenceRef[];
  recommendations: ReportRecommendation[];
  alternatives: ReportRecommendation[];
  decisions: ReportDecision[];
  approvals: string[];
  tasks: ReportTask[];
  expectedImpact?: number;
  outcomes: ReportOutcome[];
  actionRegister: string[];
  sections: ReportSection[];
}

export function validateReportProjection(report: ReportIntelligenceModel): void {
  if (!report.id || !report.version || !report.dataAsOf) {
    throw new Error('report identity/data-as-of required');
  }
  const evidenceIds = new Set(report.evidence.map((e) => e.evidenceId));
  for (const metric of report.metrics) {
    if (!metric.metricId || !metric.metricVersion) throw new Error('metric provenance required');
    if (metric.trust === 'blocked') throw new Error('blocked metric cannot enter a report projection');
  }
  for (const recommendation of report.recommendations) {
    for (const evidenceId of recommendation.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) throw new Error('recommendation references missing evidence');
    }
  }
}

export function createReportFingerprint(input: Omit<ReportSnapshot, 'fingerprint'>): string {
  const canonical = JSON.stringify({
    reportId: input.reportId,
    snapshotId: input.snapshotId,
    metricVersions: Object.entries(input.metricVersions).sort(),
    ruleVersions: Object.entries(input.ruleVersions).sort(),
    mappingVersions: Object.entries(input.mappingVersions).sort(),
    filters: Object.entries(input.filters).sort(),
    evidenceReferences: [...input.evidenceReferences].sort(),
    generatedAt: input.generatedAt,
    dataAsOf: input.dataAsOf,
  });
  let hash = 2166136261;
  for (let i = 0; i < canonical.length; i += 1) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
