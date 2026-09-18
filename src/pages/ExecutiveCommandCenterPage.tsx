import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Activity, Bell, BrainCircuit, ChevronLeft, CircleAlert, Gauge, ShieldAlert, Sparkles, WalletCards } from 'lucide-react';
import { fetchDashboardIntelligence, fetchDashboardSnapshot, type DashboardKPIs } from '../lib/dashboard-canonical';
import { isCompleteDashboardKPIs } from '../lib/dashboard-kpi-guards';
import type { Alert, Recommendation } from '@/lib/types';
import type { InvestigationTarget } from '@/components/BusinessInvestigationDrawer';
import { TruthContextStrip } from '@/components/TruthContextStrip';

const BusinessInvestigationDrawer = lazy(async () => ({ default: (await import('@/components/BusinessInvestigationDrawer')).BusinessInvestigationDrawer }));

type KpiCard = { label: string; value: string; icon: typeof WalletCards };
type QueueItem = { kind: 'recommendation' | 'alert'; item: Recommendation | Alert };

const formatNumber = (value: number) => new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 1 }).format(value);
const formatPercent = (value: number) => formatNumber(value) + '%';
const statusLabel = (status: DashboardKPIs['status']) => status === 'CONFIRMED' ? 'مصدر مؤكد' : status === 'CALCULATED' ? 'محسوب من المصدر' : 'بيانات غير كافية';
const statusBadgeClass = (status: DashboardKPIs['status']) => status === 'CONFIRMED' ? 'bg-success-50 text-success-700' : status === 'CALCULATED' ? 'bg-primary-50 text-primary-700' : 'bg-warning-50 text-warning-800';
const priorityLabel = (value: string) => ({ critical: 'يتطلب تدخلًا', high: 'أولوية عالية', medium: 'أولوية متوسطة', low: 'متابعة' }[value.toLowerCase()] ?? (value || 'غير محددة'));
const toSeverity = (value: string): InvestigationTarget['severity'] => {
  const normalized = value.toLowerCase();
  if (normalized === 'critical') return 'critical';
  if (normalized === 'high' || normalized === 'warning' || normalized === 'medium') return 'warning';
  if (normalized === 'opportunity') return 'opportunity';
  return 'info';
};

