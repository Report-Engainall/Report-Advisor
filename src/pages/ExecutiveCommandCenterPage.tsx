import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, BrainCircuit, ChevronLeft, CircleAlert, Gauge, ShieldAlert, Sparkles, WalletCards } from 'lucide-react';
import { fetchDashboardKPIs, type DashboardKPIs } from '../lib/queries';
import { runExecutivePipeline } from '../lib/free-toolbox/executive-pipeline';
import type { ActionCandidate } from '../lib/free-toolbox/action-priority';

type Status = 'good' | 'watch' | 'critical';
type CommandCard = { label: string; value: string; status: Status; icon: typeof WalletCards };
const formatNumber = (value: number) => new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 1 }).format(value);
const formatPercent = (value: number | null) => value === null ? 'غير متاح' : `${formatNumber(value)}%`;
function getReceivableStatus(kpi: DashboardKPIs): Status { if (kpi.totalReceivables <= 0) return 'good'; const overdueRate = (kpi.overdueReceivables / kpi.totalReceivables) * 100; if (overdueRate >= 35) return 'critical'; if (overdueRate >= 15) return 'watch'; return 'good'; }
function getMarginStatus(margin: number | null): Status { if (margin === null) return 'watch'; if (margin >= 20) return 'good'; if (margin >= 10) return 'watch'; return 'critical'; }
function getCollectionStatus(rate: number): Status { if (rate >= 80) return 'good'; if (rate >= 60) return 'watch'; return 'critical'; }
function statusLabel(status: Status) { return status === 'good' ? 'مستقر' : status === 'watch' ? 'مراقبة' : 'حرج'; }
function buildExecutiveActions(kpi: DashboardKPIs): ActionCandidate[] {
  const overdueRate = kpi.totalReceivables > 0 ? (kpi.overdueReceivables / kpi.totalReceivables) * 100 : 0;
  const margin = kpi.grossMargin;
  return [
    { id: 'collections', title: overdueRate >= 15 ? 'رفع التحصيل من العملاء المتأخرين' : 'مواصلة متابعة التحصيل', impact: Math.min(100, overdueRate * 2), urgency: Math.min(100, overdueRate * 2), effort: 35, confidence: 95 },
    { id: 'margin', title: margin === null ? 'استكمال بيانات التكلفة قبل تقييم الهامش' : margin < 15 ? 'مراجعة هوامش الأصناف منخفضة الربحية' : 'مراجعة فرص تحسين الهامش', impact: margin === null ? 0 : Math.min(100, Math.max(0, 30 - margin) * 3), urgency: margin === null ? 0 : Math.min(100, Math.max(0, 25 - margin) * 3), effort: 45, confidence: margin !== null && kpi.totalCost !== null ? 90 : 55 },
    { id: 'cash-cycle', title: kpi.collectionRate < 70 ? 'تحسين دورة التحصيل' : 'الحفاظ على كفاءة التحصيل', impact: Math.min(100, Math.max(0, 100 - kpi.collectionRate)), urgency: Math.min(100, Math.max(0, 90 - kpi.collectionRate)), effort: 30, confidence: 90 },
  ];
}

