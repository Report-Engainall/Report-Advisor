import { supabase, resolveCurrentCompanyId } from './supabase';
import { fetchDashboardSnapshot, fetchDashboardIntelligence, type DashboardKPIs, type MonthlyTrend, type TopEntity, type AgingBucket, type CategoryBreakdown } from './dashboard-canonical';
import type { Recommendation, Alert, SalesInvoice, PurchaseInvoice, ImportRecord, Customer, Forecast, Product } from './types';
export type { DashboardKPIs, MonthlyTrend, TopEntity, AgingBucket, CategoryBreakdown };
export { fetchDashboardIntelligence };
