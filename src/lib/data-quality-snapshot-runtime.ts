import { supabase } from './supabase';

export interface QualityIssue { entity: string; field: string; issue: string; count: number; severity: 'critical' | 'warning' | 'info'; }
export interface EntityQuality { name: string; total: number; issues: number; score: number; icon: 'users' | 'package' | 'warehouse' | 'receipt'; }
export interface DataQualitySnapshot { status: 'OK' | 'EMPTY'; tenant_id: string; entities: EntityQuality[]; issues: QualityIssue[]; }

export async function fetchDataQualitySnapshot(): Promise<DataQualitySnapshot> {
  const { data, error } = await supabase.rpc('get_data_quality_snapshot');
  if (error) throw error;
  if (!data || (data.status !== 'OK' && data.status !== 'EMPTY') || !Array.isArray(data.entities) || !Array.isArray(data.issues)) {
    throw new Error('DATA_QUALITY_SNAPSHOT_INVALID');
  }
  if (data.status === 'EMPTY' && data.entities.some((entity: EntityQuality) => entity.total !== 0 || entity.issues !== 0 || entity.score !== 0)) {
    throw new Error('DATA_QUALITY_EMPTY_SNAPSHOT_INCONSISTENT');
  }
  return data as DataQualitySnapshot;
}