export function ExecutiveCommandCenterPage() {
  const [months, setMonths] = useState(3);
  const [selectedKey, setSelectedKey] = useState('');
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [asOf, setAsOf] = useState('غير متاح');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [investigation, setInvestigation] = useState<InvestigationTarget | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([fetchDashboardSnapshot(months), fetchDashboardIntelligence()])
      .then(([snapshot, intelligence]) => {
        if (!active) return;
        setKpis(snapshot.kpis);
        setAsOf(snapshot.asOf);
        setRecommendations(intelligence.recommendations.filter(row => row.status === 'new' || row.status === 'accepted'));
        setAlerts(intelligence.alerts);
      })
      .catch(() => { if (active) setError('تعذر تحميل مؤشرات وإشارات مركز القيادة.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [months]);

  const completeKpis = isCompleteDashboardKPIs(kpis) ? kpis : null;
  const cards = useMemo<KpiCard[]>(() => {
    if (!completeKpis) return [];
    return [
      { label: 'الذمم المستحقة', value: formatNumber(completeKpis.totalReceivables), icon: WalletCards },
      { label: 'هامش الربح الإجمالي', value: formatPercent(completeKpis.grossMargin), icon: Gauge },
      { label: 'قيمة المخزون', value: formatNumber(completeKpis.inventoryValue), icon: Activity },
      { label: 'الذمم المتأخرة', value: formatNumber(completeKpis.overdueReceivables), icon: ShieldAlert },
    ];
  }, [completeKpis]);

  const queue = useMemo<QueueItem[]>(() => [
    ...recommendations.slice(0, 4).map(item => ({ kind: 'recommendation' as const, item })),
    ...alerts.slice(0, 4).map(item => ({ kind: 'alert' as const, item })),
  ], [recommendations, alerts]);

  const selected = queue.find(entry => (entry.kind + ':' + entry.item.id) === selectedKey) ?? queue[0];

  const openKpi = (card: KpiCard) => {
    if (!kpis) return;
    setInvestigation({
      title: card.label,
      eyebrow: 'مؤشر تجاري · مركز القيادة',
      severity: kpis.status === 'INSUFFICIENT_DATA' ? 'warning' : 'info',
      summary: kpis.status === 'INSUFFICIENT_DATA'
        ? 'القيمة الحالية لا تملك دليلًا كافيًا؛ لن نشتق منها خطرًا أو قرارًا.'
        : 'القيمة مأخوذة من لقطة لوحة القيادة الكانونية. التحقيق يفصل الرقم عن أي تفسير أو سبب لم يثبت.',
      facts: [
        { label: 'الحالة', value: statusLabel(kpis.status) },
        { label: 'حتى', value: asOf },
        { label: 'الفترة', value: 'آخر ' + months + (months === 1 ? ' شهر' : ' أشهر') },
      ],
      confirmedReasons: ['المؤشر مقروء من get_dashboard_snapshot.'],
      missingEvidence: ['السبب الجذري للتغير، إن وجد.', 'أثر أي إجراء فعلي بعد التنفيذ.'],
      actions: [
        { label: 'افتح التقرير التنفيذي', path: '/reports/executive', hint: 'راجع الصورة المالية قبل تحويل المؤشر إلى قرار.' },
        { label: 'افتح تجربة القرار', path: '/decision-experience?stage=evidence', hint: 'افحص الدليل والسياق قبل الإجراء.' },
      ],
      evidence: {
        source: 'get_dashboard_snapshot',
        asOf,
        status: kpis.status,
        period: 'آخر ' + months + (months === 1 ? ' شهر' : ' أشهر'),
      },
    });
  };
  const openQueueItem = (entry: QueueItem) => {
    setSelectedKey(entry.kind + ':' + entry.item.id);
    if (entry.kind === 'recommendation') {
      const item = entry.item as Recommendation;
      setInvestigation({
        title: item.title,
        eyebrow: 'توصية أعمال · مصدر الذكاء الكانوني',
        severity: toSeverity(item.priority),
        summary: item.description || 'توصية مسجلة من طبقة ذكاء الأعمال؛ لا تعني أن القرار أو التنفيذ اكتمل.',
        facts: [
          { label: 'الحالة', value: item.status || 'غير محددة' },
          { label: 'الأولوية', value: priorityLabel(item.priority) },
          { label: 'الثقة', value: item.confidence || 'غير محددة' },
          { label: 'الأثر المتوقع', value: item.expected_impact == null ? 'غير متاح' : formatNumber(item.expected_impact) },
        ],
        confirmedReasons: ['التوصية صادرة عن get_dashboard_intelligence.'],
        missingEvidence: ['قرار بشري موثق، إن كان مطلوبًا.', 'نتيجة التنفيذ الفعلية بعد اعتماد الإجراء.'],
        actions: [
          { label: 'افتح تجربة القرار', path: '/decision-experience?stage=recommendation', hint: 'راجع الدليل والتوصية ومسار الاعتماد.' },
          { label: 'افتح مركز الذكاء', path: '/intelligence/recommendations', hint: 'افحص مجموعة التوصيات وسياقها الكامل.' },
        ],
        evidence: { source: 'get_dashboard_intelligence', asOf, status: item.status || 'unknown' },
      });
      return;
    }

    const item = entry.item as Alert;
    setInvestigation({
      title: item.title,
      eyebrow: 'تنبيه أعمال · مصدر الذكاء الكانوني',
      severity: toSeverity(item.severity),
      summary: item.description || 'تنبيه مسجل في طبقة ذكاء الأعمال؛ لا نفترض سببه الجذري من العنوان وحده.',
      facts: [
        { label: 'النوع', value: item.category || 'غير محدد' },
        { label: 'الأولوية', value: priorityLabel(item.severity) },
        { label: 'قيمة المؤشر', value: item.metric_value == null ? 'غير متاح' : formatNumber(item.metric_value) },
        { label: 'الحد المرجعي', value: item.threshold == null ? 'غير متاح' : formatNumber(item.threshold) },
      ],
      confirmedReasons: ['التنبيه صادر عن get_dashboard_intelligence.'],
      missingEvidence: ['السبب الجذري.', 'الأثر المالي المؤكد.', 'نتيجة الإجراء بعد التنفيذ.'],
      actions: [
        { label: 'افتح مركز العمل', path: '/work-center', hint: 'راجع الاستثناءات والبيانات القابلة للإجراء.' },
        { label: 'افتح مركز الذكاء', path: '/intelligence', hint: 'راجع سياق التنبيه والقرارات المرتبطة.' },
      ],
      evidence: { source: 'get_dashboard_intelligence', asOf, status: item.severity || 'unknown' },
    });
  };

  return (
    <div dir="rtl" className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-ink-950 p-6 text-white lg:p-8">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary-300"><Sparkles size={16} /> مركز القيادة التنفيذي</div>
            <h1 className="mt-2 text-2xl font-bold lg:text-3xl">صورة العمل الآن</h1>
            <p className="mt-2 max-w-2xl text-ink-300">المؤشرات وإشارات القرار تُقرأ من مصادر الأعمال الكانونية، مع فصل واضح بين الرقم والدليل والتوصية والتنفيذ.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-1">
            {[[1, 'شهر'], [3, '3 أشهر'], [6, '6 أشهر']].map(([value, label]) => (
              <button key={value} onClick={() => setMonths(Number(value))} type="button" aria-pressed={months === value} className={months === value ? 'rounded-xl px-4 py-2 text-sm bg-white text-ink-900 shadow-sm' : 'rounded-xl px-4 py-2 text-sm text-ink-300 hover:bg-white/10'}>{label}</button>
            ))}
          </div>
        </div>
      </section>
      {!loading && !error && kpis && <TruthContextStrip status={kpis.status} asOf={asOf} asOfLabel="حتى" rangeLabel={'آخر ' + months + (months === 1 ? ' شهر' : ' أشهر')} />}
      {loading && <div className="rounded-2xl border border-ink-200 bg-white p-6 text-sm text-ink-500">جارٍ تحميل الصورة التنفيذية من المصدر…</div>}
      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>}
      {!loading && !error && kpis?.status === 'INSUFFICIENT_DATA' && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">البيانات الحالية غير كافية لإصدار جميع المؤشرات بثقة. لا يتم عرض قيم افتراضية أو أولويات مشتقة من الواجهة.</div>}
      {!loading && !error && completeKpis && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(card => {
            const Icon = card.icon;
            return <button key={card.label} type="button" onClick={() => openKpi(card)} className="rounded-2xl border border-ink-200 bg-white p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              <div className="flex items-center justify-between"><div className="rounded-xl bg-ink-50 p-2.5"><Icon size={20} /></div><span className={"rounded-full px-2 py-1 text-xs font-semibold " + statusBadgeClass(completeKpis.status)}>{statusLabel(completeKpis.status)}</span></div>
              <p className="mt-5 text-sm text-ink-500">{card.label}</p><strong className="text-2xl">{card.value}</strong>
            </button>;
          })}
        </section>
      )}
      {!loading && !error && <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-ink-200 bg-white p-5">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">طابور القرار</h2><p className="mt-1 text-sm text-ink-500">هذه العناصر جاءت من طبقة الذكاء الكانونية؛ افتحها لتمييز ما هو مثبت عمّا يحتاج دليلًا إضافيًا.</p></div><BrainCircuit size={22} /></div>
          {queue.length ? <div className="mt-5 space-y-3">{queue.map(entry => {
            const id = entry.kind + ':' + entry.item.id;
            const isSelected = !!selected && id === (selected.kind + ':' + selected.item.id);
            const title = entry.item.title;
            const label = entry.kind === 'recommendation' ? 'توصية' : 'تنبيه';
            const priority = entry.kind === 'recommendation' ? (entry.item as Recommendation).priority : (entry.item as Alert).severity;
            return <button key={id} type="button" onClick={() => openQueueItem(entry)} className={isSelected ? 'w-full rounded-2xl border border-primary-300 bg-primary-50/60 p-4 text-right transition' : 'w-full rounded-2xl border border-ink-200 bg-white p-4 text-right transition hover:bg-ink-50'}>
              <div className="flex items-center gap-3"><div className={"h-2.5 w-2.5 shrink-0 rounded-full " + (entry.kind === 'alert' ? 'bg-warning-500' : 'bg-primary-500')} aria-hidden="true" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-ink-900">{title}</p><span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-600">{label}</span></div><p className="mt-1 text-xs text-ink-500">{priorityLabel(priority)}</p></div><ChevronLeft size={18} className="shrink-0 text-ink-400" /></div>
            </button>;
          })}</div> : <div className="mt-5 rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 p-6 text-sm text-ink-500"><ShieldAlert size={18} className="mb-2 text-ink-400" /><div className="font-bold text-ink-700">لا توجد إشارة مثبتة الآن</div><div className="mt-1 leading-6">لن نخترع فرصة أو خطرًا. عند ظهور توصية أو تنبيه موثق سيظهر هنا مع مصدره.</div></div>}
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-5">
          <div className="flex items-center gap-2"><CircleAlert size={20} /><h2 className="font-bold">التفسير والأدلة</h2></div>
          {selected ? <div className="mt-4"><p className="text-sm leading-7 text-ink-600">{selected.item.description || 'عنصر يحتاج مراجعة من المصدر.'}</p><div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">النوع</div><div className="mt-1 text-xs font-bold">{selected.kind === 'recommendation' ? 'توصية' : 'تنبيه'}</div></div><div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">الأولوية</div><div className="mt-1 text-xs font-bold">{priorityLabel(selected.kind === 'recommendation' ? (selected.item as Recommendation).priority : (selected.item as Alert).severity)}</div></div></div><button type="button" onClick={() => openQueueItem(selected)} className="btn-primary mt-4 text-xs">فتح التحقيق ←</button></div> : <div className="mt-4 rounded-xl bg-ink-50 p-4 text-sm text-ink-500">لا توجد توصية أو تنبيه مثبت لعرضه الآن.</div>}
        </div>
      </section>}
      {!loading && !error && <section className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><Bell size={20} /><h2 className="font-bold">مركز الانتباه</h2></div><div className="mt-4 grid gap-3 md:grid-cols-2">{alerts.slice(0, 4).map(alert => <button key={alert.id} type="button" onClick={() => openQueueItem({ kind: 'alert', item: alert })} className="rounded-xl border border-ink-100 bg-ink-50/50 p-4 text-right hover:border-primary-200"><div className="flex items-center justify-between gap-2"><span className="text-xs font-black text-ink-700">{alert.category || 'تنبيه أعمال'}</span><span className="text-[10px] font-bold text-ink-500">{priorityLabel(alert.severity)}</span></div><p className="mt-2 text-sm font-semibold text-ink-900">{alert.title}</p><p className="mt-1 text-xs leading-5 text-ink-500">{alert.description || 'لا يوجد وصف إضافي من المصدر.'}</p></button>)}</div></section>}
      <Suspense fallback={null}><BusinessInvestigationDrawer target={investigation} onClose={() => setInvestigation(null)} /></Suspense>
    </div>
  );
}
