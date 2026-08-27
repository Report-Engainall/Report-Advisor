import { useEffect, useMemo, useState } from 'react';
import { Calendar, Package, Users } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader, ErrorState, LoadingState } from '@/components/ui/States';
import { SimpleBarChart } from '@/components/ui/Charts';
import { formatCurrency, formatNumber } from '@/lib/format';
import { fetchAbcTruth, fetchAgingTruth, fetchRfmTruth, type AbcTruth, type RfmTruth } from '@/lib/analytics-truth';

const analyticsCards = [
  { path: '/analytics/rfm', title: 'تحليل RFM للعملاء', desc: 'تصنيف العملاء حسب الحداثة والتكرار والقيمة', icon: Users, color: 'primary' },
  { path: '/analytics/abc', title: 'تحليل ABC للمنتجات', desc: 'تصنيف المنتجات حسب الأهمية والمساهمة', icon: Package, color: 'accent' },
  { path: '/analytics/aging', title: 'تحليل أعمار الذمم', desc: 'توزيع الفواتير حسب عمر الاستحقاق', icon: Calendar, color: 'warning' },
];

export function AnalyticsCenterPage() {
  return <div className="space-y-6 animate-fade-in" dir="rtl"><PageHeader title="مركز التحليلات" subtitle="تحليلات متقدمة من مصادر الحقيقة المعتمدة" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{analyticsCards.map((r) => <a key={r.path} href={r.path}><Card hover className="h-full"><CardBody><div className="flex items-start gap-3"><div className={`w-11 h-11 rounded-xl bg-${r.color}-50 text-${r.color}-600 flex items-center justify-center flex-shrink-0`}><r.icon size={20} /></div><div><h3 className="font-semibold text-ink-800 text-sm">{r.title}</h3><p className="text-xs text-ink-500 mt-1">{r.desc}</p></div></div></CardBody></Card></a>)}</div></div>;
}

const RFM_VARIANTS: Record<string, 'success' | 'primary' | 'accent' | 'warning' | 'danger' | 'neutral'> = { 'أبطال': 'success', 'مخلصون': 'primary', 'واعدون': 'accent', 'معرضون للخطر': 'warning', 'خاملون': 'danger' };

