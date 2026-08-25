import { supabase } from '@/lib/supabase';
import { fetchDataQualityDatasets } from '@/lib/data-quality-queries';
import { planDocumentIntelligence } from '@/lib/documentIntelligenceGateway';
import type { DocumentProfile } from '@/lib/free-toolbox/document-route';
import type { EvidenceLedger } from '@/lib/free-toolbox/evidence-ledger';
import type { EvidenceNode, EvidenceTrail } from '@/lib/secondary-evidence-ux';
import type { ControlPlaneReadModel, ControlPlaneSignal, DataQualityReadModel, DocumentWorkspaceReadModel, EvidenceRef, ReconciliationReadModel } from '@/lib/secondary-batch02';

const ref = (id: string, label: string): EvidenceRef => ({ id, label, sourceRef: id, status: 'READY' });

export async function fetchSecondaryDataQualityReadModel(): Promise<DataQualityReadModel> {
  try {
    await fetchDataQualityDatasets();
    return {
      status: 'READY',
      metrics: ['Completeness','Uniqueness','Validity','Consistency','Freshness','Reconciliation','Anomalies'].map(dimension => ({
        dimension: dimension as DataQualityReadModel['metrics'][number]['dimension'],
        status: 'UNKNOWN',
        source: ref('data-quality-queries', 'Tenant-native Data Quality query boundary'),
        reason: 'Authoritative datasets are available, but this query boundary does not expose an authoritative quality score. No client-side score is substituted.'
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
  const envelope = planDocumentIntelligence(profile);
  return {
    status: envelope.stage === 'INSUFFICIENT_BACKEND' ? 'BLOCKED' : 'READY',
    fields: envelope.facts.map(fact => ({ name: fact.field, value: fact.value ?? undefined, confidence: fact.confidence, status: 'READY', sourceRef: fact.source })),
    lineage: envelope.facts.map((fact, index) => ({ id: `fact-${index}`, label: `${fact.field} <- ${fact.source}`, sourceRef: fact.source, status: 'verified' }))
  };
}

export function evidenceTrailFromLedger(ledger: EvidenceLedger): EvidenceTrail {
  if (!ledger.items.length) return { nodes: [], status: 'EMPTY', message: 'No evidence entries were supplied by the authoritative ledger.' };
  const nodes: EvidenceNode[] = [];
  ledger.items.forEach((item, index) => {
    const id = item.id ?? `${item.sourceId}:${index}`;
    nodes.push({ kind: 'file', id: item.sourceId, label: item.sourceId, sourceRef: item.sourceId, status: 'verified' });
    if (item.page !== undefined) nodes.push({ kind: 'page', id: `${id}:page:${item.page}`, label: `Page ${item.page}`, sourceRef: item.sourceId, status: 'verified' });
    if (item.raw !== undefined) nodes.push({ kind: 'extracted', id: `${id}:extracted`, label: item.field ?? 'Extracted value', value: item.raw, sourceRef: item.sourceId, status: item.confidence === undefined ? 'unknown' : item.confidence >= 0.8 ? 'verified' : 'partial' });
    if (item.normalized !== undefined) nodes.push({ kind: 'normalized', id: `${id}:normalized`, label: item.field ?? 'Normalized value', value: typeof item.normalized === 'string' || typeof item.normalized === 'number' ? item.normalized : JSON.stringify(item.normalized), sourceRef: item.sourceId, status: 'verified' });
  });
  return { nodes, status: 'READY' };
}

export function reconciliationUnknown(reason = 'No authoritative reconciliation result was supplied.'): ReconciliationReadModel {
  return { status: 'UNKNOWN', failureReason: reason, remediation: 'Connect the existing reconciliation read model; do not infer a result in the UI.' };
}
