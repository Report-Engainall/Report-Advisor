import { supabase } from './supabase';

export interface QualityIssue { entity: string; field: string; issue: string; count: number; severity: 'critical' | 'warning' | 'info'; }
export interface EntityQuality { name: string; total: number; issues: number; score: number; icon: 'users' | 'package' | 'warehouse' | 'receipt'; }
export interface DataQualitySnapshot { status: 'OK'; tenant_id: string; entities: EntityQuality[]; issues: QualityIssue[]; }

export async function fetchDataQualitySnapshot(): Promise<DataQualitySnapshot> {
  const { data, error } = await supabase.rpc('get_data_quality_snapshot');
  if (error) throw error;
  if (!data || data.status !== 'OK' || !Array.isArray(data.entities) || !Array.isArray(data.issues)) {
    throw new Error('DATA_QUALITY_SNAPSHOT_INVALID');
  }
  return data as DataQualitySnapshot;
}
