import { supabase } from './supabase';
import type { Recommendation, Alert } from './types';

export interface DashboardKPIs { totalSales:number|null; totalCost:number|null; grossProfit:number|null; grossMargin:number|null; totalReceivables:number|null; overdueReceivables:number|null; totalPayables:number|null; inventoryValue:number|null; totalCustomers:number; activeCustomers:number|null; totalProducts:number; invoiceCount:number; avgInvoiceValue:number|null; collectionRate:number|null; status:'CONFIRMED'|'CALCULATED'|'INSUFFICIENT_DATA'; }
export interface MonthlyTrend {month:string;label:string;sales:number;cost:number;profit:number;invoices:number;}
export interface TopEntity {id:string;name:string;value:number;secondary?:number;}
export interface AgingBucket {bucket:string;amount:number;count:number;}
export interface CategoryBreakdown {name:string;sales:number;profit:number;quantity:number;}
interface Snapshot { kpis:DashboardKPIs; trend:MonthlyTrend[]; topCustomers:TopEntity[]; topProducts:TopEntity[]; categories:CategoryBreakdown[]; aging:AgingBucket[]; }

function finiteOrNull(value: unknown): number|null { return typeof value === 'number' && Number.isFinite(value) ? value : null; }
function requiredArray<T>(value: unknown): T[] { return Array.isArray(value) ? value as T[] : []; }

export async function fetchDashboardSnapshot(months = 6): Promise<Snapshot> {
  if (!Number.isInteger(months) || months < 1 || months > 24) throw new Error('REPORT_QUERY_INVALID_MONTHS');
  const { data, error } = await supabase.rpc('get_dashboard_snapshot', { p_months: months, p_as_of: new Date().toISOString().slice(0, 10) });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: dashboard snapshot missing');
  const row = data as Record<string, unknown>;
  const kpis: DashboardKPIs = {
    totalSales: finiteOrNull(row.totalSales), totalCost: finiteOrNull(row.totalCost), grossProfit: finiteOrNull(row.grossProfit),
    grossMargin: finiteOrNull(row.grossMargin), totalReceivables: finiteOrNull(row.totalReceivables), overdueReceivables: finiteOrNull(row.overdueReceivables),
    totalPayables: finiteOrNull(row.totalPayables), inventoryValue: finiteOrNull(row.inventoryValue), totalCustomers: Number(row.totalCustomers ?? 0),
    activeCustomers: finiteOrNull(row.activeCustomers), totalProducts: Number(row.totalProducts ?? 0), invoiceCount: Number(row.invoiceCount ?? 0),
    avgInvoiceValue: finiteOrNull(row.avgInvoiceValue), collectionRate: finiteOrNull(row.collectionRate),
    status: row.status === 'CALCULATED' ? 'CALCULATED' : 'INSUFFICIENT_DATA',
  };
  return {
    kpis,
    trend: requiredArray<MonthlyTrend>(row.trend),
    topCustomers: requiredArray<TopEntity>(row.topCustomers).slice(0, 10),
    topProducts: requiredArray<TopEntity>(row.topProducts).slice(0, 10),
    categories: requiredArray<CategoryBreakdown>(row.categories),
    aging: requiredArray<AgingBucket>(row.aging),
  };
}

export async function fetchDashboardIntelligence(): Promise<{recommendations: Recommendation[]; alerts: Alert[]}> {
  const [{ data: recommendations, error: recommendationsError }, { data: alerts, error: alertsError }] = await Promise.all([
    supabase.from('recommendations').select('id,company_id,category,priority,title,description,expected_impact,confidence,status,owner,deadline,impact_result,created_at').order('created_at',{ascending:false}).limit(100),
    supabase.from('alerts').select('id,company_id,severity,category,title,description,metric_value,threshold,is_read,created_at').order('created_at',{ascending:false}).limit(100),
  ]);
  if (recommendationsError) throw recommendationsError;
  if (alertsError) throw alertsError;
  return { recommendations: (recommendations ?? []) as Recommendation[], alerts: (alerts ?? []) as Alert[] };
}
