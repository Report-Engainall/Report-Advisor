import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowDownLeft, ArrowUpRight, Bell, BrainCircuit, Database, Gauge, Package, Receipt, ShieldAlert, Sparkles, WalletCards } from 'lucide-react';
import { fetchDashboardSnapshot, fetchDashboardIntelligence, type DashboardKPIs, type MonthlyTrend } from '../lib/dashboard-canonical';
import { isCompleteDashboardKPIs, type CompleteDashboardKPIs } from '../lib/dashboard-kpi-guards';
import type { Alert, Recommendation } from '../lib/types';

type Status = 'good' | 'watch' | 'critical';
type HealthCard = { label: string; value: string; status: Status; icon: typeof WalletCards; context: string };
const number = (value: number | null | undefined) => value == null ? '—' : new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 1 }).format(value);
const percent = (value: number | null | undefined) => value == null ? '—' : `${number(value)}%`;
const statusLabel = (s: Status) => s === 'good' ? 'مستقر' : s === 'watch' ? 'مراقبة' : 'حرج';
function receivableStatus(k: CompleteDashboardKPIs): Status { const rate = k.totalReceivables > 0 ? (k.overdueReceivables / k.totalReceivables) * 100 : 0; return rate >= 35 ? 'critical' : rate >= 15 ? 'watch' : 'good'; }
function marginStatus(m: number): Status { return m >= 20 ? 'good' : m >= 10 ? 'watch' : 'critical'; }
function collectionStatus(r: number): Status { return r >= 80 ? 'good' : r >= 60 ? 'watch' : 'critical'; }
function trendFor(trend: MonthlyTrend[], key: 'sales' | 'profit'): { delta: number | null; label: string } { const values = trend.map(x => x[key]).filter((v): v is number => typeof v === 'number' && Number.isFinite(v)); if (values.length < 2) return { delta: null, label: 'لا توجد مقارنة كافية' }; const prev = values[values.length - 2]; const current = values[values.length - 1]; return { delta: prev === 0 ? null : ((current - prev) / Math.abs(prev)) * 100, label: 'مقارنة بآخر شهر متاح' }; }

