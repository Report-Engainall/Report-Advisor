import { supabase } from './supabase';

export interface QualityIssue { entity: string; field: string; issue: string; count: number; severity: 'critical' | 'warning' | 'info'; }
export interface EntityQuality { name: string; total: number; issues: number; score: number; icon: 'users' | 'package' | 'warehouse' | 'receipt'; }
export interface DataQualitySnapshot { status: 'OK' | 'EMPTY'; tenant_id: string; entities: EntityQuality[]; issues: QualityIssue[]; }

export async function fetchDataQualitySnapshot(): Promise<DataQualitySnapshot> {
  const { data, error } = await supabase.rpc('get_data_quality_snapshot');
  if (error) throw error;
  if (!data || (data.status !== 'OK' && data.status !== 'EMPTY') || typeof data.tenant_id !== 'string' || data.tenant_id.length === 0 || !Array.isArray(data.entities) || !Array.isArray(data.issues)) {
    throw new Error('DATA_QUALITY_SNAPSHOT_INVALID');
  }
  for (const entity of data.entities as EntityQuality[]) {
    if (!entity || typeof entity.name !== 'string' || !Number.isFinite(entity.total) || !Number.isFinite(entity.issues) || !Number.isFinite(entity.score) || entity.total < 0 || entity.issues < 0 || entity.issues > entity.total || entity.score < 0 || entity.score > 100) {
      throw new Error('DATA_QUALITY_ENTITY_INVALID');
    }
  }
  for (const issue of data.issues as QualityIssue[]) {
    if (!issue || typeof issue.entity !== 'string' || typeof issue.field !== 'string' || typeof issue.issue !== 'string' || !Number.isFinite(issue.count) || issue.count < 0 || !['critical', 'warning', 'info'].includes(issue.severity)) {
      throw new Error('DATA_QUALITY_ISSUE_INVALID');
    }
  }
  if (data.status === 'EMPTY' && (data.entities.length !== 0 || data.issues.length !== 0)) {
    throw new Error('DATA_QUALITY_EMPTY_SNAPSHOT_INCONSISTENT');
  }
  return data as DataQualitySnapshot;
}
