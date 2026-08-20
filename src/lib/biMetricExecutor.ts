import { supabase, COMPANY_ID } from './supabase';
import { evaluateMetric, type MetricEvaluation } from './metricEngine';
import { parseBIQuestion, type BIIntent } from './chat2bi';

export interface BIExecutionResult {
  intent: BIIntent;
  metric: MetricEvaluation | null;
  value: number | null;
  status: 'ANSWERED' | 'NEEDS_CLARIFICATION' | 'INSUFFICIENT_DATA' | 'FAILED';
  evidence: string[];
  generatedAt: string;
  error?: string;
}

function dateWindow(period: BIIntent['period']) {
  const days = period === 'today' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 0;
  if (!days) return null;
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 86400000);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export async function executeBIQuestion(question: string): Promise<BIExecutionResult> {
  const intent = parseBIQuestion(question);
  if (!intent.metric || intent.confidence < 0.45) {
    return { intent, metric: null, value: null, status: 'NEEDS_CLARIFICATION', evidence: [], generatedAt: new Date().toISOString() };
  }
  if (!COMPANY_ID || COMPANY_ID === '00000000-0000-0000-0000-000000000000') {
    return { intent, metric: null, value: null, status: 'FAILED', evidence: [], generatedAt: new Date().toISOString(), error: 'لا توجد شركة نشطة.' };
  }

  const window = dateWindow(intent.period);
  if (!window && intent.period === 'unknown') {
    return { intent, metric: null, value: null, status: 'NEEDS_CLARIFICATION', evidence: intent.metric.source, generatedAt: new Date().toISOString() };
  }

  try {
    if (intent.metric.key === 'net_sales' || intent.metric.key === 'receivables') {
      let query = supabase.from('sales_invoices').select('id,total,paid_amount,invoice_date').eq('company_id', COMPANY_ID);
      if (window) query = query.gte('invoice_date', window.from).lte('invoice_date', window.to);
      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      const value = intent.metric.key === 'net_sales'
        ? rows.reduce((sum, row) => sum + Number(row.total ?? 0), 0)
        : rows.reduce((sum, row) => sum + Math.max(0, Number(row.total ?? 0) - Number(row.paid_amount ?? 0)), 0);
      const metric = evaluateMetric({ key: intent.metric.key, value, sourceRows: rows.length, confidence: rows.length ? 1 : 0 });
      return { intent, metric, value, status: metric.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'ANSWERED', evidence: intent.metric.source, generatedAt: new Date().toISOString() };
    }

    if (intent.metric.key === 'inventory_value') {
      const { data, error } = await supabase.from('inventory_balances').select('quantity,unit_cost').eq('company_id', COMPANY_ID);
      if (error) throw error;
      const rows = data ?? [];
      const value = rows.reduce((sum, row) => sum + Number(row.quantity ?? 0) * Number(row.unit_cost ?? 0), 0);
      const metric = evaluateMetric({ key: intent.metric.key, value, sourceRows: rows.length, confidence: rows.length ? 1 : 0 });
      return { intent, metric, value, status: metric.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'ANSWERED', evidence: intent.metric.source, generatedAt: new Date().toISOString() };
    }

    if (intent.metric.key === 'payables') {
      let query = supabase.from('purchase_invoices').select('total,paid_amount,invoice_date').eq('company_id', COMPANY_ID);
      if (window) query = query.gte('invoice_date', window.from).lte('invoice_date', window.to);
      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      const value = rows.reduce((sum, row) => sum + Math.max(0, Number(row.total ?? 0) - Number(row.paid_amount ?? 0)), 0);
      const metric = evaluateMetric({ key: intent.metric.key, value, sourceRows: rows.length, confidence: rows.length ? 1 : 0 });
      return { intent, metric, value, status: metric.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'ANSWERED', evidence: intent.metric.source, generatedAt: new Date().toISOString() };
    }

    return { intent, metric: null, value: null, status: 'NEEDS_CLARIFICATION', evidence: intent.metric.source, generatedAt: new Date().toISOString() };
  } catch (cause) {
    return { intent, metric: null, value: null, status: 'FAILED', evidence: intent.metric.source, generatedAt: new Date().toISOString(), error: cause instanceof Error ? cause.message : 'فشل تنفيذ الاستعلام.' };
  }
}
