export type SecondaryStatus = 'LOADING' | 'EMPTY' | 'ERROR' | 'UNKNOWN' | 'BLOCKED' | 'HEALTHY' | 'WARNING' | 'FAILED' | 'NOT_CONFIGURED' | 'READY';

export type QualityDimension = 'Completeness' | 'Uniqueness' | 'Validity' | 'Consistency' | 'Freshness' | 'Reconciliation' | 'Anomalies';

export interface EvidenceRef {
  id: string;
  label: string;
  sourceRef?: string;
  source_id?: string;
  evidence_id?: string;
  snapshot_id?: string;
  lineage_id?: string;
  metric_id?: string;
  decision_id?: string;
  status?: SecondaryStatus;
}
export interface QualityMetric { dimension: QualityDimension; value?: number; status: SecondaryStatus; source?: EvidenceRef; reason?: string; }
export interface QualityIssue { id: string; owner?: string; severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; remediation?: string; status: SecondaryStatus; source?: EvidenceRef; history?: Array<{ at: string; status: string; source?: EvidenceRef }>; }
export interface DataQualityReadModel { status: SecondaryStatus; metrics: QualityMetric[]; issues: QualityIssue[]; generatedAt?: string; source?: EvidenceRef; }

export type ControlPlaneArea = 'Imports' | 'Jobs' | 'Data Freshness' | 'Data Quality' | 'Failed Tasks' | 'AI Provider State' | 'Storage State' | 'Workers' | 'Backups' | 'Evidence Health' | 'System Health';
export interface ControlPlaneSignal { area: ControlPlaneArea; status: Extract<SecondaryStatus, 'HEALTHY' | 'WARNING' | 'FAILED' | 'UNKNOWN' | 'NOT_CONFIGURED'>; detail?: string; source?: EvidenceRef; updatedAt?: string; }
export interface ControlPlaneReadModel { status: SecondaryStatus; signals: ControlPlaneSignal[]; generatedAt?: string; }

export interface DocumentWorkspaceReadModel { status: SecondaryStatus; fileName?: string; sourceRef?: string; pages?: Array<{ id: string; label: string; text?: string; status?: SecondaryStatus }>; tables?: Array<{ id: string; label: string; rows?: number; status?: SecondaryStatus; sourceRef?: string }>; fields?: Array<{ name: string; value?: string | number; confidence?: number; status: SecondaryStatus; sourceRef?: string }>; rejectedRows?: Array<{ id: string; reason: string; sourceRef?: string }>; quarantine?: Array<{ id: string; reason: string; sourceRef?: string }>; lineage?: EvidenceRef[]; }

export interface ReconciliationReadModel { status: SecondaryStatus; sourceRows?: number; canonicalRows?: number; totals?: Array<{ label: string; source?: number; canonical?: number; delta?: number }>; duplicates?: number; missingEntities?: number; unmatchedRows?: number; suspiciousDifferences?: number; failureReason?: string; remediation?: string; source?: EvidenceRef; }

export interface SchemaDiscoveryReadModel { status: SecondaryStatus; header?: string | number; columnTypes?: Array<{ name: string; type?: string; confidence?: number }>; rows?: number; sections?: string[]; mergedCells?: number; tables?: number; suggestedMapping?: Array<{ source: string; target: string; confidence?: number }>; source?: EvidenceRef; }

export function statusLabel(status: SecondaryStatus): string { return status.replace('_', ' '); }
export function formatUnknown(value: unknown): string { return value === undefined || value === null || value === '' ? 'UNKNOWN' : String(value); }
export function trustSummary(values: Record<string, number | undefined>): { known: number; unknown: number; average?: number } {
  const entries = Object.values(values);
  const known = entries.filter(v => typeof v === 'number').length;
  const unknown = entries.length - known;
  const average = known ? entries.filter((v): v is number => typeof v === 'number').reduce((a, b) => a + b, 0) / known : undefined;
  return { known, unknown, average };
}
