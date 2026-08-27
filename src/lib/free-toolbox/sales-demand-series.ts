import { supabase } from '@/lib/supabase';

export interface DemandPoint { date: string; quantity: number; sales: number }
export interface ProductDemandSeries { productId: string; sku: string; name: string; points: DemandPoint[]; totalQuantity: number; averageDaily: number; peakDaily: number; trend: number }

type CanonicalDemandSnapshot = ProductDemandSeries[];

export async function fetchProductDemandSeries(days = 180, asOf = new Date()): Promise<ProductDemandSeries[]> {
  if (!Number.isFinite(days) || days <= 0) throw new Error('Invalid demand analysis window');
  const asOfDate = asOf instanceof Date && Number.isFinite(asOf.getTime()) ? asOf.toISOString().slice(0, 10) : null;
  if (!asOfDate) throw new Error('Invalid demand analysis as-of date');

  const { data, error } = await supabase.rpc('get_demand_velocity_snapshot', {
    p_days: Math.floor(days),
    p_as_of: asOfDate,
  });
  if (error) throw error;
  if (data == null) return [];
  if (!Array.isArray(data)) throw new Error('Invalid demand velocity snapshot contract');

  return data as CanonicalDemandSnapshot;
}
