import { useEffect, useState, useCallback } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Users, Package, Brain, ArrowLeftRight, Wallet, Receipt, RefreshCw, CalendarRange, CheckCircle2, AlertTriangle, ArrowUpLeft, Database } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge, SeverityBadge, PriorityBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { TrendChart, CategoryPieChart, HorizontalBarChart } from '@/components/ui/Charts';
import { fetchDashboardSnapshot, fetchDashboardIntelligence } from '@/lib/dashboard-canonical';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Recommendation, Alert } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingDashboard } from '@/lib/dashboard-canonical';
import { Link } from 'react-router-dom';

const TREND_RANGES = [
  { value: 3, label: '3 أشهر' },
  { value: 6, label: '6 أشهر' },
  { value: 12, label: '12 شهرًا' },
] as const;

const metricStatus = (value: number | null): 'CONFIRMED' | 'INSUFFICIENT_DATA' => value === null ? 'INSUFFICIENT_DATA' : 'CONFIRMED';

const quickActions = [
  { path: '/import', icon: ArrowLeftRight, label: 'استيراد بيانات', description: 'إضافة مصدر جديد' },
  { path: '/reports', icon: Receipt, label: 'التقارير', description: 'استعراض النتائج' },
  { path: '/analytics', icon: TrendingUp, label: 'التحليلات', description: 'فهم الأداء' },
  { path: '/intelligence', icon: Brain, label: 'المساعد الذكي', description: 'توصيات قابلة للتنفيذ' },
  { path: '/customers', icon: Users, label: 'العملاء', description: 'الحسابات والحركة' },
  { path: '/inventory', icon: Package, label: 'المخزون', description: 'الكميات والقيمة' },
];

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
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

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      setError(null);
      const [{ kpis: k, trend: t, topCustomers: tc, topProducts: tp, categories: cat, aging: ag }, intelligence] = await Promise.all([
        fetchDashboardSnapshot(trendMonths),
        fetchDashboardIntelligence(),
      ]);
      setKpis(k);
      setTrend(t);
      setTopCustomers(tc.slice(0, 5));
      setTopProducts(tp.slice(0, 5));
      setCategories(cat);
      setAging(ag);
      setRecommendations(intelligence.recommendations);
      setAlerts(intelligence.alerts);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trendMonths]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState message="جارٍ تجهيز لوحة القيادة..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!kpis || !aging) return null;

  const categoryDisplay = categories.map(c => ({ ...c, name: c.categoryStatus === 'UNKNOWN' ? 'غير مصنف' : c.name ?? 'غير مصنف' }));
  const hasInsufficientData = kpis.status === 'INSUFFICIENT_DATA';
  const activeRecommendations = recommendations.filter(r => r.status === 'new' || r.status === 'accepted').slice(0, 4);
  const visibleAlerts = alerts.slice(0, 4);

  return (
    <div dir="rtl" className="space-y-6 pb-8 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute -left-16 -top-20 h-48 w-48 rounded-full bg-primary-50/70 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-semibold text-success-700 ring-1 ring-success-100">
                <CheckCircle2 size={13} aria-hidden="true" /> النظام يعمل
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-medium text-ink-500">
                <Database size={13} aria-hidden="true" /> مؤشرات من المصدر
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">لوحة القيادة</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-500">صورة تنفيذية مختصرة للأداء والمبيعات والذمم والمخزون وما يحتاج قرارًا الآن.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-ink-50/60 p-1" aria-label="الفترة الزمنية للرسم">
              <CalendarRange size={16} className="mx-2 text-ink-400" aria-hidden="true" />
              {TREND_RANGES.map(range => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => setTrendMonths(range.value)}
                  aria-pressed={trendMonths === range.value}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${trendMonths === range.value ? 'bg-white text-primary-700 shadow-sm ring-1 ring-ink-100' : 'text-ink-500 hover:bg-white hover:text-ink-800'}`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => void load(true)} disabled={refreshing} className="btn-secondary justify-center" aria-label="تحديث بيانات لوحة القيادة">
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span>تحديث</span>
            </button>
          </div>
        </div>

        {hasInsufficientData && (
          <div className="relative mt-5 flex items-start gap-3 rounded-2xl border border-warning-100 bg-warning-50/70 px-4 py-3 text-sm text-ink-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning-600" aria-hidden="true" />
            <div>
              <p className="font-semibold">بعض المؤشرات تحتاج بيانات مكتملة</p>
              <p className="mt-0.5 text-xs leading-5 text-ink-500">لن نعرض تقديرات بدل الحقيقة. أكمل الاستيراد أو راجع جودة البيانات للحصول على قراءة أدق.</p>
            </div>
            <Link to="/data-quality" className="mr-auto shrink-0 text-xs font-bold text-primary-700 hover:text-primary-800">مراجعة الجودة</Link>
          </div>
        )}
      </section>

      <section aria-label="المؤشرات الرئيسية">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold text-ink-900">المؤشرات الرئيسية</h2>
            <p className="mt-0.5 text-xs text-ink-400">أهم أرقام القرار في نظرة واحدة</p>
          </div>
          <span className="text-[11px] text-ink-400">محدثة عند آخر مزامنة</span>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KPICard label="إجمالي المبيعات" value={kpis.totalSales} format="currency" icon={<DollarSign size={17} />} status={metricStatus(kpis.totalSales)} />
          <KPICard label="إجمالي الربح" value={kpis.grossProfit} format="currency" icon={<TrendingUp size={17} />} status={metricStatus(kpis.grossProfit)} hint={kpis.grossMargin === null ? undefined : `هامش الربح ${kpis.grossMargin.toFixed(1)}%`} />
          <KPICard label="الذمم المدينة" value={kpis.totalReceivables} format="currency" icon={<Receipt size={17} />} status={metricStatus(kpis.totalReceivables)} />
          <KPICard label="قيمة المخزون" value={kpis.inventoryValue} format="currency" icon={<Package size={17} />} status={metricStatus(kpis.inventoryValue)} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KPICard label="عدد العملاء" value={kpis.totalCustomers} format="number" icon={<Users size={17} />} status={metricStatus(kpis.totalCustomers)} />
          <KPICard label="عدد المنتجات" value={kpis.totalProducts} format="number" icon={<Package size={17} />} status={metricStatus(kpis.totalProducts)} />
          <KPICard label="عدد الفواتير" value={kpis.invoiceCount} format="number" icon={<ShoppingCart size={17} />} status={metricStatus(kpis.invoiceCount)} />
          <KPICard label="معدل التحصيل" value={kpis.collectionRate} format="percent" icon={<Wallet size={17} />} status={metricStatus(kpis.collectionRate)} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader title="اتجاه المبيعات والربح" subtitle={`آخر ${trendMonths} أشهر`} action={<Badge variant="primary">اتجاه</Badge>} />
          <CardBody>
            <div className="min-h-[280px]">
              {trend.some(x => x.status === 'CALCULATED') ? <TrendChart data={trend} /> : (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-ink-50/60 text-center">
                  <TrendingUp size={28} className="text-ink-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-ink-600">لا توجد بيانات اتجاه قابلة للحساب</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-ink-400">بعد استيراد بيانات كافية ستظهر حركة المبيعات والربح هنا.</p>
                  <Link to="/import" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary-700">ابدأ الاستيراد <ArrowUpLeft size={14} /></Link>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader title="توزيع المبيعات حسب الفئة" subtitle="التصنيف المحسوب من المصدر" />
          <CardBody>
            <div className="min-h-[280px]">
              {categoryDisplay.length ? <CategoryPieChart data={categoryDisplay} /> : (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-ink-50/60 text-center">
                  <Package size={28} className="text-ink-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-ink-600">لا توجد بيانات فئات</p>
                  <p className="mt-1 text-xs text-ink-400">سيظهر التوزيع تلقائيًا عند توفر بيانات المبيعات.</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="مركز الانتباه" subtitle="ما يستحق المراجعة أولًا" action={<Link to="/intelligence" className="text-xs font-bold text-primary-700">عرض الكل</Link>} />
          <CardBody>
            <div className="space-y-2">
              {visibleAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-3 transition hover:border-ink-200 hover:bg-ink-50/40">
                  <SeverityBadge severity={alert.severity} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-800">{alert.title}</p>
                    {alert.description && <p className="mt-0.5 truncate text-xs text-ink-500">{alert.description}</p>}
                  </div>
                  <span className="shrink-0 text-[10px] text-ink-400">{relativeTime(alert.created_at)}</span>
                </div>
              ))}
              {visibleAlerts.length === 0 && <div className="rounded-2xl bg-success-50/60 px-4 py-8 text-center"><CheckCircle2 className="mx-auto text-success-600" size={26} /><p className="mt-2 text-sm font-semibold text-ink-700">لا توجد تنبيهات حرجة</p><p className="mt-1 text-xs text-ink-400">مركز الانتباه هادئ حاليًا.</p></div>}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="التوصيات النشطة" subtitle="خطوات مقترحة قابلة للمتابعة" action={<Link to="/intelligence/recommendations" className="text-xs font-bold text-primary-700">عرض الكل</Link>} />
          <CardBody>
            <div className="space-y-2">
              {activeRecommendations.map(recommendation => (
                <div key={recommendation.id} className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-3 transition hover:border-primary-100 hover:bg-primary-50/30">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Brain size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-ink-800">{recommendation.title}</span><PriorityBadge priority={recommendation.priority} /></div>
                    {recommendation.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-500">{recommendation.description}</p>}
                  </div>
                </div>
              ))}
              {activeRecommendations.length === 0 && <div className="rounded-2xl bg-ink-50/70 px-4 py-8 text-center"><Brain className="mx-auto text-ink-300" size={26} /><p className="mt-2 text-sm font-semibold text-ink-700">لا توجد توصيات نشطة</p><p className="mt-1 text-xs text-ink-400">ستظهر هنا التوصيات بعد تحليل بياناتك.</p></div>}
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card><CardHeader title="أفضل العملاء" subtitle="حسب قيمة الحركة" /><CardBody>{topCustomers.length ? <HorizontalBarChart data={topCustomers} dataKey="value" nameKey="name" height={220} /> : <p className="py-12 text-center text-sm text-ink-400">لا توجد بيانات عملاء قابلة للترتيب</p>}</CardBody></Card>
        <Card><CardHeader title="أفضل المنتجات" subtitle="حسب قيمة الحركة" /><CardBody>{topProducts.length ? <HorizontalBarChart data={topProducts} dataKey="value" nameKey="name" height={220} /> : <p className="py-12 text-center text-sm text-ink-400">لا توجد بيانات منتجات قابلة للترتيب</p>}</CardBody></Card>
        <Card>
          <CardHeader title="أعمار الذمم" subtitle={aging.status === 'CALCULATED' && aging.totalAmount !== null ? `الإجمالي: ${formatCurrency(aging.totalAmount)}` : aging.status === 'NO_DATA' ? 'لا توجد بيانات ذمم' : 'بيانات غير كافية'} />
          <CardBody>
            <div className="space-y-1">
              {aging.rows.map(bucket => <div key={bucket.bucket} className="flex items-center justify-between rounded-lg border-b border-ink-100 py-2.5"><span className="text-xs font-medium text-ink-600">{bucket.bucket}</span><span className="text-xs text-ink-500">{bucket.amount === null ? 'غير معروف' : formatCurrency(bucket.amount)} · {bucket.count} فاتورة</span></div>)}
              {aging.unknownRows > 0 && <p className="pt-2 text-[11px] text-ink-400">غير معروف: {aging.unknownRows} فاتورة بلا تاريخ استحقاق</p>}
            </div>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader title="إجراءات سريعة" subtitle="انتقل مباشرة إلى المهمة التي تريد إنجازها" />
        <CardBody>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {quickActions.map(({ path, icon: Icon, label, description }) => (
              <Link key={path} to={path} className="group rounded-2xl border border-ink-100 bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-50 text-ink-500 transition group-hover:bg-primary-100 group-hover:text-primary-700"><Icon size={18} /></span>
                <span className="mt-3 block text-xs font-bold text-ink-800">{label}</span>
                <span className="mt-1 block text-[10px] leading-4 text-ink-400">{description}</span>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
