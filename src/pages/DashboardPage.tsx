import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpLeft, BarChart3, Brain, CalendarRange, CheckCircle2, CircleAlert, FileSearch,
  Package, Receipt, RefreshCw, Sparkles, TrendingDown, TrendingUp, Upload, Users, WalletCards
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TruthContextStrip } from '@/components/TruthContextStrip';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { TrendChart, CategoryPieChart, HorizontalBarChart } from '@/components/ui/Charts';
import { fetchDashboardSnapshot, fetchDashboardIntelligence } from '@/lib/dashboard-canonical';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Recommendation, Alert } from '@/lib/types';
import type {
  DashboardKPIs,
  MonthlyTrend,
  TopEntity,
  CategoryBreakdown,
  AgingDashboard,
} from '@/lib/dashboard-canonical';
import { readWorkspacePreferences, type WorkspacePreferences } from '@/lib/workspace-mode';

const TREND_RANGES = [
  { value: 3, label: '3 أشهر' },
  { value: 6, label: '6 أشهر' },
  { value: 12, label: '12 شهرًا' },
] as const;

const metricStatus = (
  value: number | null,
  snapshotStatus: DashboardKPIs['status'],
): 'CONFIRMED' | 'CALCULATED' | 'INSUFFICIENT_DATA' =>
  value === null ? 'INSUFFICIENT_DATA' : snapshotStatus === 'CONFIRMED' ? 'CONFIRMED' : 'CALCULATED';

function StatusLine({ status, text }: { status: DashboardKPIs['status']; text: string }) {
  const icon = status === 'INSUFFICIENT_DATA'
    ? <CircleAlert size={13} />
    : <CheckCircle2 size={13} />;
  const tone = status === 'INSUFFICIENT_DATA'
    ? 'text-warning-700 bg-warning-50'
    : 'text-success-700 bg-success-50';

  return (
    <span className={'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-black ' + tone}>
      {icon}
      {text}
    </span>
  );
}

function PulseMetric({
  label,
  value,
  detail,
  icon,
  status,
}: {
  label: string;
  value: number | null;
  detail?: string;
  icon: React.ReactNode;
  status: 'CONFIRMED' | 'CALCULATED' | 'INSUFFICIENT_DATA';
}) {
  const stateLabel = status === 'CONFIRMED' ? 'مثبت' : status === 'CALCULATED' ? 'محسوب' : 'غير كافٍ';
  const stateTone = status === 'CONFIRMED'
    ? 'text-success-700 bg-success-50'
    : status === 'CALCULATED'
      ? 'text-primary-700 bg-primary-50'
      : 'text-warning-700 bg-warning-50';

  return (
    <div className="min-w-0 border-l border-ink-100 px-4 py-3 last:border-l-0">
      <div className="flex items-center gap-2 text-[10px] font-bold text-ink-400">
        <span className="text-ink-500">{icon}</span>
        {label}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[18px] font-black tabular-nums text-ink-950">{value === null ? 'غير متاح' : formatCurrency(value)}</div>
          {detail && <div className="mt-0.5 truncate text-[10px] text-ink-400">{detail}</div>}
        </div>
        <span className={'rounded-full px-2 py-1 text-[9px] font-black ' + stateTone}>{stateLabel}</span>
      </div>
    </div>
  );
}

