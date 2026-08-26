import { supabase, resolveCurrentCompanyId } from './supabase';

export type RFMRow = { customer_id: string; customer_name: string; recency: number; frequency: number; monetary: number; r_score: number; f_score: number; m_score: number; rfm_segment: string };
export type ABCRow = { product_id: string; product_name: string; revenue: number; cumulative: number; cumulative_pct: number; class: string };
export type AgingBucket = { name: string; amount: number; count: number };

function finite(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`ANALYTICS_DATA_UNAVAILABLE: invalid '${field}'`);
  return n;
}

async function companyId(): Promise<string> {
  const id = await resolveCurrentCompanyId();
  if (!id) throw new Error('TENANT_REQUIRED');
  return id;
}

export async function fetchRFMAnalysis(): Promise<RFMRow[]> {
  const id = await companyId();
  const { data, error } = await supabase.from('sales_invoices').select('customer_id,invoice_date,total,customer:customers(name)').eq('company_id', id).order('invoice_date', { ascending: true });
  if (error) throw error;
  const today = new Date();
  const by = new Map<string, { name: string; dates: Date[]; total: number; count: number }>();
  for (const raw of data ?? []) {
    const row = raw as unknown as { customer_id: string | null; invoice_date: string | null; total: unknown; customer: { name?: string | null } | null };
    if (!row.customer_id || !row.invoice_date || !row.customer?.name) continue;
    const amount = finite(row.total, 'sales_invoices.total');
    const date = new Date(row.invoice_date);
    if (!Number.isFinite(date.getTime())) continue;
    const entry = by.get(row.customer_id) ?? { name: row.customer.name, dates: [], total: 0, count: 0 };
    entry.dates.push(date); entry.total += amount; entry.count++; by.set(row.customer_id, entry);
  }
  const rows = Array.from(by.entries()).map(([customer_id, v]) => ({ customer_id, customer_name: v.name, recency: Math.floor((today.getTime() - v.dates[v.dates.length - 1].getTime()) / 86400000), frequency: v.count, monetary: v.total, r_score: 0, f_score: 0, m_score: 0, rfm_segment: '' }));
  const n = rows.length;
  if (!n) return [];
  [...rows].sort((a, b) => a.recency - b.recency).forEach((r, i) => { r.r_score = Math.min(5, Math.floor(i / n * 5) + 1); });
  [...rows].sort((a, b) => b.frequency - a.frequency).forEach((r, i) => { r.f_score = Math.min(5, Math.floor(i / n * 5) + 1); });
  [...rows].sort((a, b) => b.monetary - a.monetary).forEach((r, i) => { r.m_score = Math.min(5, Math.floor(i / n * 5) + 1); });
  rows.forEach(r => { const score = r.r_score + r.f_score + r.m_score; r.rfm_segment = score >= 13 ? 'أبطال' : score >= 10 ? 'مخلصون' : score >= 7 ? 'واعدون' : score >= 4 ? 'معرضون للخطر' : 'خاملون'; });
  return rows.sort((a, b) => (b.r_score + b.f_score + b.m_score) - (a.r_score + a.f_score + a.m_score));
}

export async function fetchABCAnalysis(): Promise<ABCRow[]> {
  const id = await companyId();
  const { data, error } = await supabase.from('sale_items').select('product_id,line_total,product:products(name)').eq('company_id', id).not('product_id', 'is', null);
  if (error) throw error;
  const by = new Map<string, { name: string; revenue: number }>();
  for (const raw of data ?? []) {
    const row = raw as unknown as { product_id: string | null; line_total: unknown; product: { name?: string | null } | null };
    if (!row.product_id || !row.product?.name) continue;
    const revenue = finite(row.line_total, 'sale_items.line_total');
    const entry = by.get(row.product_id) ?? { name: row.product.name, revenue: 0 };
    entry.revenue += revenue; by.set(row.product_id, entry);
  }
  const sorted = Array.from(by.entries()).map(([product_id, v]) => ({ product_id, product_name: v.name, revenue: v.revenue, cumulative: 0, cumulative_pct: 0, class: '' })).sort((a, b) => b.revenue - a.revenue);
  const total = sorted.reduce((s, r) => s + r.revenue, 0);
  if (!sorted.length || !Number.isFinite(total) || total <= 0) return [];
  let cumulative = 0;
  sorted.forEach(r => { cumulative += r.revenue; r.cumulative = cumulative; r.cumulative_pct = cumulative / total * 100; r.class = r.cumulative_pct <= 80 ? 'A' : r.cumulative_pct <= 95 ? 'B' : 'C'; });
  return sorted;
}

export async function fetchAgingAnalysis(): Promise<AgingBucket[]> {
  const id = await companyId();
  const { data, error } = await supabase.from('sales_invoices').select('total,paid_amount,due_date,invoice_date').eq('company_id', id);
  if (error) throw error;
  const buckets: AgingBucket[] = [{ name: '0-30', amount: 0, count: 0 }, { name: '31-60', amount: 0, count: 0 }, { name: '61-90', amount: 0, count: 0 }, { name: '90+', amount: 0, count: 0 }];
  const today = new Date();
  for (const raw of data ?? []) {
    const row = raw as { total: unknown; paid_amount: unknown; due_date: string | null; invoice_date: string | null };
    const total = finite(row.total, 'sales_invoices.total');
    const paid = finite(row.paid_amount, 'sales_invoices.paid_amount');
    const dueSource = row.due_date ?? row.invoice_date;
    if (!dueSource) continue;
    const due = new Date(dueSource);
    if (!Number.isFinite(due.getTime())) continue;
    const outstanding = total - paid;
    if (outstanding <= 0) continue;
    const days = Math.floor((today.getTime() - due.getTime()) / 86400000);
    const index = days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3;
    buckets[index].amount += outstanding; buckets[index].count++;
  }
  return buckets;
}
