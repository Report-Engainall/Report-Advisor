import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { ArrowUpLeft, BarChart3, Brain, CalendarRange, CheckCircle2, CircleAlert, Database, FileSearch, Package, Receipt, RefreshCw, TrendingUp, Upload, Wallet, Target, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TruthContextStrip } from '@/components/TruthContextStrip';
import type { InvestigationTarget } from '@/components/BusinessInvestigationDrawer';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/States';
const TrendChart = lazy(async () => ({ default: (await import('@/components/ui/Charts')).TrendChart }));
const CategoryPieChart = lazy(async () => ({ default: (await import('@/components/ui/Charts')).CategoryPieChart }));
const HorizontalBarChart = lazy(async () => ({ default: (await import('@/components/ui/Charts')).HorizontalBarChart }));
import { fetchDashboardSnapshot, fetchDashboardIntelligence } from '@/lib/dashboard-canonical';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Recommendation, Alert } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingDashboard } from '@/lib/dashboard-canonical';

const BusinessInvestigationDrawer = lazy(async () => ({ default: (await import('@/components/BusinessInvestigationDrawer')).BusinessInvestigationDrawer }));

const TREND_RANGES = [{ value: 3, label: '3 أشهر' }, { value: 6, label: '6 أشهر' }, { value: 12, label: '12 شهرًا' }] as const;
const metricStatus = (value: number | null, snapshotStatus: DashboardKPIs['status']): 'CONFIRMED' | 'CALCULATED' | 'INSUFFICIENT_DATA' => value === null ? 'INSUFFICIENT_DATA' : snapshotStatus === 'CONFIRMED' ? 'CONFIRMED' : 'CALCULATED';
const valueLabel = (label: string, value: number | null, format: 'currency' | 'number' | 'percent') => {
  if (value === null) return 'غير متاح';
  if (format === 'currency') return formatCurrency(value);
  if (format === 'percent') return value.toFixed(1) + '%';
  return new Intl.NumberFormat('ar-YE').format(value);
};

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [snapshotAsOf, setSnapshotAsOf] = useState<string | null>(null);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopEntity[]>([]);
  const [topProducts, setTopProducts] = useState<TopEntity[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [aging, setAging] = useState<AgingDashboard | null>(null);
  const [trendMonths, setTrendMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [investigation, setInvestigation] = useState<InvestigationTarget | null>(null);

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      setError(null);
      const [{ kpis: nextKpis, trend: nextTrend, topCustomers: customers, topProducts: products, categories: nextCategories, aging: nextAging, asOf: nextAsOf }, intelligence] = await Promise.all([fetchDashboardSnapshot(trendMonths), fetchDashboardIntelligence()]);
      setKpis(nextKpis);
      setSnapshotAsOf(nextAsOf);
      setTrend(nextTrend);
      setTopCustomers(customers.slice(0, 5));
      setTopProducts(products.slice(0, 5));
      setCategories(nextCategories);
      setAging(nextAging);
      setRecommendations(intelligence.recommendations);
      setAlerts(intelligence.alerts);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'فشل تحميل لوحة التحكم');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trendMonths]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState message="جارٍ بناء الصورة التنفيذية من المصدر..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!kpis || !aging) return null;

  const confirmed = [kpis.totalSales, kpis.grossProfit, kpis.totalReceivables, kpis.inventoryValue, kpis.totalCustomers, kpis.totalProducts, kpis.invoiceCount, kpis.collectionRate].filter(value => value !== null).length;
  const coverage = Math.round((confirmed / 8) * 100);
  const liveRecommendations = recommendations.filter(row => row.status === 'new' || row.status === 'accepted').slice(0, 4);
  const liveAlerts = alerts.slice(0, 4);

  const openKpi = (label: string, value: number | null, format: 'currency' | 'number' | 'percent', actions: InvestigationTarget['actions']) => {
    setInvestigation({
      title: label,
      eyebrow: 'مؤشر تجاري · نقطة دخول للتحقيق',
      severity: value === null ? 'warning' : 'info',
      summary: value === null ? 'هذا المؤشر لا يملك قيمة موثوقة في اللقطة الحالية، لذلك لا يتم عرض صفر أو تفسير مصطنع.' : 'انقرنا على المؤشر لفتح سياقه الكامل: القيمة، حدود الدليل، ما نعرفه وما لا نعرفه، والمسار التالي للتحقق أو القرار.',
      facts: [
        { label: 'القيمة الحالية', value: valueLabel(label, value, format) },
        { label: 'الحالة', value: kpis.status === 'CONFIRMED' ? 'مصدر مؤكد' : kpis.status === 'CALCULATED' ? 'محسوب من المصدر' : 'بيانات غير كافية' },
        { label: 'حتى', value: snapshotAsOf ?? 'غير متاح' },
        { label: 'التغطية', value: coverage + '% من مؤشرات الصورة التنفيذية' },
      ],
      confirmedReasons: [],
      missingEvidence: ['سبب التغير الجذري، إن وجد، يحتاج إلى سلسلة بيانات تفسيرية مرتبطة بهذا المؤشر؛ لا نشتقها من الرقم وحده.'],
      actions,
      evidence: { source: 'get_dashboard_snapshot', asOf: snapshotAsOf ?? 'غير متاح', status: kpis.status, period: 'آخر ' + trendMonths + ' أشهر', formula: label === 'إجمالي الربح' ? 'الإيرادات − التكلفة، وفق مصدر الربحية الكانوني' : undefined },
    });
  };

  const openAlert = (alert: Alert) => {
    setInvestigation({
      title: alert.title,
      eyebrow: 'إشارة أعمال · مركز الانتباه',
      severity: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : alert.severity === 'opportunity' ? 'opportunity' : 'info',
      summary: alert.description || 'تنبيه مسجل في طبقة ذكاء الأعمال. السبب الجذري لا يُفترض من العنوان وحده.',
      facts: [
        { label: 'نوع الإشارة', value: alert.category || 'غير محدد' },
        { label: 'الخطورة', value: alert.severity || 'غير محددة' },
        { label: 'قيمة المؤشر', value: alert.metric_value == null ? 'غير متاح' : String(alert.metric_value) },
        { label: 'وقت الإشارة', value: relativeTime(alert.created_at) },
      ],
      confirmedReasons: [],
      missingEvidence: ['سلسلة السبب الجذري المرتبطة بالمؤشر.', 'الفترة والمقارنة التي أنتجت الإشارة.', 'الأثر المالي المؤكد قبل اعتبار الإجراء ضروريًا.'],
      actions: [
        { label: 'افتح مركز التحقيق والذكاء', path: '/intelligence', hint: 'فحص التفسير والتوصيات والتنبؤات المرتبطة بالإشارة.' },
        { label: 'افتح مركز العمل', path: '/work-center', hint: 'راجع ما يحتاج إجراءً فعليًا بعد التحقق.' },
        { label: 'افتح التقرير التنفيذي', path: '/reports/executive', hint: 'ضع الإشارة داخل صورة المال والمخاطر والفرص.' },
      ],
      evidence: { source: 'get_dashboard_intelligence', asOf: alert.created_at, status: alert.is_read ? 'تمت القراءة' : 'إشارة نشطة', formula: alert.threshold == null ? undefined : 'القيمة ' + String(alert.metric_value ?? 'غير متاحة') + ' مقابل حد ' + String(alert.threshold) },
    });
  };

  const openRecommendation = (row: Recommendation) => {
    setInvestigation({
      title: row.title,
      eyebrow: 'قرار مقترح · طابور القرار',
      severity: row.priority === 'high' ? 'warning' : 'info',
      summary: row.description || 'توصية مشتقة من البيانات الحالية. فتحها لا يعني قبولها أو تنفيذها.',
      facts: [
        { label: 'الأولوية', value: row.priority || 'غير محددة' },
        { label: 'الثقة', value: row.confidence || 'غير متاحة' },
        { label: 'الأثر المتوقع', value: row.expected_impact == null ? 'غير متاح' : String(row.expected_impact) },
        { label: 'الحالة', value: row.status || 'غير محددة' },
      ],
      confirmedReasons: [],
      missingEvidence: ['سبب التوصية التفصيلي ومسار الإثبات المرتبط بها قبل اعتماد القرار.'],
      actions: [
        { label: 'افتح تجربة القرار', path: '/decision-experience', hint: 'افحص الأدلة والموافقة ونقطة القرار قبل أي تنفيذ.' },
        { label: 'افتح مركز الذكاء', path: '/intelligence', hint: 'راجع التفسير والتنبؤات والتوصيات ذات الصلة.' },
        { label: 'افتح مركز العمل', path: '/work-center', hint: 'انتقل للإجراء فقط بعد التحقق والموافقة عند الحاجة.' },
      ],
      evidence: { source: 'get_dashboard_intelligence', asOf: row.created_at, status: row.status || 'غير محددة' },
    });
  };

  const openContext = (title: string, summary: string, path: string, source: string) => {
    setInvestigation({
      title,
      eyebrow: 'سياق أعمال · استكشاف',
      severity: 'info',
      summary,
      facts: [
        { label: 'النطاق', value: 'آخر ' + trendMonths + ' أشهر' },
        { label: 'حتى', value: snapshotAsOf ?? 'غير متاح' },
        { label: 'حالة المصدر', value: kpis.status },
        { label: 'التغطية', value: coverage + '%' },
      ],
      confirmedReasons: [],
      missingEvidence: ['تفاصيل السببية تحتاج إلى فتح مسار التحليل المختص وليس استنتاجها من التجميع التنفيذي وحده.'],
      actions: [
        { label: 'افتح المسار المختص', path, hint: 'انتقل من الإشارة إلى بيئة التحقيق الكاملة.' },
        { label: 'افتح القرار', path: '/decision-experience', hint: 'حوّل الفهم إلى قرار بعد مراجعة الدليل.' },
      ],
      evidence: { source, asOf: snapshotAsOf ?? 'غير متاح', status: kpis.status, period: 'آخر ' + trendMonths + ' أشهر' },
    });
  };

  return (
    <div dir="rtl" className="animate-fade-in space-y-6 pb-10">
      <section className="command-strip -mx-3 -mt-3 mb-1 sm:-mx-4 lg:-mx-5 2xl:-mx-6">
        <div className="px-4 py-4 lg:px-5 2xl:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0"><div className="section-kicker">BUSINESS COMMAND SYSTEM · الآن</div><h1 className="mt-1 text-[25px] font-black tracking-tight text-ink-950">نبض الأعمال</h1><p className="mt-1 max-w-3xl text-xs leading-6 text-ink-500">لا تبدأ من «تقرير». ابدأ من الإشارة: ماذا تغيّر، لماذا، ما الدليل، وما القرار الذي يستحق أن يُتخذ.</p></div>
            <div className="flex flex-wrap gap-1.5"><Link to="/import" className="btn-primary text-xs"><Upload size={14}/> إدخال بيانات</Link><Link to="/decision-experience" className="btn-secondary text-xs"><Target size={14}/> قرارات اليوم</Link><Link to="/command-center" className="btn-ghost text-xs"><Brain size={14}/> القيادة</Link></div>
          </div>
        </div>
      </section>

      <TruthContextStrip months={trendMonths} status={kpis.status} asOf={snapshotAsOf ?? 'غير متاح'} />

      <section className="rounded-[18px] border border-[#15372f] bg-[#0d2a24] p-4 text-white shadow-[0_14px_40px_rgba(13,42,36,.16)] sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch">
          <button type="button" onClick={() => liveAlerts[0] && openAlert(liveAlerts[0])} className="flex min-h-[132px] flex-1 flex-col justify-between rounded-2xl border border-white/10 bg-white/[.045] p-4 text-right transition hover:bg-white/[.075]">
            <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-black tracking-[0.12em] text-white/45">1 · WHAT CHANGED</span><CircleAlert size={16} className="text-amber-300"/></div>
            <div><div className="text-sm font-black">{liveAlerts[0]?.title || 'لا توجد إشارة جديدة'}</div><p className="mt-1 text-[11px] leading-5 text-white/55">{liveAlerts[0]?.description || 'الصورة التنفيذية لا تحتوي حاليًا على تنبيه يحتاج تدخلاً مثبتًا.'}</p></div>
          </button>
          <button type="button" onClick={() => liveRecommendations[0] && openRecommendation(liveRecommendations[0])} className="flex min-h-[132px] flex-1 flex-col justify-between rounded-2xl border border-white/10 bg-white/[.045] p-4 text-right transition hover:bg-white/[.075]">
            <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-black tracking-[0.12em] text-white/45">2 · WHAT MATTERS</span><Target size={16} className="text-emerald-300"/></div>
            <div><div className="text-sm font-black">{liveRecommendations[0]?.title || 'لا يوجد قرار جاهز للمراجعة'}</div><p className="mt-1 text-[11px] leading-5 text-white/55">{liveRecommendations[0]?.description || 'لا يتم اختلاق توصيات عندما لا يوجد مصدر حقيقي لها.'}</p></div>
          </button>
          <button type="button" onClick={() => openContext('درجة الثقة في الصورة التنفيذية', 'هذه ليست درجة جودة تجميلية؛ إنها توضح مدى اكتمال القيم الأساسية قبل اتخاذ قرار.', '/data-quality', 'get_dashboard_snapshot')} className="flex min-h-[132px] flex-1 flex-col justify-between rounded-2xl border border-white/10 bg-white/[.045] p-4 text-right transition hover:bg-white/[.075]">
            <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-black tracking-[0.12em] text-white/45">3 · CAN I TRUST IT?</span><ShieldCheck size={16} className="text-sky-300"/></div>
            <div><div className="text-3xl font-black tabular-nums">{coverage}%</div><p className="mt-1 text-[11px] leading-5 text-white/55">تغطية مؤشرات الصورة التنفيذية الحالية · انقر لمعرفة الحدود والأدلة الناقصة.</p></div>
          </button>
        </div>
        <div className="mt-4 grid gap-2 text-[10px] font-black text-white/45 sm:grid-cols-6">
          {['إشارة', 'سياق', 'دليل', 'تفسير', 'قرار', 'نتيجة'].map((step, index) => <div key={step} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full border border-white/15 bg-white/5 text-white/65">{index + 1}</span><span>{step}</span>{index < 5 && <span className="hidden h-px flex-1 bg-white/10 sm:block" />}</div>)}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-4">
        <KPICard label="إجمالي المبيعات" value={kpis.totalSales} format="currency" icon={<TrendingUp size={16}/>} status={metricStatus(kpis.totalSales,kpis.status)} onClick={() => openKpi('إجمالي المبيعات', kpis.totalSales, 'currency', [{ label: 'افتح التقرير التنفيذي', path: '/reports/executive', hint: 'افهم الحركة والأثر على الصورة الكلية.' }, { label: 'افتح التحليل', path: '/analytics', hint: 'افحص الاتجاهات والأسباب عند توفر البيانات.' }])} interactiveLabel="افتح تحقيق إجمالي المبيعات"/>
        <KPICard label="إجمالي الربح" value={kpis.grossProfit} format="currency" icon={<BarChart3 size={16}/>} status={metricStatus(kpis.grossProfit,kpis.status)} hint={kpis.grossMargin===null?undefined:'الهامش '+kpis.grossMargin.toFixed(1)+'%'} onClick={() => openKpi('إجمالي الربح', kpis.grossProfit, 'currency', [{ label: 'افتح الربحية', path: '/reports/profitability', hint: 'راجع الهامش والتكلفة واتساق العملة.' }, { label: 'افتح القرار', path: '/decision-experience', hint: 'افحص التوصيات ذات الأثر المالي.' }])} interactiveLabel="افتح تحقيق إجمالي الربح"/>
        <KPICard label="الذمم المدينة" value={kpis.totalReceivables} format="currency" icon={<Receipt size={16}/>} status={metricStatus(kpis.totalReceivables,kpis.status)} onClick={() => openKpi('الذمم المدينة', kpis.totalReceivables, 'currency', [{ label: 'افتح التحصيل', path: '/reports/receivables', hint: 'افحص الأعمار والتحصيل والحالات المستثناة.' }, { label: 'افتح مركز العمل', path: '/work-center', hint: 'تحويل الحالات المثبتة إلى إجراءات.' }])} interactiveLabel="افتح تحقيق الذمم المدينة"/>
        <KPICard label="قيمة المخزون" value={kpis.inventoryValue} format="currency" icon={<Package size={16}/>} status={metricStatus(kpis.inventoryValue,kpis.status)} onClick={() => openKpi('قيمة المخزون', kpis.inventoryValue, 'currency', [{ label: 'افتح ذكاء المخزون', path: '/reports/inventory-intelligence', hint: 'افحص الطلب والتغطية والحالات المثبتة فقط.' }, { label: 'افتح المخزون', path: '/inventory', hint: 'راجع الرصيد والقيمة من المصدر.' }])} interactiveLabel="افتح تحقيق قيمة المخزون"/>
      </section>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-ink-200 bg-ink-200 sm:grid-cols-4">
        {[['العملاء',kpis.totalCustomers],['المنتجات',kpis.totalProducts],['الفواتير',kpis.invoiceCount],['معدل التحصيل',kpis.collectionRate]].map(([label,value]) => <button key={label} type="button" onClick={() => openKpi(String(label), value as number | null, label === 'معدل التحصيل' ? 'percent' : 'number', [{ label: 'افتح مركز القيادة', path: '/command-center', hint: 'ضع المؤشر داخل سياق الصورة التجارية.' }, { label: 'افتح مركز الذكاء', path: '/intelligence', hint: 'استكشف ما إذا كان المؤشر يستدعي تحليلًا أعمق.' }])} className="bg-white px-3.5 py-3 text-right transition hover:bg-ink-50"><div className="text-[10px] font-semibold text-ink-400">{label}</div><div className="mt-1 text-[15px] font-black tabular-nums text-ink-900">{value===null?'غير متاح':String(value)+(label==='معدل التحصيل'?'%':'')}</div></button>)}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-black text-ink-950">مساحة الإثبات والتحليل</h2><p className="mt-1 text-xs text-ink-500">الفترة تغيّر السياق، ولا تغيّر الحقيقة الأساسية للمصدر.</p></div><div className="flex flex-wrap gap-2"><div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 shadow-sm"><CalendarRange size={15} className="mx-2 text-ink-400"/>{TREND_RANGES.map(item => <button type="button" key={item.value} onClick={() => setTrendMonths(item.value)} className={'rounded-lg px-3 py-1.5 text-xs font-bold ' + (trendMonths === item.value ? 'bg-ink-950 text-white' : 'text-ink-500 hover:bg-ink-50')} aria-pressed={trendMonths === item.value}>{item.label}</button>)}</div><button type="button" onClick={() => void load(true)} disabled={refreshing} className="btn-secondary"><RefreshCw size={15}/><span className="hidden sm:inline">تحديث</span></button></div></div>

      <section className="grid gap-4 lg:grid-cols-[1.45fr_.75fr]">
        <Card hover onClick={() => openContext('اتجاه المبيعات والربح', 'هذا الاتجاه يجيب: ماذا حدث عبر الزمن؟ أما «لماذا حدث» فيحتاج إلى مساحة التحقيق والأدلة المرتبطة بالتغير.', '/analytics', 'get_dashboard_snapshot')}><CardHeader title="اتجاه المبيعات والربح" subtitle={'آخر ' + trendMonths + ' أشهر'} action={<Badge variant="primary">استكشف</Badge>}/><CardBody><Suspense fallback={<div className="py-14" aria-hidden="true" />}>{trend.some(item => item.status === 'CALCULATED') ? <TrendChart data={trend}/> : <div className="py-14 text-center text-sm text-ink-400">لا توجد بيانات اتجاه قابلة للحساب.</div>}</Suspense></CardBody></Card>
        <Card hover onClick={() => openContext('توزيع النشاط', 'التوزيع يصف أين تتركز الحركة في الصورة الحالية؛ لا يحول الفئة إلى سبب بمجرد ارتفاعها.', '/analytics', 'get_dashboard_snapshot')}><CardHeader title="توزيع النشاط" subtitle="التصنيف القادم من المصدر الكانوني" action={<Badge variant="neutral">سياق</Badge>}/><CardBody><Suspense fallback={<div className="py-14" aria-hidden="true" />}>{categories.length ? <CategoryPieChart data={categories.map(item => ({ ...item, name: item.categoryStatus === 'UNKNOWN' ? 'UNKNOWN' : item.name ?? 'UNKNOWN' }))}/> : <div className="py-14 text-center text-sm text-ink-400">لا توجد بيانات فئات.</div>}</Suspense></CardBody></Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader title="مركز الانتباه" subtitle="كل إشارة قابلة للفتح والتحقيق، لا مجرد لون على الشاشة"/><CardBody><div className="space-y-3">{liveAlerts.map(alert => <button key={alert.id} type="button" onClick={() => openAlert(alert)} className="flex w-full items-start gap-3 rounded-2xl border border-ink-100 bg-ink-50/70 p-4 text-right transition hover:border-primary-200 hover:bg-primary-50/30"><SeverityBadge severity={alert.severity}/><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink-800">{alert.title}</span>{alert.description && <span className="mt-1 block text-xs leading-5 text-ink-500">{alert.description}</span>}</span><span className="shrink-0 text-[10px] text-ink-400">{relativeTime(alert.created_at)}</span><ArrowUpLeft size={15} className="mt-1 shrink-0 text-ink-300"/></button>)}{liveAlerts.length === 0 && <div className="py-10 text-center text-sm text-ink-400">لا توجد تنبيهات نشطة.</div>}</div></CardBody></Card>
        <Card><CardHeader title="طابور القرار" subtitle="التوصية تفتح مسار التحقق قبل أي تنفيذ"/><CardBody><div className="space-y-3">{liveRecommendations.map(row => <button type="button" key={row.id} onClick={() => openRecommendation(row)} className="flex w-full items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 text-right transition hover:border-primary-200 hover:bg-primary-50/30"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Brain size={17}/></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink-800">{row.title}<PriorityBadge priority={row.priority}/></span>{row.description && <span className="mt-1 block text-xs leading-5 text-ink-500">{row.description}</span>}</span><ArrowUpLeft size={16} className="shrink-0 text-ink-300"/></button>)}{liveRecommendations.length === 0 && <div className="py-10 text-center text-sm text-ink-400">لا توجد توصيات قابلة للمراجعة الآن.</div>}</div></CardBody></Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card hover onClick={() => openContext('محفظة العملاء', 'العملاء يظهرون هنا كإشارة تجارية: قيمة، تركّز، ومجال لاستكشاف التحصيل والسلوك عندما تتوفر الأدلة.', '/customers', 'get_dashboard_snapshot')}><CardHeader title="محفظة العملاء" subtitle="ليست قائمة CRUD؛ هذه نقطة دخول لفهم القيمة والسلوك" action={<Badge variant="primary">تحقيق</Badge>}/><CardBody><Suspense fallback={<div className="py-12" aria-hidden="true" />}>{topCustomers.length ? <HorizontalBarChart data={topCustomers} dataKey="value" nameKey="name" height={230}/> : <div className="py-12 text-center text-sm text-ink-400">لا توجد بيانات.</div>}</Suspense></CardBody></Card>
        <Card hover onClick={() => openContext('محفظة المنتجات', 'المنتج هنا جزء من المال والمخزون والطلب، وليس سجلًا منفصلًا عن القرار.', '/products', 'get_dashboard_snapshot')}><CardHeader title="محفظة المنتجات" subtitle="الحركة والقيمة ومسار المخزون والربحية" action={<Badge variant="primary">تحقيق</Badge>}/><CardBody><Suspense fallback={<div className="py-12" aria-hidden="true" />}>{topProducts.length ? <HorizontalBarChart data={topProducts} dataKey="value" nameKey="name" height={230}/> : <div className="py-12 text-center text-sm text-ink-400">لا توجد بيانات.</div>}</Suspense></CardBody></Card>
        <Card hover onClick={() => openContext('أعمار الذمم', 'الأعمار تصف توزيع التعرض المالي. تحديد السبب أو الإجراء يحتاج إلى فاتورة وعميل وأدلة التحصيل ذات الصلة.', '/reports/receivables', 'get_dashboard_snapshot')}><CardHeader title="أعمار الذمم" subtitle={aging.status === 'CALCULATED' && aging.totalAmount !== null ? 'الإجمالي: ' + formatCurrency(aging.totalAmount) : aging.status === 'NO_DATA' ? 'لا توجد بيانات ذمم' : 'بيانات غير كافية'} action={<Badge variant="neutral">تحقيق</Badge>}/><CardBody><div className="space-y-1">{aging.rows.map(bucket => <div key={bucket.bucket} className="flex items-center justify-between border-b border-ink-100 py-2.5"><span className="text-xs font-semibold text-ink-600">{bucket.bucket}</span><span className="text-xs text-ink-500">{bucket.amount === null ? 'UNKNOWN' : formatCurrency(bucket.amount)} · {bucket.count} فاتورة</span></div>)}{aging.unknownRows > 0 && <div className="pt-3 text-[11px] text-ink-400">UNKNOWN: {aging.unknownRows} فاتورة بلا تاريخ استحقاق.</div>}</div></CardBody></Card>
      </section>

      <section><div className="mb-3"><h2 className="text-lg font-black text-ink-950">مسارات العمل</h2><p className="mt-1 text-xs text-ink-500">عندما يحتاج المستخدم إلى التنفيذ، تنتقل الواجهة من الفهم إلى مساحة عمل واضحة.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[{ path: '/work-center', label: 'مركز العمل', text: 'الحالات والاستثناءات والتنفيذ', icon: CheckCircle2 },{ path: '/import', label: 'إدخال البيانات', text: 'من المصدر إلى الدورة الحاكمة', icon: Upload },{ path: '/intelligence', label: 'مركز الذكاء', text: 'التفسير والتوصيات والتنبؤ', icon: Brain },{ path: '/reports/executive', label: 'التقرير التنفيذي', text: 'قصة القرار والأثر', icon: FileSearch }].map(action => { const Icon = action.icon; return <Link key={action.path} to={action.path} className="card card-hover flex items-center gap-3 p-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><Icon size={19}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-black text-ink-800">{action.label}</span><span className="mt-1 block text-[11px] text-ink-400">{action.text}</span></span><ArrowUpLeft size={16} className="text-ink-300"/></Link>; })}</div></section>

      <div className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 text-[11px] text-ink-500"><Database size={15} className="shrink-0 text-primary-600"/><span>كل نتيجة قابلة للنقر تفتح سياقها قبل القرار: <strong className="text-ink-800">النتيجة → السبب المثبت → الدليل الناقص → الإجراء المقترح → متابعة الأثر.</strong></span><Wallet size={15} className="ms-auto hidden shrink-0 text-ink-300 sm:block"/></div>
      <Suspense fallback={null}><BusinessInvestigationDrawer target={investigation} onClose={() => setInvestigation(null)} /></Suspense>
    </div>
  );
}
