import { supabase, resolveCurrentCompanyId } from './supabase';

export type ExecutiveDecisionReport = {
  generated_at: string;
  limit: number;
  count: number;
  rows: ExecutiveDecisionReportRow[];
};
export type ExecutiveDecisionReportRow = {
  decision: { id:string; decision_key:string|null; policy_key:string|null; decision_type:string|null; status:string|null; confidence:number|null; expected_impact:number|null; created_at:string; executed_at:string|null; approved_by:string|null; approved_at:string|null; rejection_reason:string|null; evidence:Record<string,unknown>|null };
  recommendation: { id:string; category:string|null; priority:string|null; title:string|null; description:string|null; expected_impact:number|null; confidence:string|null; status:string|null; owner:string|null; deadline:string|null; impact_result:string|null; impact_measured_at:string|null; evidence_snapshot_id:string|null; metric_versions:Record<string,unknown>|null } | null;
  approval: { approved_by:string|null; approved_at:string|null; status:'APPROVED'|'REJECTED'|'PENDING' };
  work_items: Array<{ id:string; department:string|null; assignee_id:string|null; assignee_label:string|null; title:string|null; description:string|null; priority:string|null; status:string|null; due_at:string|null; started_at:string|null; completed_at:string|null; evidence_refs:unknown; expected_impact:number|null; actual_impact:number|null; created_at:string; updated_at:string }>;
  decision_outcome: { id:string; decision_fingerprint:string; evidence_snapshot_id:string|null; action_id:string|null; observed_at:string|null; label:string|null; actual_value:number|null; expected_value:number|null; impact_value:number|null; notes:string|null; observed_by:string|null } | null;
  recommendation_outcome: { id:string; recommendation_key:string; decision_id:string|null; observed_at:string|null; expected_impact:number|null; actual_impact:number|null; outcome_quality:number|null; status:string|null; evidence:unknown } | null;
  learning: { sample_size:number; correct:number; partial:number; incorrect:number; unknown:number };
};

export async function fetchExecutiveDecisionReport(limit = 50): Promise<ExecutiveDecisionReport> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('EXECUTIVE_REPORT_INVALID_LIMIT');
  const { data, error } = await supabase.rpc('get_executive_decision_report', { p_limit: limit });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: executive decision report missing');
  const row = data as Record<string,unknown>;
  return {
    generated_at: typeof row.generated_at === 'string' ? row.generated_at : new Date().toISOString(),
    limit: typeof row.limit === 'number' ? row.limit : limit,
    count: typeof row.count === 'number' ? row.count : 0,
    rows: Array.isArray(row.rows) ? row.rows as ExecutiveDecisionReportRow[] : [],
  };
}
