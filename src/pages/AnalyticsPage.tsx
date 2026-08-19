import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Package, Calendar, TrendingUp, Brain } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { SimpleBarChart, HorizontalBarChart } from '@/components/ui/Charts';
import { supabase, COMPANY_ID } from '@/lib/supabase';
import { formatCurrency, formatNumber } from '@/lib/format';

const analyticsCards = [
  { path: '/analytics/rfm', title: 'تحليل RFM للعملاء', desc: 'تصنيف العملاء حسب التحدثية والتكرار والقيمة', icon: Users, color: 'primary' },
  { path: '/analytics/abc', title: 'تحليل ABC للمنتجات', desc: 'تصنيف المنتجات حسب الأهمية والمساهمة', icon: Package, color: 'accent' },
  { path: '/analytics/aging', title: 'تحليل أعمار الذمم', desc: 'توزيع الفواتير حسب عمر الاستحقاق', icon: Calendar, color: 'warning' },
];

export function AnalyticsCenterPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="مركز التحليلات" subtitle="تحليلات متقدمة لاكتشاف الأنماط والاتجاهات" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsCards.map((r) => (
          <Link key={r.path} to={r.path}>
            <Card hover className="h-full">
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-${r.color}-50 text-${r.color}-600 flex items-center justify-center flex-shrink-0`}>
                    <r.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink-800 text-sm">{r.title}</h3>
                    <p className="text-xs text-ink-500 mt-1">{r.desc}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface RFMRow {
  customer_id: string;
  customer_name: string;
  recency: number;
  frequency: number;
  monetary: number;
  r_score: number;
  f_score: number;
  m_score: number;
  rfm_segment: string;
}

export function RFMAnalysisPage() {
  const [data, setData] = useState<RFMRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data: invoices } = await supabase
        .from('sales_invoices')
        .select('id, customer_id, invoice_date, total, customer:customers(name)')
        .eq('company_id', COMPANY_ID)
        .order('invoice_date', { ascending: true });

      if (!invoices || invoices.length === 0) { setData([]); setLoading(false); return; }

      const today = new Date();
      const byCustomer = new Map<string, { name: string; dates: Date[]; total: number; count: number }>();

      for (const inv of (invoices || []) as any[]) {
        const cid = inv.customer_id;
        const name = (inv as any).customer?.name || 'غير معروف';
        const entry = byCustomer.get(cid) || { name, dates: [] as Date[], total: 0, count: 0 };
        entry.dates.push(new Date(inv.invoice_date));
        entry.total += Number(inv.total);
        entry.count += 1;
        byCustomer.set(cid, entry);
      }

      const rows: RFMRow[] = Array.from(byCustomer.entries()).map(([cid, v]) => {
        const lastDate = v.dates[v.dates.length - 1];
        const recency = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        const frequency = v.count;
        const monetary = v.total;
        return { customer_id: cid, customer_name: v.name, recency, frequency, monetary, r_score: 0, f_score: 0, m_score: 0, rfm_segment: '' };
      });

      const sortedR = [...rows].sort((a, b) => a.recency - b.recency);
      const sortedF = [...rows].sort((a, b) => b.frequency - a.frequency);
      const sortedM = [...rows].sort((a, b) => b.monetary - a.monetary);

      const n = rows.length;
      sortedR.forEach((r, i) => { r.r_score = Math.min(5, Math.floor((i / n) * 5) + 1); });
      sortedF.forEach((r, i) => { r.f_score = Math.min(5, Math.floor((i / n) * 5) + 1); });
      sortedM.forEach((r, i) => { r.m_score = Math.min(5, Math.floor((i / n) * 5) + 1); });

      rows.forEach(r => {
        const sum = r.r_score + r.f_score + r.m_score;
        if (sum >= 13) r.rfm_segment = 'أبطال';
        else if (sum >= 10) r.rfm_segment = 'مخلصون';
        else if (sum >= 7) r.rfm_segment = 'واعدون';
        else if (sum >= 4) r.rfm_segment = 'معرضون للخطر';
        else r.rfm_segment = 'خاملون';
      });

      setData(rows.sort((a, b) => (b.r_score + b.f_score + b.m_score) - (a.r_score + a.f_score + a.m_score)));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const segmentCounts = new Map<string, number>();
  data.forEach(r => segmentCounts.set(r.rfm_segment, (segmentCounts.get(r.rfm_segment) || 0) + 1));
  const segmentData = Array.from(segmentCounts.entries()).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="تحليل RFM" subtitle="تصنيف العملاء حسب التحدثية والتكرار والقيمة" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card><CardHeader title="توزيع الشرائح" /><CardBody><SimpleBarChart data={segmentData} dataKey="value" nameKey="name" height={250} /></CardBody></Card>
        <Card className="lg:col-span-2"><CardHeader title="تفاصيل العملاء" /><DataTable
          columns={[
            { key: 'customer_name', label: 'العميل' },
            { key: 'recency', label: 'الحداثة (يوم)', align: 'center', render: (r: RFMRow) => formatNumber(r.recency) },
            { key: 'frequency', label: 'التكرار', align: 'center', render: (r: RFMRow) => formatNumber(r.frequency) },
            { key: 'monetary', label: 'القيمة', align: 'right', render: (r: RFMRow) => formatCurrency(r.monetary) },
            { key: 'rfm_segment', label: 'الشريحة', align: 'center', render: (r: RFMRow) => {
              const map: any = { 'أبطال': 'success', 'مخلصون': 'primary', 'واعدون': 'accent', 'معرضون للخطر': 'warning', 'خاملون': 'danger' };
              return <Badge variant={map[r.rfm_segment] || 'neutral'}>{r.rfm_segment}</Badge>;
            }},
          ]}
          data={data.slice(0, 20)}
        /></Card>
      </div>
    </div>
  );
}

interface ABCRow {
  product_id: string;
  product_name: string;
  revenue: number;
  cumulative: number;
  cumulative_pct: number;
  class: string;
}

export function ABCAnalysisPage() {
  const [data, setData] = useState<ABCRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: items } = await supabase
        .from('sale_items')
        .select('product_id, line_total, product:products(name)')
        .not('product_id', 'is', null);

      const byProduct = new Map<string, { name: string; revenue: number }>();
      for (const item of items || []) {
        const pid = item.product_id!;
        const name = (item as any).product?.name || 'غير معروف';
        const entry = byProduct.get(pid) || { name, revenue: 0 };
        entry.revenue += Number(item.line_total);
        byProduct.set(pid, entry);
      }

      const sorted = Array.from(byProduct.entries())
        .map(([id, v]) => ({ product_id: id, product_name: v.name, revenue: v.revenue, cumulative: 0, cumulative_pct: 0, class: '' }))
        .sort((a, b) => b.revenue - a.revenue);

      const total = sorted.reduce((s, r) => s + r.revenue, 0);
      let cum = 0;
      sorted.forEach(r => {
        cum += r.revenue;
        r.cumulative = cum;
        r.cumulative_pct = (cum / total) * 100;
        r.class = r.cumulative_pct <= 80 ? 'A' : r.cumulative_pct <= 95 ? 'B' : 'C';
      });

      setData(sorted);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingState />;

  const classCounts = new Map<string, number>();
  data.forEach(r => classCounts.set(r.class, (classCounts.get(r.class) || 0) + 1));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="تحليل ABC" subtitle="تصنيف المنتجات حسب مساهمة الإيرادات" />
      <div className="grid grid-cols-3 gap-4">
        {['A', 'B', 'C'].map(c => (
          <Card key={c}><CardBody>
            <div className="text-xs text-ink-500 mb-1">الفئة {c}</div>
            <div className="text-xl font-bold text-ink-900">{classCounts.get(c) || 0} منتج</div>
            <div className="text-xs text-ink-400 mt-1">
              {c === 'A' ? '80% من الإيرادات' : c === 'B' ? '15% من الإيرادات' : '5% من الإيرادات'}
            </div>
          </CardBody></Card>
        ))}
      </div>
      <Card><CardHeader title="تصنيف المنتجات" /><DataTable
        columns={[
          { key: 'product_name', label: 'المنتج' },
          { key: 'revenue', label: 'الإيرادات', align: 'right', render: (r: ABCRow) => formatCurrency(r.revenue) },
          { key: 'cumulative_pct', label: 'النسبة التراكمية', align: 'right', render: (r: ABCRow) => `${r.cumulative_pct.toFixed(1)}%` },
          { key: 'class', label: 'الفئة', align: 'center', render: (r: ABCRow) => {
            const map: any = { A: 'success', B: 'primary', C: 'neutral' };
            return <Badge variant={map[r.class]}>{r.class}</Badge>;
          }},
        ]}
        data={data.slice(0, 30)}
      /></Card>
    </div>
  );
}

export function AgingAnalysisPage() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: invoices } = await supabase
        .from('sales_invoices')
        .select('total, paid_amount, due_date, invoice_date')
        .eq('company_id', COMPANY_ID);

      const today = new Date();
      const b = [
        { name: '0-30', amount: 0, count: 0 },
        { name: '31-60', amount: 0, count: 0 },
        { name: '61-90', amount: 0, count: 0 },
        { name: '90+', amount: 0, count: 0 },
      ];

      for (const inv of invoices || []) {
        const outstanding = Number(inv.total) - Number(inv.paid_amount);
        if (outstanding <= 0) continue;
        const due = new Date(inv.due_date || inv.invoice_date);
        const days = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        if (days <= 30) { b[0].amount += outstanding; b[0].count++; }
        else if (days <= 60) { b[1].amount += outstanding; b[1].count++; }
        else if (days <= 90) { b[2].amount += outstanding; b[2].count++; }
        else { b[3].amount += outstanding; b[3].count++; }
      }
      setBuckets(b);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="تحليل أعمار الذمم" subtitle="توزيع الفواتير حسب عمر الاستحقاق" />
      <Card><CardHeader title="توزيع الأعمار" /><CardBody><SimpleBarChart data={buckets} dataKey="amount" nameKey="name" /></CardBody></Card>
      <Card><CardHeader title="التفاصيل" /><DataTable
        columns={[
          { key: 'name', label: 'الفئة (يوم)' },
          { key: 'amount', label: 'المبلغ', align: 'right', render: (r: any) => formatCurrency(r.amount) },
          { key: 'count', label: 'عدد الفواتير', align: 'center', render: (r: any) => formatNumber(r.count) },
        ]}
        data={buckets}
      /></Card>
    </div>
  );
}
