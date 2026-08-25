import { supabase } from '@/lib/supabase';
import { fetchDataQualityDatasets } from '@/lib/data-quality-queries';
import { planDocumentIntelligence, type DocumentExtractionEnvelope } from '@/lib/documentIntelligenceGateway';
import type { DocumentProfile } from '@/lib/free-toolbox/document-route';
import type { EvidenceLedger } from '@/lib/free-toolbox/evidence-ledger';
import type { DecisionEvidenceRecord } from '@/lib/product-intelligence/decision-evidence-ledger';
import type { ReportSnapshot } from '@/lib/import-pipeline/report-snapshot-history';
import type { ReconciliationResult } from '@/lib/report-intelligence/reconciliation-engine';
import type { EvidenceNode, EvidenceTrail, DecisionReplayModel, ReportSnapshotModel } from '@/lib/secondary-evidence-ux';
import type { ControlPlaneReadModel, ControlPlaneSignal, DataQualityReadModel, DocumentWorkspaceReadModel, EvidenceRef, ReconciliationReadModel } from '@/lib/secondary-batch02';

const ref = (id: string, label: string, source_id?: string): EvidenceRef => ({ id, label, sourceRef: source_id ?? id, source_id, status: 'READY' });

export async function fetchSecondaryDataQualityReadModel(): Promise<DataQualityReadModel> {
  try {
    await fetchDataQualityDatasets();
    return {
      status: 'READY',
      metrics: ['Completeness','Uniqueness','Validity','Consistency','Freshness','Reconciliation','Anomalies'].map(dimension => ({
        dimension: dimension as DataQualityReadModel['metrics'][number]['dimension'],
        status: 'UNKNOWN',
        source: ref('data-quality-queries', 'Tenant-native Data Quality query boundary'),
        reason: 'Authoritative datasets are reachable, but this query boundary does not expose an authoritative quality score. No client-side score is substituted.'
      })),
      issues: [],
      generatedAt: new Date().toISOString(),
      source: ref('data-quality-queries', 'Tenant-native Data Quality query boundary')
    };
  } catch {
    return { status: 'ERROR', metrics: [], issues: [], generatedAt: new Date().toISOString() };
  }
}

function runStatus(status?: string): ControlPlaneSignal['status'] {
  if (status === 'failed') return 'FAILED';
  if (status === 'blocked' || status === 'proposed') return 'WARNING';
  if (status === 'approved' || status === 'executed' || status === 'rolled_back') return 'HEALTHY';
  return 'UNKNOWN';
}

export async function fetchSecondaryControlPlaneReadModel(): Promise<ControlPlaneReadModel> {
  const [snapshots, runs, lineage, drift] = await Promise.all([
    supabase.from('business_state_snapshots').select('id,observed_at,source_version,quality_score').order('observed_at', { ascending: false }).limit(1),
    supabase.from('control_plane_optimization_runs').select('id,status,created_at,completed_at').order('created_at', { ascending: false }).limit(1),
    supabase.from('executive_kpi_lineage').select('id,observed_at,quality,evidence_hash').order('observed_at', { ascending: false }).limit(1),
    supabase.from('control_plane_drift_events').select('id,status,severity,detected_at').order('detected_at', { ascending: false }).limit(1)
  ]);
  const firstError = snapshots.error || runs.error || lineage.error || drift.error;
  if (firstError) return { status: 'ERROR', signals: [], generatedAt: new Date().toISOString() };
  const latestSnapshot = snapshots.data?.[0];
  const latestRun = runs.data?.[0];
  const latestLineage = lineage.data?.[0];
  const latestDrift = drift.data?.[0];
  const signals: ControlPlaneSignal[] = [
    { area: 'Data Freshness', status: latestSnapshot ? 'HEALTHY' : 'UNKNOWN', detail: latestSnapshot ? `Latest snapshot: ${latestSnapshot.observed_at}` : 'No snapshot evidence.', source: ref('business_state_snapshots','business_state_snapshots') },
    { area: 'Jobs', status: runStatus(latestRun?.status), detail: latestRun ? `Latest run: ${latestRun.status}` : 'No run evidence.', source: ref('control_plane_optimization_runs','control_plane_optimization_runs') },
    { area: 'Failed Tasks', status: latestRun?.status === 'failed' ? 'FAILED' : latestRun ? 'HEALTHY' : 'UNKNOWN', detail: latestRun ? `Latest run status: ${latestRun.status}` : 'No task evidence.', source: ref('control_plane_optimization_runs','control_plane_optimization_runs') },
    { area: 'AI Provider State', status: 'NOT_CONFIGURED', detail: 'No authoritative provider-health read model in this boundary.' },
    { area: 'Storage State', status: 'NOT_CONFIGURED', detail: 'No authoritative storage-health read model in this boundary.' },
    { area: 'Workers', status: 'NOT_CONFIGURED', detail: 'No authoritative worker-health read model in this boundary.' },
    { area: 'Backups', status: 'NOT_CONFIGURED', detail: 'Backup health remains in the primary runtime boundary.' },
    { area: 'Evidence Health', status: latestLineage ? 'HEALTHY' : 'UNKNOWN', detail: latestLineage ? 'KPI lineage evidence is present.' : 'No KPI lineage evidence.', source: ref('executive_kpi_lineage','executive_kpi_lineage') },
    { area: 'System Health', status: latestDrift?.severity === 'critical' && latestDrift.status !== 'resolved' ? 'FAILED' : latestDrift ? 'WARNING' : 'UNKNOWN', detail: latestDrift ? `Latest drift: ${latestDrift.status}/${latestDrift.severity}` : 'No system-health signal.', source: ref('control_plane_drift_events','control_plane_drift_events') },
    { area: 'Imports', status: 'NOT_CONFIGURED', detail: 'Import runtime health is owned by the primary import/jobs stream.' },
    { area: 'Data Quality', status: 'UNKNOWN', detail: 'Dataset availability exists, but authoritative quality scoring is not exposed.', source: ref('data-quality-queries','Tenant-native Data Quality query boundary') }
  ];
  return { status: 'READY', signals, generatedAt: new Date().toISOString() };
}