export function ExecutiveCommandCenterPage() {
  const [period, setPeriod] = useState('30'); const [selected, setSelected] = useState(0); const [kpis, setKpis] = useState<DashboardKPIs | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { let active = true; setLoading(true); setError(null); fetchDashboardKPIs({ startDate: new Date(Date.now() - Number(period) * 86400000).toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10) }).then((data) => { if (active) setKpis(data); }).catch(() => { if (active) setError('تعذر تحميل مؤشرات مركز القيادة.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [period]);
  const executive = useMemo(() => {
    if (!kpis || kpis.status === 'INSUFFICIENT_DATA' || kpis.grossMargin === null || kpis.grossProfit === null || kpis.totalSales === null || kpis.totalCost === null) return null;
    const actions = buildExecutiveActions(kpis);
    const quality = { completeness: 100, validity: 100, consistency: 100, uniqueness: 100, timeliness: 100 };
    const revenue = kpis.totalSales;
    const grossProfit = kpis.grossProfit;
    const grossMargin = kpis.grossMargin;
    return runExecutivePipeline({
      series: [{ period: new Date().toISOString().slice(0, 10), value: revenue }],
      signals: [
        { id: 'overdue-rate', label: 'نسبة الذمم المتأخرة', value: kpis.totalReceivables > 0 ? (kpis.overdueReceivables / kpis.totalReceivables) * 100 : 0, history: [], direction: 'higher-risk', staticThreshold: 15 },
        { id: 'gross-margin', label: 'الهامش الإجمالي', value: grossMargin, history: [], direction: 'lower-risk', staticThreshold: 10 },
        { id: 'collection-rate', label: 'معدل التحصيل', value: kpis.collectionRate, history: [], direction: 'lower-risk', staticThreshold: 70 },
      ], actions, quality,
      kpis: [
        { id: 'revenue', label: 'المبيعات', value: revenue, target: revenue, higherIsBetter: true },
        { id: 'gross_profit', label: 'مجمل الربح', value: grossProfit, target: Math.max(0, revenue * 0.2), higherIsBetter: true },
        { id: 'collection_rate', label: 'معدل التحصيل', value: kpis.collectionRate, target: 80, higherIsBetter: true },
      ],
    });
  }, [kpis]);
  const cards = useMemo<CommandCard[]>(() => { if (!kpis) return []; return [
    { label: 'الذمم المستحقة', value: formatNumber(kpis.totalReceivables), status: getReceivableStatus(kpis), icon: WalletCards },
    { label: 'هامش الربح الإجمالي', value: formatPercent(kpis.grossMargin), status: getMarginStatus(kpis.grossMargin), icon: Gauge },
    { label: 'قيمة المخزون', value: formatNumber(kpis.inventoryValue), status: kpis.inventoryValue > 0 ? 'good' : 'watch', icon: Activity },
    { label: 'الذمم المتأخرة', value: formatNumber(kpis.overdueReceivables), status: getReceivableStatus(kpis), icon: ShieldAlert },
  ]; }, [kpis]);
  const actions = useMemo(() => { if (!kpis) return []; const overdueRate = kpis.totalReceivables > 0 ? (kpis.overdueReceivables / kpis.totalReceivables) * 100 : 0; const margin = kpis.grossMargin; return [
    { title: overdueRate >= 15 ? 'رفع التحصيل من العملاء المتأخرين' : 'مواصلة متابعة التحصيل', impact: `${formatPercent(overdueRate)} من الذمم مستحقة ومتأخرة`, status: overdueRate >= 35 ? 'critical' : overdueRate >= 15 ? 'watch' : 'good' },
    { title: margin === null ? 'استكمال بيانات التكلفة قبل تقييم الهامش' : margin < 15 ? 'مراجعة هوامش الأصناف منخفضة الربحية' : 'مراجعة فرص تحسين الهامش', impact: margin === null ? 'الهامش غير متاح — التكلفة غير مكتملة' : `الهامش الإجمالي الحالي ${formatPercent(margin)}`, status: margin === null ? 'watch' : margin < 10 ? 'critical' : margin < 20 ? 'watch' : 'good' },
    { title: kpis.collectionRate < 70 ? 'تحسين دورة التحصيل' : 'الحفاظ على كفاءة التحصيل', impact: `معدل التحصيل ${formatPercent(kpis.collectionRate)}`, status: getCollectionStatus(kpis.collectionRate) },
  ] as Array<{title:string;impact:string;status:Status}>; }, [kpis]);
  const selectedAction = actions[selected] ?? actions[0]; const pipelineDecision = executive?.decisions[selected] ?? executive?.decisions[0];
  return <div dir="rtl" className="space-y-6">
    <section className="relative overflow-hidden rounded-3xl bg-ink-950 text-white p-6 lg:p-8"><div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" /><div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"><div><div className="flex items-center gap-2 text-primary-300 text-sm font-medium"><Sparkles size={16} /> مركز القيادة التنفيذي</div><h1 className="mt-2 text-2xl lg:text-3xl font-bold">صورة العمل الآن</h1><p className="mt-2 text-ink-300 max-w-2xl">مؤشرات حقيقية من بيانات الشركة، مع تفسير للإجراءات ذات الأولوية. الفترة الحالية هي نطاق العرض، بينما المؤشرات المعروضة تعتمد على مصدر البيانات المعتمد.</p></div><div className="flex items-center gap-2 rounded-2xl bg-white/10 p-1">{['7', '30', '90'].map((value) => <button key={value} onClick={() => setPeriod(value)} className={`px-4 py-2 rounded-xl text-sm ${period === value ? 'bg-white text-ink-900' : ''}`}>{value} يوم</button>)}</div></div></section>
    {loading && <div className="rounded-2xl border border-ink-200 bg-white p-6 text-sm text-ink-500">جارٍ تحميل المؤشرات الحقيقية…</div>}{error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>}{!loading && !error && kpis?.status === 'INSUFFICIENT_DATA' && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">البيانات الحالية غير كافية لإصدار جميع المؤشرات بثقة. لا يتم عرض قيم افتراضية.</div>}
    {!loading && !error && kpis && <><section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className="rounded-xl bg-ink-50 p-2.5"><Icon size={20} /></div><span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.status === 'good' ? 'bg-emerald-50 text-emerald-700' : card.status === 'watch' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{statusLabel(card.status)}</span></div><p className="mt-5 text-sm text-ink-500">{card.label}</p><div className="mt-1"><strong className="text-2xl">{card.value}</strong></div></div>; })}</section>
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-5"><div className="xl:col-span-2 rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold text-lg">محرك القرار</h2><p className="text-sm text-ink-500 mt-1">الإجراءات مشتقة من المؤشرات الحالية وتمر عبر خط القرار التنفيذي المعتمد.</p></div><BrainCircuit size={22} /></div><div className="mt-5 space-y-3">{actions.map((action, index) => <button key={action.title} onClick={() => setSelected(index)} className={`w-full text-right rounded-2xl border p-4 transition ${selected === index ? 'border-primary-400 bg-primary-50/50' : 'border-ink-200 hover:bg-ink-50'}`}><div className="flex items-center gap-3"><div className={`h-2.5 w-2.5 rounded-full ${action.status === 'critical' ? 'bg-red-500' : action.status === 'watch' ? 'bg-amber-500' : 'bg-emerald-500'}`} /><div className="flex-1"><p className="font-semibold">{action.title}</p><p className="text-xs text-ink-500 mt-1">{action.impact}</p></div><ChevronLeft size={18} /></div></button>)}</div></div><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><CircleAlert size={20} /><h2 className="font-bold">التفسير والأدلة</h2></div><p className="mt-4 text-sm leading-7 text-ink-600">{selectedAction?.title ?? 'لا توجد توصية متاحة حاليًا.'}</p><div className="mt-5 rounded-xl bg-ink-50 p-4"><div className="text-xs text-ink-500">الأثر/المؤشر المرتبط</div><div className="mt-1 font-bold">{selectedAction?.impact ?? 'لا توجد بيانات كافية'}</div></div>{pipelineDecision && <div className="mt-3 rounded-xl border border-primary-100 bg-primary-50 p-4"><div className="text-xs text-primary-700">قرار pipeline الفعلي</div><div className="mt-1 text-sm font-semibold">{pipelineDecision.title}</div><div className="mt-1 text-xs text-ink-600">{pipelineDecision.reason}</div></div>}<button className="mt-4 w-full rounded-xl bg-ink-900 text-white py-3 text-sm font-semibold">فتح التحليل التفصيلي <ChevronLeft className="inline mr-1" size={16} /></button></div></section>
    <section className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold text-lg">مراقبة التنبيهات الذكية</h2><p className="text-sm text-ink-500 mt-1">ملخص مبني على مؤشرات فعلية من لوحة البيانات.</p></div><Bell size={20} /></div><div className="mt-4 grid md:grid-cols-3 gap-3"><div className="rounded-xl bg-red-50 p-4"><b>متأخر</b><p className="text-sm mt-1">الذمم المتأخرة: {formatNumber(kpis.overdueReceivables)}</p></div><div className="rounded-xl bg-amber-50 p-4"><b>هامش</b><p className="text-sm mt-1">الهامش الإجمالي: {formatPercent(kpis.grossMargin)}</p></div><div className="rounded-xl bg-emerald-50 p-4"><b>تحصيل</b><p className="text-sm mt-1">معدل التحصيل: {formatPercent(kpis.collectionRate)}</p></div></div></section></>}
  </div>;
}