export function RFMAnalysisPage() {
  const [truth, setTruth] = useState<RfmTruth | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setLoading(true); setError(null); setTruth(await fetchRfmTruth()); } catch (e) { setError(e instanceof Error ? e.message : 'فشل تحميل تحليل RFM'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const segmentData = useMemo(() => { const counts = new Map<string, number>(); truth?.rows.forEach((r) => counts.set(r.segment, (counts.get(r.segment) ?? 0) + 1)); return Array.from(counts.entries()).map(([name, value]) => ({ name, value })); }, [truth]);
  if (loading) return <LoadingState />; if (error) return <ErrorState message={error} onRetry={load} />;
  const rows = truth?.rows ?? [];
  return <div className="space-y-6 animate-fade-in" dir="rtl"><PageHeader title="تحليل RFM" subtitle="حقيقة الخريطة مشتقة من RPC مركزي وبـ as-of date ثابت" />{truth?.status !== 'CALCULATED' && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">التحليل غير مكتمل: {formatNumber(truth?.incompleteRows ?? 0)} سجل ناقص. لا يتم تحويل النقص إلى أرقام.</div>}<div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><Card><CardHeader title="توزيع الشرائح"/><CardBody><SimpleBarChart data={segmentData} dataKey="value" nameKey="name" height={250}/></CardBody></Card><Card className="lg:col-span-2"><CardHeader title="تفاصيل العملاء"/><DataTable columns={[{key:'customerName',label:'العميل'},{key:'recencyDays',label:'الحداثة (يوم)',align:'center',render:(r:any)=>r.recencyDays == null ? '—' : formatNumber(r.recencyDays)},{key:'frequency',label:'التكرار',align:'center',render:(r:any)=>r.frequency == null ? '—' : formatNumber(r.frequency)},{key:'monetary',label:'القيمة',align:'right',render:(r:any)=>r.monetary == null ? '—' : formatCurrency(r.monetary)},{key:'segment',label:'الشريحة',align:'center',render:(r:any)=><Badge variant={RFM_VARIANTS[r.segment]??'neutral'}>{r.segment}</Badge>}] } data={rows.slice(0,20)}/></Card></div></div>;
}

export function ABCAnalysisPage() {
  const [truth, setTruth] = useState<AbcTruth | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setLoading(true); setError(null); setTruth(await fetchAbcTruth()); } catch (e) { setError(e instanceof Error ? e.message : 'فشل تحميل تحليل ABC'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  if (loading) return <LoadingState />; if (error) return <ErrorState message={error} onRetry={load} />;
  const rows = truth?.rows ?? []; const counts = new Map<string, number>(); rows.forEach((r) => counts.set(r.class, (counts.get(r.class) ?? 0) + 1));
  return <div className="space-y-6 animate-fade-in" dir="rtl"><PageHeader title="تحليل ABC" subtitle="التصنيف محسوب خادميًا من مصدر الحقيقة نفسه" />{truth?.status !== 'CALCULATED' && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">التحليل غير مكتمل: {formatNumber(truth?.incompleteRows ?? 0)} سجل ناقص. لا يتم إنتاج تصنيف مالي مضلل.</div>}<div className="grid grid-cols-3 gap-4">{['A','B','C'].map((c)=><Card key={c}><CardBody><div className="text-xs text-ink-500 mb-1">الفئة {c}</div><div className="text-xl font-bold text-ink-900">{truth?.status === 'CALCULATED' ? `${counts.get(c) ?? 0} منتج` : '—'}</div></CardBody></Card>)}</div><Card><CardHeader title="تصنيف المنتجات"/><DataTable columns={[{key:'productName',label:'المنتج'},{key:'revenue',label:'الإيرادات',align:'right',render:(r:any)=>r.revenue == null ? '—' : formatCurrency(r.revenue)},{key:'cumulativePct',label:'النسبة التراكمية',align:'right',render:(r:any)=>r.cumulativePct == null ? '—' : `${r.cumulativePct.toFixed(1)}%`},{key:'class',label:'الفئة',align:'center',render:(r:any)=><Badge variant={r.class==='A'?'success':r.class==='B'?'primary':r.class==='C'?'neutral':'warning'}>{r.class}</Badge>}] } data={rows.slice(0,30)}/></Card></div>;
}

export function AgingAnalysisPage() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchAgingTruth>> | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setLoading(true); setError(null); const asOf = new Date().toISOString().slice(0,10); setSnapshot(await fetchAgingTruth(asOf)); } catch (e) { setError(e instanceof Error ? e.message : 'فشل تحميل أعمار الذمم'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  if (loading) return <LoadingState />; if (error) return <ErrorState message={error} onRetry={load} />;
  const buckets = snapshot ? Object.entries(snapshot.buckets).map(([name, amount]) => ({ name, amount })) : [];
  return <div className="space-y-6 animate-fade-in" dir="rtl"><PageHeader title="تحليل أعمار الذمم" subtitle="الإجماليات مستقلة عن pagination وتستخدم نفس مصدر حقيقة الذمم" />{snapshot?.status !== 'CALCULATED' && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">الحقيقة المالية غير مكتملة. غير المؤرخ: {formatNumber(snapshot?.undatedRows ?? 0)}، الناقص: {formatNumber(snapshot?.incompleteRows ?? 0)}.</div>}<Card><CardHeader title="توزيع الأعمار"/><CardBody><SimpleBarChart data={buckets} dataKey="amount" nameKey="name"/></CardBody></Card><Card><CardHeader title="الإجماليات"/><DataTable columns={[{key:'name',label:'الفئة (يوم)'},{key:'amount',label:'المبلغ',align:'right',render:(r:any)=>snapshot?.status === 'CALCULATED' ? formatCurrency(r.amount) : '—'}]} data={buckets}/></Card></div>;
}
