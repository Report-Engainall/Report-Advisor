import { supabase } from './supabase';

export type QualityIssue = { entity: string; field: string; issue: string; count: number; severity: 'critical' | 'warning' | 'info' };
export type EntityQuality = { name: string; total: number; issues: number; score: number; icon: 'users' | 'package' | 'warehouse' | 'receipt' };
export type DataQualitySnapshot = {
  status: 'NO_DATA' | 'CALCULATED';
  data_status: 'NO_DATA' | 'CALCULATED';
  total_records: number;
  total_issues: number;
  overall_score: number;
  entities: EntityQuality[];
  issues: QualityIssue[];
  as_of: string;
};

/**
 * Canonical adapter for data-quality business truth.
 * The database derives tenant authority from current_company_id(); no tenant
 * identifier is accepted or sent by the browser, and no source collections
 * are transferred for client-side aggregation.
 */
export async function fetchDataQualitySnapshot(): Promise<DataQualitySnapshot> {
  const { data, error } = await supabase.rpc('get_data_quality_snapshot');
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: canonical data-quality snapshot missing');
  const row = data as Record<string, unknown>;
  return {
    status: row.status === 'NO_DATA' ? 'NO_DATA' : 'CALCULATED',
    data_status: row.data_status === 'NO_DATA' ? 'NO_DATA' : 'CALCULATED',
    total_records: Number(row.total_records ?? 0),
    total_issues: Number(row.total_issues ?? 0),
    overall_score: Number(row.overall_score ?? 100),
    entities: Array.isArray(row.entities) ? row.entities as EntityQuality[] : [],
    issues: Array.isArray(row.issues) ? row.issues as QualityIssue[] : [],
    as_of: String(row.as_of ?? ''),
  };
}
