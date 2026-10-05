import { supabase, resolveCurrentCompanyId } from '../supabase.ts';
import type { CalculationResult } from './calculation-capability-registry.ts';

export type CalculationPersistenceStatus =
  | 'VERIFIED'
  | 'NOT_RUN'
  | 'PERSISTENCE_FAILED'
  | 'READBACK_FAILED'
  | 'READBACK_MISMATCH';

export type CalculationPersistenceResult = {
  status: CalculationPersistenceStatus;
  persistedCount: number;
  readBackCount: number;
  calculationIds: string[];
  mismatches: string[];
};

type PersistInput = {
  tenantId: string;
  reportExecutionJobId: string;
  sourceHash: string;
  evidenceSnapshotId?: string | null;
  evidencePassportId?: string | null;
  archetypeId: string;
  profileVersion: number;
  calculations: CalculationResult[];
};

export async function persistAndReadBackCalculations(input: PersistInput): Promise<CalculationPersistenceResult> {
  if (!input.calculations.length) {
    return { status: 'NOT_RUN', persistedCount: 0, readBackCount: 0, calculationIds: [], mismatches: [] };
  }

  const currentCompanyId = await resolveCurrentCompanyId();
  if (!currentCompanyId || currentCompanyId !== input.tenantId) throw new Error('CALCULATION_PERSISTENCE_TENANT_MISMATCH');

  const rows = input.calculations.map((calculation) => ({
    company_id: input.tenantId,
    report_execution_job_id: input.reportExecutionJobId,
    source_hash: input.sourceHash,
    evidence_snapshot_id: input.evidenceSnapshotId ?? null,
    evidence_passport_id: input.evidencePassportId ?? null,
    archetype_id: input.archetypeId,
    profile_version: input.profileVersion,
    metric_id: calculation.metricId,
    name: calculation.name,
    formula: calculation.formula,
    availability_state: calculation.availabilityState,
    value: typeof calculation.value === 'number' && Number.isFinite(calculation.value) ? calculation.value : null,
    unit: calculation.unit ?? null,
    sample_size: calculation.sampleSize,
    usable_sample: calculation.usableSample,
    source_fields: calculation.sourceFields,
    evidence: calculation.evidence,
    confidence: calculation.confidence,
    limitation: calculation.limitation,
    details: calculation.details ?? {},
    updated_at: new Date().toISOString(),
  }));

  const upsert = await supabase
    .from('report_intelligence_calculations')
    .upsert(rows, {
      onConflict: 'company_id,report_execution_job_id,source_hash,archetype_id,profile_version,metric_id',
    })
    .select('id,metric_id,availability_state,value,confidence');

  if (upsert.error) {
    return {
      status: 'PERSISTENCE_FAILED',
      persistedCount: 0,
      readBackCount: 0,
      calculationIds: [],
      mismatches: [upsert.error.message],
    };
  }

  const readBack = await supabase
    .from('report_intelligence_calculations')
    .select('id,metric_id,availability_state,value,confidence')
    .eq('company_id', input.tenantId)
    .eq('report_execution_job_id', input.reportExecutionJobId)
    .eq('source_hash', input.sourceHash)
    .eq('archetype_id', input.archetypeId)
    .eq('profile_version', input.profileVersion);

  if (readBack.error) {
    return {
      status: 'READBACK_FAILED',
      persistedCount: upsert.data?.length ?? 0,
      readBackCount: 0,
      calculationIds: (upsert.data ?? []).map((row) => String(row.id)),
      mismatches: [readBack.error.message],
    };
  }

  const persisted = new Map((upsert.data ?? []).map((row) => [String(row.metric_id), row]));
  const loaded = new Map((readBack.data ?? []).map((row) => [String(row.metric_id), row]));
  const mismatches: string[] = [];

  for (const calculation of input.calculations) {
    const stored = loaded.get(calculation.metricId);
    if (!stored) {
      mismatches.push(calculation.metricId + ':MISSING_READBACK');
      continue;
    }
    const expectedState = calculation.availabilityState;
    const actualState = String(stored.availability_state ?? '');
    if (actualState !== expectedState) mismatches.push(calculation.metricId + ':STATE');
    const expectedValue = typeof calculation.value === 'number' && Number.isFinite(calculation.value) ? calculation.value : null;
    const actualValue = stored.value == null ? null : Number(stored.value);
    if (expectedValue == null ? actualValue != null : actualValue == null || Math.abs(actualValue - expectedValue) > 0.0000001) {
      mismatches.push(calculation.metricId + ':VALUE');
    }
  }

  return {
    status: mismatches.length ? 'READBACK_MISMATCH' : 'VERIFIED',
    persistedCount: persisted.size,
    readBackCount: loaded.size,
    calculationIds: [...loaded.values()].map((row) => String(row.id)),
    mismatches,
  };
}
