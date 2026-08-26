import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, Calendar } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { SimpleBarChart } from '@/components/ui/Charts';
import { formatCurrency, formatNumber } from '@/lib/format';
import { fetchRFMAnalysis, fetchABCAnalysis, fetchAgingAnalysis } from '@/lib/canonical-analytics';
import type { RFMRow, ABCRow, AgingBucket } from '@/lib/canonical-analytics';

const analyticsCards = [
  { path: '/analytics/rfm', title: 'تحليل RFM للعملاء', desc: 'تصنيف العملاء حسب الحداثة والتكرار والقيمة', icon: Users, color: 'primary' },
  { path: '/analytics/abc', title: 'تحليل ABC للمنتجات', desc: 'تصنيف المنتجات حسب الأهمية والمساهمة', icon: Package, color: 'accent' },
  { path: '/analytics/aging', title: 'تحليل أعمار الذمم', desc: 'توزيع الفواتير حسب عمر الاستحقاق', icon: Calendar, color: 'warning' },
];

export function AnalyticsCenterPage() {
  return <div className="space-y-6 animate-fade-in"><PageHeader title="مركز التحليلات" subtitle="تحليلات متقدمة لاكتشاف الأنماط والاتجاهات" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{analyticsCards.map((r) => <Link key={r.path} to={r.path}><Card hover className="h-full"><CardBody><div className="flex items-start gap-3"><div className={`w-11 h-11 rounded-xl bg-${r.color}-50 text-${r.color}-600 flex items-center justify-center flex-shrink-0`}><r.icon size={20} /></div><div><h3 className="font-semibold text-ink-800 text-sm">{r.title}</h3><p className="text-xs text-ink-500 mt-1">{r.desc}</p></div></div></CardBody></Card></Link>)}</div></div>;
}

const RFM_VARIANTS: Record<string, 'success' | 'primary' | 'accent' | 'warning' | 'danger' | 'neutral'> = { 'أبطال': 'success', 'مخلصون': 'primary', 'واعدون': 'accent', 'معرضون للخطر': 'warning', 'خاملون': 'danger' };

export function RFMAnalysisPage() {
  const [data, setData] = useState<RFMRow[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchRFMAnalysis()); } catch (e: unknown) { setError(e instanceof Error ? e.message : 'فشل تحميل تحليل RFM'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  const counts = new Map<string, number>(); data.forEach(r => counts.set(r.rfm_segment, (counts.get(r.rfm_segment) ?? 0) + 1));
  const segmentData = Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  return <div className="space-y-6 animate-fade-in"><PageHeader title="تحليل RFM" subtitle="تصنيف العملاء حسب الحداثة والتكرار والقيمة" /><div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><Card><CardHeader title="توزيع الشرائح" /><CardBody><SimpleBarChart data={segmentData} dataKey="value" nameKey="name" height={250} /></CardBody></Card><Card className="lg:col-span-2"><CardHeader title="تفاصيل العملاء" /><DataTable columns={[{ key: 'customer_name', label: 'العميل' }, { key: 'recency', label: 'الحداثة (يوم)', align: 'center', render: (r: RFMRow) => formatNumber(r.recency) }, { key: 'frequency', label: 'التكرار', align: 'center', render: (r: RFMRow) => formatNumber(r.frequency) }, { key: 'monetary', label: 'القيمة', align: 'right', render: (r: RFMRow) => formatCurrency(r.monetary) }, { key: 'rfm_segment', label: 'الشريحة', align: 'center', render: (r: RFMRow) => <Badge variant={RFM_VARIANTS[r.rfm_segment] ?? 'neutral'}>{r.rfm_segment}</Badge> }]} data={data.slice(0, 20)} /></Card></div></div>;
}

export function ABCAnalysisPage() {
  const [data, setData] = useState<ABCRow[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchABCAnalysis()); } catch (e: unknown) { setError(e instanceof Error ? e.message : 'فشل تحميل تحليل ABC'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  const counts = new Map<string, number>(); data.forEach(r => counts.set(r.class, (counts.get(r.class) ?? 0) + 1));
  return <div className="space-y-6 animate-fade-in"><PageHeader title="تحليل ABC" subtitle="تصنيف المنتجات حسب مساهمة الإيرادات" /><div className="grid grid-cols-3 gap-4">{['A', 'B', 'C'].map(c => <Card key={c}><CardBody><div className="text-xs text-ink-500 mb-1">الفئة {c}</div><div className="text-xl font-bold text-ink-900">{counts.get(c) ?? '—'} منتج</div><div className="text-xs text-ink-400 mt-1">{c === 'A' ? 'حتى 80% من الإيرادات' : c === 'B' ? 'حتى 95% من الإيرادات' : 'الباقي'}</div></CardBody></Card>)}</div><Card><CardHeader title="تصنيف المنتجات" /><DataTable columns={[{ key: 'product_name', label: 'المنتج' }, { key: 'revenue', label: 'الإيرادات', align: 'right', render: (r: ABCRow) => formatCurrency(r.revenue) }, { key: 'cumulative_pct', label: 'النسبة التراكمية', align: 'right', render: (r: ABCRow) => `${r.cumulative_pct.toFixed(1)}%` }, { key: 'class', label: 'الفئة', align: 'center', render: (r: ABCRow) => <Badge variant={r.class === 'A' ? 'success' : r.class === 'B' ? 'primary' : 'neutral'}>{r.class}</Badge> }]} data={data.slice(0, 30)} /></Card></div>;
}

export function AgingAnalysisPage() {
  const [buckets, setBuckets] = useState<AgingBucket[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setBuckets(await fetchAgingAnalysis()); } catch (e: unknown) { setError(e instanceof Error ? e.message : 'فشل تحميل تحليل أعمار الذمم'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  return <div className="space-y-6 animate-fade-in"><PageHeader title="تحليل أعمار الذمم" subtitle="توزيع الفواتير حسب عمر الاستحقاق" /><Card><CardHeader title="توزيع الأعمار" /><CardBody><SimpleBarChart data={buckets} dataKey="amount" nameKey="name" /></CardBody></Card><Card><CardHeader title="التفاصيل" /><DataTable columns={[{ key: 'name', label: 'الفئة (يوم)' }, { key: 'amount', label: 'المبلغ', align: 'right', render: (r: AgingBucket) => formatCurrency(r.amount) }, { key: 'count', label: 'عدد الفواتير', align: 'center', render: (r: AgingBucket) => formatNumber(r.count) }]} data={buckets} /></Card></div>;
}