export function ExecutiveCommandCenterPage() {
  const [months, setMonths] = useState(3);
  const [selected, setSelected] = useState(0);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let active = true; setLoading(true); setError(null); Promise.all([fetchDashboardSnapshot(months), fetchDashboardIntelligence()]).then(([snapshot, intelligence]) => { if (!active) return; setKpis(snapshot.kpis); setTrend(snapshot.trend); setRecommendations(intelligence.recommendations); setAlerts(intelligence.alerts); }).catch(() => { if (active) setError('تعذر تحميل مركز القيادة من المصادر المعتمدة.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [months]);
  const complete = isCompleteDashboardKPIs(kpis) ? kpis : null;
  const salesTrend = useMemo(() => trendFor(trend, 'sales'), [trend]);
  const profitTrend = useMemo(() => trendFor(trend, 'profit'), [trend]);
  const cards = useMemo<HealthCard[]>(() => { if (!complete) return []; const rs = receivableStatus(complete); const ms = marginStatus(complete.grossMargin); return [
    { label: 'المبيعات', value: number(complete.totalSales), status: 'good', icon: Receipt, context: `${salesTrend.label}${salesTrend.delta == null ? '' : ` · ${percent(salesTrend.delta)}`}` },
    { label: 'الهامش الإجمالي', value: percent(complete.grossMargin), status: ms, icon: Gauge, context: `${profitTrend.label}${profitTrend.delta == null ? '' : ` · ${percent(profitTrend.delta)}`}` },
    { label: 'الذمم والتحصيل', value: number(complete.totalReceivables), status: rs, icon: WalletCards, context: `متأخر: ${number(complete.overdueReceivables)} · التحصيل ${percent(complete.collectionRate)}` },
    { label: 'المخزون', value: number(complete.inventoryValue), status: complete.inventoryValue > 0 ? 'good' : 'watch', icon: Package, context: `المنتجات: ${number(complete.totalProducts)}` },
    { label: 'العملاء', value: number(complete.activeCustomers), status: complete.activeCustomers != null && complete.activeCustomers > 0 ? 'good' : 'watch', icon: Activity, context: `إجمالي العملاء: ${number(complete.totalCustomers)}` },
    { label: 'التغطية التشغيلية', value: number(complete.invoiceCount), status: complete.invoiceCount != null && complete.invoiceCount > 0 ? 'good' : 'watch', icon: Database, context: `متوسط الفاتورة: ${number(complete.avgInvoiceValue)}` },
  ]; }, [complete, salesTrend, profitTrend]);
  const actions = useMemo(() => { if (!complete) return []; const overdueRate = complete.totalReceivables > 0 ? (complete.overdueReceivables / complete.totalReceivables) * 100 : 0; return [
    { title: overdueRate >= 15 ? 'رفع أولوية التحصيل' : 'مواصلة متابعة التحصيل', impact: `${percent(overdueRate)} من الذمم متأخرة`, status: receivableStatus(complete) as Status },
    { title: complete.grossMargin < 15 ? 'مراجعة هوامش الأصناف' : 'مراجعة فرص تحسين الهامش', impact: `الهامش الإجمالي ${percent(complete.grossMargin)}`, status: marginStatus(complete.grossMargin) },
    { title: complete.collectionRate < 70 ? 'تحسين دورة التحصيل' : 'الحفاظ على كفاءة التحصيل', impact: `معدل التحصيل ${percent(complete.collectionRate)}`, status: collectionStatus(complete.collectionRate) },
  ]; }, [complete]);
  const selectedAction = actions[selected] ?? actions[0];
  const asOf = new Date().toISOString().slice(0, 10);
  return <div dir="rtl" className="space-y-6">
    <section className="relative overflow-hidden rounded-3xl bg-ink-950 text-white p-6 lg:p-8"><div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"><div><div className="flex items-center gap-2 text-primary-300 text-sm font-medium"><Sparkles size={16}/> مركز القيادة التنفيذي</div><h1 className="mt-2 text-2xl lg:text-3xl font-bold">الوضع → السبب → الخطر → القرار</h1><p className="mt-2 text-ink-300 max-w-3xl">لقطة تشغيلية من المصدر الكنسي للوحة القيادة. لا تظهر القيم الافتراضية؛ عند نقص البيانات يتوقف العرض عن الادعاء.</p></div><div className="flex items-center gap-2 rounded-2xl bg-white/10 p-1">{[[1,'شهر'],[3,'3 أشهر'],[6,'6 أشهر']].map(([value,label]) => <button key={value} onClick={() => setMonths(Number(value))} className={`px-4 py-2 rounded-xl text-sm ${months === value ? 'bg-white text-ink-900' : ''}`}>{label}</button>)}</div></div></section>
    {loading && <div className="rounded-2xl border border-ink-200 bg-white p-6 text-sm text-ink-500">جارٍ تحميل المؤشرات الحقيقية…</div>}
    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>}
    {!loading && !error && kpis?.status === 'INSUFFICIENT_DATA' && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">البيانات الحالية غير كافية لإصدار جميع المؤشرات بثقة. لا يتم عرض قيم افتراضية.</div>}
    {!loading && !error && complete && <>
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{cards.map(card => { const Icon = card.icon; return <article key={card.label} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className="rounded-xl bg-ink-50 p-2.5"><Icon size={20}/></div><span className="text-xs font-semibold px-2 py-1 rounded-full bg-ink-50">{statusLabel(card.status)}</span></div><p className="mt-5 text-sm text-ink-500">{card.label}</p><strong className="text-2xl">{card.value}</strong><p className="mt-2 text-xs text-ink-500">{card.context}</p><div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-ink-500"><span>الفترة: {months} أشهر</span><span>As-of: {asOf}</span><span>المصدر: Snapshot</span></div></article>; })}</section>
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5"><div className="xl:col-span-2 rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold text-lg">محرك القرار</h2><p className="text-sm text-ink-500 mt-1">القرار هنا تفسير لمؤشرات المصدر؛ التنفيذ والإغلاق يتطلبان دورة القرار الحقيقية.</p></div><BrainCircuit size={22}/></div><div className="mt-5 space-y-3">{actions.map((action,index) => <button key={action.title} onClick={() => setSelected(index)} className="w-full text-right rounded-2xl border border-ink-200 p-4 hover:bg-ink-50"><div className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full bg-current"/><div className="flex-1"><p className="font-semibold">{action.title}</p><p className="text-xs text-ink-500 mt-1">{action.impact}</p></div>{action.status === 'critical' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}</div></button>)}</div></div><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><ShieldAlert size={20}/><h2 className="font-bold">الدليل والسياق</h2></div><div className="mt-4 rounded-xl bg-ink-50 p-4 text-sm"><div>المصدر: `get_dashboard_snapshot`</div><div className="mt-1">الفترة: آخر {months} أشهر</div><div className="mt-1">As-of: {asOf}</div><div className="mt-1">الحالة: {complete.status}</div></div><p className="mt-4 text-sm leading-7 text-ink-600">{selectedAction?.title ?? 'لا توجد توصية متاحة حاليًا.'}</p><div className="mt-3 font-bold">{selectedAction?.impact ?? 'لا توجد بيانات كافية'}</div></div></section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5"><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><Bell size={20}/><h2 className="font-bold">صحة القرار والتنبيهات</h2></div><div className="mt-4 space-y-2">{alerts.length === 0 ? <p className="text-sm text-ink-500">لا توجد تنبيهات مصدرية متاحة حاليًا.</p> : alerts.slice(0,5).map(a => <div key={a.id} className="rounded-xl bg-amber-50 p-3 text-sm"><b>{a.title}</b><p className="mt-1">{a.description ?? 'تنبيه صادر من طبقة الذكاء المعتمدة.'}</p></div>)}</div></div><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><AlertTriangle size={20}/><h2 className="font-bold">جودة البيانات</h2></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-ink-50 p-3"><span className="text-ink-500">حالة KPI</span><b className="block mt-1">{complete.status}</b></div><div className="rounded-xl bg-ink-50 p-3"><span className="text-ink-500">تاريخ المصدر</span><b className="block mt-1">{asOf}</b></div><div className="rounded-xl bg-ink-50 p-3"><span className="text-ink-500">التوصيات</span><b className="block mt-1">{recommendations.length}</b></div><div className="rounded-xl bg-ink-50 p-3"><span className="text-ink-500">التنبيهات</span><b className="block mt-1">{alerts.length}</b></div></div></div></section>
    </>}
  </div>;
}