export function documentWorkspaceFromProfile(profile: DocumentProfile): DocumentWorkspaceReadModel {
  return documentWorkspaceFromEnvelope(planDocumentIntelligence(profile));
}

export function documentWorkspaceFromEnvelope(envelope: DocumentExtractionEnvelope, fileName?: string): DocumentWorkspaceReadModel {
  const blocked = envelope.stage === 'INSUFFICIENT_BACKEND';
  return {
    status: blocked ? 'BLOCKED' : envelope.facts.length ? 'READY' : 'UNKNOWN',
    fileName,
    fields: envelope.facts.map(fact => ({ name: fact.field, value: fact.value ?? undefined, confidence: fact.confidence, status: fact.source ? 'READY' : 'UNKNOWN', sourceRef: fact.source })),
    lineage: envelope.facts.map((fact, index) => ({ id: `fact-${index}`, label: `${fact.field} <- ${fact.source}`, sourceRef: fact.source, status: fact.source ? 'READY' : 'UNKNOWN' })),
  };
}

function evidenceNode(item: EvidenceLedger['items'][number], kind: EvidenceNode['kind'], id: string, label: string, value?: string | number | null): EvidenceNode {
  const verified = Boolean(item.sourceId) && (item.confidence === undefined || item.confidence >= 0.8);
  return {
    kind,
    id,
    label,
    value,
    sourceRef: item.sourceId || undefined,
    source_id: item.sourceId || undefined,
    evidence_id: item.id,
    status: !item.sourceId ? 'unknown' : verified ? 'verified' : 'partial'
  };
}

export function evidenceTrailFromLedger(ledger: EvidenceLedger): EvidenceTrail {
  if (!ledger.items.length) return { nodes: [], status: 'EMPTY', message: 'No evidence entries were supplied by the authoritative ledger.' };
  const nodes: EvidenceNode[] = [];
  ledger.items.forEach((item, index) => {
    if (!item.sourceId) {
      nodes.push({ kind: 'file', id: `unknown-source:${index}`, label: 'SOURCE UNAVAILABLE', status: 'unknown' });
      return;
    }
    const id = item.id ?? `${item.sourceId}:${index}`;
    nodes.push(evidenceNode(item, 'file', item.sourceId, item.sourceId));
    if (item.page !== undefined) nodes.push(evidenceNode(item, 'page', `${id}:page:${item.page}`, `Page ${item.page}`));
    if (item.raw !== undefined) nodes.push(evidenceNode(item, 'extracted', `${id}:extracted`, item.field ?? 'Extracted value', item.raw));
    if (item.normalized !== undefined) nodes.push(evidenceNode(item, 'normalized', `${id}:normalized`, item.field ?? 'Normalized value', typeof item.normalized === 'string' || typeof item.normalized === 'number' ? item.normalized : JSON.stringify(item.normalized)));
  });
  return { nodes, status: 'READY' };
}

export function decisionReplayFromAuthoritativeRecord(record: DecisionEvidenceRecord): DecisionReplayModel {
  const evidence = record.evidence.map((item, index): EvidenceNode => ({
    kind: 'extracted',
    id: `${record.decisionId}:evidence:${index}`,
    label: item.metric,
    value: item.value,
    sourceRef: item.source,
    source_id: item.source,
    decision_id: record.decisionId,
    status: item.source ? (record.confidence >= 0.8 ? 'verified' : 'partial') : 'unknown'
  }));
  return {
    decisionId: record.decisionId,
    metrics: record.evidence.map(item => ({ id: item.metric, label: item.metric, value: item.value })),
    evidence,
    trust: { decision: record.confidence * 100, overall: record.confidence * 100, explanation: record.warnings.length ? record.warnings.join('; ') : undefined },
    action: record.action,
    state: evidence.length && evidence.every(item => item.status === 'verified' || item.status === 'partial') ? 'READY' : 'UNKNOWN'
  };
}

export function reportSnapshotFromAuthoritativeSnapshot(snapshot: ReportSnapshot): ReportSnapshotModel {
  return {
    reportId: snapshot.sourceKey,
    snapshotId: snapshot.snapshotId,
    dataAsOf: snapshot.observedAt,
    generatedAt: snapshot.observedAt,
    state: 'READY'
  };
}

export function reconciliationFromAuthoritativeResult(result: ReconciliationResult, sourceRows?: number, canonicalRows?: number, source?: EvidenceRef): ReconciliationReadModel {
  const mismatchCount = result.duplicateCount + result.conflictCount + result.reversedCount;
  return {
    status: 'READY',
    sourceRows,
    canonicalRows,
    duplicates: result.duplicateCount,
    unmatchedRows: result.newCount,
    suspiciousDifferences: mismatchCount,
    failureReason: mismatchCount ? 'Authoritative reconciliation result contains non-unchanged row changes.' : undefined,
    remediation: mismatchCount ? 'Inspect authoritative row-level reconciliation reasons.' : undefined,
    source
  };
}

export function reconciliationUnknown(reason = 'No authoritative reconciliation result was supplied.'): ReconciliationReadModel {
  return { status: 'UNKNOWN', failureReason: reason, remediation: 'Connect the existing reconciliation read model; do not infer a result in the UI.' };
}