function AttentionCard({
  alert,
  recommendation,
}: {
  alert?: Alert;
  recommendation?: Recommendation;
}) {
  if (alert) {
    return (
      <article className="rounded-[14px] border border-ink-200 bg-white p-4 shadow-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-700">
            <CircleAlert size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={alert.severity} />
              <span className="text-[10px] text-ink-400">{relativeTime(alert.created_at)}</span>
            </div>
            <h3 className="mt-2 text-[13px] font-black text-ink-900">{alert.title}</h3>
            {alert.description && <p className="mt-1 text-[11px] leading-5 text-ink-500">{alert.description}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/command-center" className="btn-secondary text-[11px]">تحقيق الإشارة <ArrowUpLeft size={13} /></Link>
              <Link to="/metrics" className="btn-ghost text-[11px]">فحص المؤشر</Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (recommendation) {
    return (
      <article className="rounded-[14px] border border-primary-100 bg-primary-50/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-primary-700">قرار مقترح</span>
              <PriorityBadge priority={recommendation.priority} />
            </div>
            <h3 className="mt-2 text-[13px] font-black text-ink-900">{recommendation.title}</h3>
            {recommendation.description && <p className="mt-1 text-[11px] leading-5 text-ink-500">{recommendation.description}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/decision-experience?stage=decision" className="btn-primary text-[11px]">فتح القرار <ArrowUpLeft size={13} /></Link>
              <Link to="/intelligence" className="btn-ghost text-[11px]">فتح الذكاء</Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return null;
}

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
  const [workspacePreferences, setWorkspacePreferences] = useState<WorkspacePreferences>(readWorkspacePreferences);

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [
        {
          kpis: nextKpis,
          trend: nextTrend,
          topCustomers: customers,
          topProducts: products,
          categories: nextCategories,
          aging: nextAging,
          asOf: nextAsOf,
        },
        intelligence,
      ] = await Promise.all([
        fetchDashboardSnapshot(trendMonths),
        fetchDashboardIntelligence(),
      ]);

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
      setError(cause instanceof Error ? cause.message : 'فشل تحميل لوحة الأعمال');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trendMonths]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const sync = () => setWorkspacePreferences(readWorkspacePreferences());
    window.addEventListener('storage', sync);
    window.addEventListener('report-advisor:workspace-preferences', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('report-advisor:workspace-preferences', sync);
    };
  }, []);

  const liveAlerts = useMemo(
    () => alerts.filter((item) => !item.is_read).slice(0, 3),
    [alerts],
  );
  const liveRecommendations = useMemo(
    () => recommendations.filter((item) => item.status === 'new' || item.status === 'accepted').slice(0, 3),
    [recommendations],
  );

  if (loading) return <LoadingState message="جارٍ بناء صورة الأعمال من المصدر..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!kpis || !aging) return null;

  const evidenceMetrics = [
    kpis.totalSales,
    kpis.grossProfit,
    kpis.totalReceivables,
    kpis.inventoryValue,
    kpis.totalCustomers,
    kpis.totalProducts,
    kpis.invoiceCount,
    kpis.collectionRate,
  ];
  const coverage = Math.round((evidenceMetrics.filter((value) => value !== null).length / evidenceMetrics.length) * 100);

  return (
    <div dir="rtl" className="animate-fade-in space-y-5 pb-10">
      <section className="rounded-[18px] border border-ink-200 bg-ink-950 px-5 py-5 text-white shadow-elevated lg:px-6 lg:py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-black text-primary-300">
              <Sparkles size={15} />
              نظام قيادة الأعمال
            </div>
            <h1 className="mt-2 max-w-3xl text-[25px] font-black tracking-tight lg:text-[31px]">ماذا يحتاج عملك الآن؟</h1>
            <p className="mt-2 max-w-3xl text-[12px] leading-6 text-ink-300">
              نبض الأعمال، إشارات الانتباه، والقرارات المقترحة في مسار واحد. كل رقم يبقى مرتبطًا بحالته ولقطة بياناته بدل إظهار قيمة غير موثقة.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/import" className="btn-primary text-[11px]"><Upload size={14} /> إدخال بيانات</Link>
            <Link to="/decision-experience" className="inline-flex items-center justify-center gap-2 rounded-[9px] border border-white/15 bg-white/10 px-3.5 py-2.5 text-[11px] font-bold text-white hover:bg-white/15">قرار اليوم <ArrowUpLeft size={13} /></Link>
            <Link to="/reports/executive" className="inline-flex items-center justify-center gap-2 rounded-[9px] border border-white/15 bg-white/10 px-3.5 py-2.5 text-[11px] font-bold text-white hover:bg-white/15">التقرير التنفيذي <FileSearch size={13} /></Link>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <StatusLine status={kpis.status} text={kpis.status === 'INSUFFICIENT_DATA' ? 'الصورة تحتاج مراجعة' : 'الصورة صالحة للاستخدام'} />
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-ink-200">تغطية المؤشرات {coverage}%</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-ink-200">As-of: {snapshotAsOf ?? 'غير متاح'}</span>
          <button type="button" onClick={() => void load(true)} disabled={refreshing} className="mr-auto inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-white/15 disabled:opacity-60">
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            تحديث الصورة
          </button>
        </div>
      </section>

      <TruthContextStrip months={trendMonths} status={kpis.status} asOf={snapshotAsOf ?? 'غير متاح'} />

      <section className="overflow-hidden rounded-[14px] border border-ink-200 bg-white shadow-card">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          <PulseMetric label="المبيعات" value={kpis.totalSales} icon={<TrendingUp size={15} />} status={metricStatus(kpis.totalSales, kpis.status)} detail="الفترة الحالية" />
          <PulseMetric label="الربح الإجمالي" value={kpis.grossProfit} icon={<BarChart3 size={15} />} status={metricStatus(kpis.grossProfit, kpis.status)} detail={kpis.grossMargin === null ? 'الهامش غير متاح' : 'الهامش ' + kpis.grossMargin.toFixed(1) + '%'} />
          <PulseMetric label="الذمم" value={kpis.totalReceivables} icon={<WalletCards size={15} />} status={metricStatus(kpis.totalReceivables, kpis.status)} detail={kpis.collectionRate === null ? 'التحصيل غير متاح' : 'التحصيل ' + kpis.collectionRate.toFixed(1) + '%'} />
          <PulseMetric label="المخزون" value={kpis.inventoryValue} icon={<Package size={15} />} status={metricStatus(kpis.inventoryValue, kpis.status)} detail="القيمة الحالية" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <Card>
          <CardHeader
            title="مركز الانتباه"
            subtitle="ما يحتاج تدخلًا أو تحقيقًا الآن، مع إبقاء الإشارة مرتبطة بمسارها."
            action={<Link to="/command-center" className="btn-ghost text-[11px]">كل الإشارات <ArrowUpLeft size={13} /></Link>}
          />
          <CardBody>
            <div className="space-y-3">
              {liveAlerts.map((alert) => <AttentionCard key={alert.id} alert={alert} />)}
              {liveAlerts.length === 0 && (
                <div className="rounded-[14px] border border-dashed border-ink-200 bg-ink-50/60 p-8 text-center">
                  <CheckCircle2 className="mx-auto text-success-600" size={24} />
                  <div className="mt-2 text-sm font-black text-ink-800">لا توجد إشارات غير مقروءة الآن</div>
                  <p className="mt-1 text-[11px] text-ink-400">الخطوة التالية يمكن أن تبدأ من التقارير أو من إدخال بيانات جديدة.</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="طابور القرار"
            subtitle="التوصيات المتاحة للمراجعة والتنفيذ من المسار الحالي."
            action={<Link to="/decision-experience" className="btn-ghost text-[11px]">مساحة القرار <ArrowUpLeft size={13} /></Link>}
          />
          <CardBody>
            <div className="space-y-3">
              {liveRecommendations.map((recommendation) => <AttentionCard key={recommendation.id} recommendation={recommendation} />)}
              {liveRecommendations.length === 0 && (
                <div className="rounded-[14px] border border-dashed border-ink-200 bg-ink-50/60 p-8 text-center">
                  <Sparkles className="mx-auto text-ink-300" size={24} />
                  <div className="mt-2 text-sm font-black text-ink-800">لا توجد توصيات قابلة للمراجعة الآن</div>
                  <p className="mt-1 text-[11px] text-ink-400">لن يتم تصنيع قرار دون إشارة أو بيانات كافية.</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </section>

      {workspacePreferences.dashboardWidgets.includes('analysis') && (
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="section-kicker">BUSINESS PULSE</div>
              <h2 className="mt-1 text-lg font-black text-ink-950">الحركة التي تهم القرار</h2>
              <p className="mt-1 text-xs text-ink-500">اتجاه المبيعات والربح من المصدر الكانوني، مع إمكانية تغيير الفترة.</p>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 shadow-sm">
              <CalendarRange size={15} className="mx-2 text-ink-400" />
              {TREND_RANGES.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setTrendMonths(item.value)}
                  className={'rounded-lg px-3 py-1.5 text-xs font-bold ' + (trendMonths === item.value ? 'bg-ink-950 text-white' : 'text-ink-500 hover:bg-ink-50')}
                  aria-pressed={trendMonths === item.value}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.45fr_.75fr]">
            <Card>
              <CardBody>
                {trend.some((item) => item.status === 'CALCULATED')
                  ? <TrendChart data={trend} />
                  : <div className="py-14 text-center text-sm text-ink-400">لا توجد بيانات اتجاه قابلة للحساب.</div>}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="تركيب النشاط" subtitle="الفئات القادمة من المصدر الكانوني" />
              <CardBody>
                {categories.length
                  ? <CategoryPieChart data={categories.map((item) => ({ ...item, name: item.categoryStatus === 'UNKNOWN' ? 'UNKNOWN' : item.name ?? 'UNKNOWN' }))} />
                  : <div className="py-14 text-center text-sm text-ink-400">لا توجد بيانات فئات.</div>}
              </CardBody>
            </Card>
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="فرص العملاء" subtitle="أعلى العملاء بحسب البيانات الحالية" />
          <CardBody>
            {topCustomers.length ? <HorizontalBarChart data={topCustomers} dataKey="value" nameKey="name" height={210} /> : <div className="py-12 text-center text-sm text-ink-400">لا توجد بيانات.</div>}
            <Link to="/customers" className="mt-3 flex items-center justify-center gap-1 text-[11px] font-bold text-primary-700">فتح العملاء <ArrowUpLeft size={13} /></Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="فرص المنتجات" subtitle="الأعلى حركة/قيمة في المصدر" />
          <CardBody>
            {topProducts.length ? <HorizontalBarChart data={topProducts} dataKey="value" nameKey="name" height={210} /> : <div className="py-12 text-center text-sm text-ink-400">لا توجد بيانات.</div>}
            <Link to="/products" className="mt-3 flex items-center justify-center gap-1 text-[11px] font-bold text-primary-700">فتح المنتجات <ArrowUpLeft size={13} /></Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="تحصيل وذمم"
            subtitle={aging.status === 'CALCULATED' && aging.totalAmount !== null ? 'الإجمالي: ' + formatCurrency(aging.totalAmount) : aging.status === 'NO_DATA' ? 'لا توجد بيانات ذمم' : 'بيانات غير كافية'}
          />
          <CardBody>
            <div className="space-y-1">
              {aging.rows.map((bucket) => (
                <div key={bucket.bucket} className="flex items-center justify-between border-b border-ink-100 py-2.5 last:border-b-0">
                  <span className="text-xs font-semibold text-ink-600">{bucket.bucket}</span>
                  <span className="text-xs tabular-nums text-ink-500">{bucket.amount === null ? 'UNKNOWN' : formatCurrency(bucket.amount)} · {bucket.count} فاتورة</span>
                </div>
              ))}
              {aging.unknownRows > 0 && <div className="pt-3 text-[11px] text-ink-400">UNKNOWN: {aging.unknownRows} فاتورة بلا تاريخ استحقاق.</div>}
            </div>
            <Link to="/reports/receivables" className="mt-3 flex items-center justify-center gap-1 text-[11px] font-bold text-primary-700">فتح التحصيل <ArrowUpLeft size={13} /></Link>
          </CardBody>
        </Card>
      </section>

      <section className="rounded-[14px] border border-ink-200 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="section-kicker">NEXT ACTION</div>
            <h2 className="mt-1 text-base font-black text-ink-950">المسار التالي المقترح</h2>
            <p className="mt-1 text-xs text-ink-500">احتفظ بالسياق وانتقل مباشرة من الصورة إلى التنفيذ أو الفحص بدل العودة إلى قائمة الصفحات.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/work-center" className="btn-secondary text-[11px]">مركز العمل <ArrowUpLeft size={13} /></Link>
            <Link to="/data-quality" className="btn-secondary text-[11px]">جودة البيانات <ArrowUpLeft size={13} /></Link>
            <Link to="/intelligence" className="btn-primary text-[11px]">القرار والذكاء <Brain size={13} /></Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-ink-200 bg-ink-200 sm:grid-cols-4">
        <div className="bg-white px-3.5 py-3"><div className="text-[10px] font-semibold text-ink-400">العملاء</div><div className="mt-1 text-[15px] font-black tabular-nums text-ink-900">{kpis.totalCustomers === null ? 'غير متاح' : kpis.totalCustomers}</div></div>
        <div className="bg-white px-3.5 py-3"><div className="text-[10px] font-semibold text-ink-400">المنتجات</div><div className="mt-1 text-[15px] font-black tabular-nums text-ink-900">{kpis.totalProducts === null ? 'غير متاح' : kpis.totalProducts}</div></div>
        <div className="bg-white px-3.5 py-3"><div className="text-[10px] font-semibold text-ink-400">الفواتير</div><div className="mt-1 text-[15px] font-black tabular-nums text-ink-900">{kpis.invoiceCount === null ? 'غير متاح' : kpis.invoiceCount}</div></div>
        <div className="bg-white px-3.5 py-3"><div className="text-[10px] font-semibold text-ink-400">التحصيل</div><div className="mt-1 text-[15px] font-black tabular-nums text-ink-900">{kpis.collectionRate === null ? 'غير متاح' : kpis.collectionRate + '%'}</div></div>
      </section>
    </div>
  );
}
